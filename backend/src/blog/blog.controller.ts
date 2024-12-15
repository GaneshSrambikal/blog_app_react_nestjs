import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { createBlogSchema } from '../validators/blogValidator';
import { JoiValidationPipe } from 'src/validators/joiValidation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { User } from 'src/user/user.schema';
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('/blog/create-blog')
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @GetUser() user: User,
    @Body() body: CreateBlogDto,
  ) {
    const newBlog = await this.blogService.createBlog(user.id, body);
    return {
      message: `Blog created with ID: ${newBlog._id}`,
      id: newBlog._id,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllBlogs() {
    return this.blogService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/blog/:id')
  async findBlogById(@Param('id') id: string) {
    return this.blogService.findBlogById(id);
  }
}
