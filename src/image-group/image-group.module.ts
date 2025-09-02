import { Module } from '@nestjs/common';
import { ImageGroupService } from './image-group.service';
import { ImageGroupController } from './image-group.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlacklistModule } from 'src/blacklist/blacklist.module';

@Module({
  imports: [BlacklistModule],
  controllers: [ImageGroupController],
  providers: [ImageGroupService, PrismaService],
})
export class ImageGroupModule {}
