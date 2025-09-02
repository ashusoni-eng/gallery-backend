import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { PrismaModule } from "../prisma/prisma.module";
import { MulterModule } from '@nestjs/platform-express';
import { BlacklistModule } from 'src/blacklist/blacklist.module';

@Module({
  imports: [
    PrismaModule,
    BlacklistModule,
    MulterModule.register({
      // Multer configuration can be global here, or per-route in controller
      // For now, I'll keep it minimal here as it's configured in the controller.
    }),
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}