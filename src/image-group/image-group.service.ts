import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateImageGroupDto } from './dto/create-image-group.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageGroupService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

  async create(createImageGroupDto: CreateImageGroupDto) {
    const { imageIds, groupName } = createImageGroupDto;

    // Create a new ImageGroup record
    const imageGroup = await this.prisma.imageGroup.create({
      data: {
        groupName,
        images: {
          connect: imageIds.map(id => ({ id })),
        },
      },
    });

    return imageGroup;
  }

  async findAll() {
    const baseUrl = this.configService.get<string>('APP_BASE_URL');
    const imageGroups = await this.prisma.imageGroup.findMany({
      include: {
        images: {
          select: { id: true, path: true, fileName: true },
        },
      },
    });

    return imageGroups.map(group => ({
      ...group,
      images: group.images.map(image => ({
        ...image,
        url: `${baseUrl}/${image.path}`,
      })),
    }));
  }

  async findOne(id: string) {
    const baseUrl = this.configService.get<string>('APP_BASE_URL');
    const imageGroup = await this.prisma.imageGroup.findUnique({
      where: { id },
      include: {
        images: {
          select: { id: true, path: true, fileName: true },
        },
      },
    });

    if (!imageGroup) {
      return null;
    }

    return {
      ...imageGroup,
      images: imageGroup.images.map(image => ({
        ...image,
        url: `${baseUrl}/${image.path}`,
      })),
    };
  }
}
