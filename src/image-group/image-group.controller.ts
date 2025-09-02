import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { ImageGroupService } from './image-group.service';
import { CreateImageGroupDto } from './dto/create-image-group.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('image-group')
@UseGuards(JwtAuthGuard)
export class ImageGroupController {
  constructor(private readonly imageGroupService: ImageGroupService) {}

  @Post()
  create(@Body() createImageGroupDto: CreateImageGroupDto, @Req() req: Request) {
    // You might want to associate the image group with the user who created it
    // const userId = req.user?.sub;
    return this.imageGroupService.create(createImageGroupDto);
  }

  @Get()
  findAll() {
    return this.imageGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageGroupService.findOne(id);
  }
}
