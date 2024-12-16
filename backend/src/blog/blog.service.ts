import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blog.schema';
import { isValidObjectId, Model } from 'mongoose';
import { User } from 'src/user/user.schema';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createBlog(userId, body): Promise<Blog> {
    const { title, content, excerpt, category, heroImage } = body;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const blog = {
      author: {
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      title,
      content,
      excerpt,
      category,
      heroImage,
    };
    const newBlog = new this.blogModel(blog);
    return newBlog.save();
  }
  // delete blog by id
  async deleteBlogById(user, blogId) {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found.');
    }
    if (blog?.author?.id !== user._id) {
      throw new UnauthorizedException('Not authorized.');
    }
    const deletedBlog = await this.blogModel.findByIdAndDelete(blogId);
    return {
      deletedBlog,
    };
  }
  // get all blogs
  async findAll(): Promise<Blog[]> {
    return await this.blogModel.find({}).sort({ createdAt: -1 }).exec();
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
