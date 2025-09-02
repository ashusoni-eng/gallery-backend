import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaModule } from "../prisma/prisma.module";
import { BlacklistModule } from 'src/blacklist/blacklist.module';

@Module({
  imports: [PrismaModule, BlacklistModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}