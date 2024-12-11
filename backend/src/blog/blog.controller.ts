import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { createBlogSchema } from '../validators/blogValidator';
import { JoiValidationPipe } from 'src/validators/joiValidation.pipe';
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('/blog/create-blog')
  async createBlog(@Body(new JoiValidationPipe(createBlogSchema)) body: any) {
    return this.blogService.createBlog(body);
  }

  @Get()
  async findAllBlogs() {
    return this.blogService.findAll();
  }

  @Get('/blog/:id')
  async findBlogById(@Param('id') id: string) {
    return this.blogService.findBlogById(id);
  }
}
