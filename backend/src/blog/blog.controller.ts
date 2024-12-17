import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { DeleteBlogDto } from './dto/delete-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ValidateBlogIdDto } from './dto/validate-blog-id.dto';
import { CommentBodyDto } from './dto/comment-body-dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Create a blog
  @Post('/blog/create-blog')
  @UseGuards(JwtAuthGuard)
  async createBlog(@GetUser() user: User, @Body() body: CreateBlogDto) {
    const newBlog = await this.blogService.createBlog(user.id, body);
    return {
      message: `Blog created with ID: ${newBlog._id}`,
      id: newBlog._id,
    };
  }

  // Delete a blog
  @Delete('/blog/:id')
  @UseGuards(JwtAuthGuard)
  async deleteBlogById(@Param() param: DeleteBlogDto, @GetUser() user: User) {
    const { deletedBlog } = await this.blogService.deleteBlogById(
      user,
      param.id,
    );

    return {
      message: `Deleted Blog. Id: ${deletedBlog.id}`,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllBlogs() {
    const blogs = await this.blogService.findAll();
    return { blogs };
  }

  @Get('/blog/:id')
  @UseGuards(JwtAuthGuard)
  async findBlogById(@Param('id') id: string) {
    const blog = await this.blogService.findBlogById(id);
    return { blog };
  }

  // Update the blog
  @Put('/blog/:id')
  @UseGuards(JwtAuthGuard)
  async updateBlogById(
    @Body() body: UpdateBlogDto,
    @Param() params: ValidateBlogIdDto,
    @GetUser() user: User,
  ) {
    const updatedBlog = await this.blogService.updateBlogById(
      body,
      params.id,
      user.id,
    );

    return {
      message: 'Updated Blog successfully',
      blog_id: params.id,
      blog: updatedBlog,
    };
  }

  // LIKES AND COMMENTS
  @Post('/:id/like')
  @UseGuards(JwtAuthGuard)
  async likeBlogById(@Param() param: ValidateBlogIdDto, @GetUser() user: User) {
    console.log(user);
    return await this.blogService.likeBlogById(param.id, user.id);
  }

  // comment on blog
  @Post('/:id/comment')
  @UseGuards(JwtAuthGuard)
  async commentOnBlog(
    @Body() body: CommentBodyDto,
    @Param() param: ValidateBlogIdDto,
    @GetUser() user: User,
  ) {
    return await this.blogService.commentOnBlog(
      body.comment,
      param.id,
      user.id,
    );
  }

  // get all comment of a blog
  @Get('/:id/comment')
  @UseGuards(JwtAuthGuard)
  async getAllCommentOnBlog(@Param() param: ValidateBlogIdDto) {
    return await this.blogService.getAllCommentOnBlog(param.id);
  }

  // Delete a comment
  @Delete('/:blogId/comment/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param() param: DeleteCommentDto) {
    return await this.blogService.deleteComment(param.blogId, param.commentId);
  }

  // Search blogs
  @Get('/searchblog')
  async searchBlogs(@Query() query: any) {
    return await this.blogService.searchBlogs(query);
  }

  // search by category
  @Post('search/category')
  async searchByCategory(@Query() query: any) {
    return await this.blogService.searchByCategory(query);
  }
}
