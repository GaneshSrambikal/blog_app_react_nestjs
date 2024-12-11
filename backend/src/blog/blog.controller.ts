import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { createBlogSchema } from '../validators/blogValidator';
import { JoiValidationPipe } from 'src/validators/joiValidation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/blog/create-blog')
  async createBlog(@Body(new JoiValidationPipe(createBlogSchema)) body: any) {
    return this.blogService.createBlog(body);
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
