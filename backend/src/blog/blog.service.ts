import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blog.schema';
import { isValidObjectId, Model } from 'mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async createBlog(createBlogDto: CreateBlogDto): Promise<Blog> {
    const newBlog = new this.blogModel(createBlogDto);
    return newBlog.save();
  }

  async findAll(): Promise<Blog[]> {
    return await this.blogModel.find().exec();
  }

  async findBlogById(id: string): Promise<Blog> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Please provide the correct id.');
    }
    const blog = await this.blogModel.findById(id).exec();

    if (!blog) {
      throw new NotFoundException(`Blog with ${id} not found.`);
    }
    return blog;
  }
}
