import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('/blog/create-blog')
  async createBlog(@Body() body: any) {
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
