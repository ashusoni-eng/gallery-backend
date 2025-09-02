import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { GalleryService } from "./gallery.service";
import { CreateGalleryDto } from "./dto/create-gallery.dto";
import { UpdateGalleryDto } from "./dto/update-gallery.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Request } from "express";
import * as path from "path";

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 20; // Total size for all files

@Controller("gallery")
@UseGuards(JwtAuthGuard)
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post("upload")
  @UseInterceptors(
    FilesInterceptor("images", MAX_FILES, {
      storage: diskStorage({
        destination: "./uploads/gallery", // Ensure this directory exists
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${path.extname(
              file.originalname
            )}`
          );
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // 20 MB in bytes
      },
    })
  )
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_MB * 1024 * 1024 }),
          // new FileTypeValidator({ fileType: /^(image\/jpeg|image\/jpg|image\/png|image\/gif)$/ }),
        ],
      })
    )
    files: Array<Express.Multer.File>,
    @Req() req: Request,
    @Body("categoryId") categoryId?: string // Add categoryId from body
  ) {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }

    const filePaths = files.map((file) => file.path);
    // Pass user.sub (userId) to the service, not uploadedBy from body
    return this.galleryService.create(files, user.sub, categoryId);
  }

  @Post() // This is for creating gallery entries without file upload, if needed.
  create(@Body() createGalleryDto: CreateGalleryDto, @Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    throw new Error("Use /gallery/upload for file uploads.");
  }

  @Get()
  findAll(@Query("categoryId") categoryId?: string) {
    return this.galleryService.findAll(categoryId);
  }

  @Get(":id")
  findOne(@Param(":id") id: string) {
    return this.galleryService.findOne(id);
  }

  @Patch(":id")
  update(@Param(":id") id: string, @Body() updateGalleryDto: UpdateGalleryDto) {
    return this.galleryService.update(id, updateGalleryDto);
  }

  @Delete(":id")
  remove(@Param(":id") id: string) {
    return this.galleryService.remove(id);
  }
}
