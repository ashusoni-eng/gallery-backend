import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { AppConfigService } from "../config/config.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AccountType, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon2 from "argon2";

@Injectable()
export class AuthService { 

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: AppConfigService,    
  ) {
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Your account has been deactivated. Please contact support for assistance.");
    }

    if (!user.password) {
      throw new UnauthorizedException(
        "Password login not available for this account"
      );
    }

    const passwordIsValid = await this.usersService.verifyPassword(
      user.password,
      password
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async login(user: User, otp?: string) {
    const tokens = await this.getTokens(user.id, user.email, user.accountType);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      message: "Login successful",    
      otp: otp,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        accountType: user.accountType,
      },
      ...tokens,
    };
  }

  async loginWithCredentials(loginDto: LoginDto) {
    loginDto.email = loginDto.email.toLowerCase();

    const user = await this.validateUser(loginDto.email, loginDto.password);    

    // Agar verified hai, token generate karo
    const tokens = await this.getTokens(user.id, user.email, user.accountType);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      message: "Login successful",
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType,        
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    // Generate tokens after successful registration
    const tokens = await this.getTokens(user.id, user.email, user.accountType);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken); // Update refresh token in DB

    return {
      message: "Registration successful.",    
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
      },
      ...tokens, // Include tokens in the response
    };
  }


  private async getTokens(
    userId: string,
    email: string,
    accountType: AccountType
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          accountType,
        },
        {
          secret: this.configService.get<string>("JWT_SECRET"),
          expiresIn: this.configService.get<string>("JWT_EXPIRES_IN"),
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          accountType,
        },
        {
          secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
          expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}