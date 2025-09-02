import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

  create(createCategoryDto: CreateCategoryDto, userId: string) {    
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        createdBy: userId,
      },
    });
  }

  async findAll() {
    const baseUrl = this.configService.get<string>('APP_BASE_URL');
    const categories = await this.prisma.category.findMany({
      include: {
        gallery: {
          select: { path: true },
        },
        user: {
          select: { fullName: true },
        },
      },
    });

    return categories.map(category => {
      const randomImage = category.gallery.length > 0
        ? category.gallery[Math.floor(Math.random() * category.gallery.length)]
        : null;
      const thumbnailUrl = randomImage ? `${baseUrl}/${randomImage.path}` : null;
      return { ...category, thumbnailUrl, creatorName: category.user.fullName };
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}