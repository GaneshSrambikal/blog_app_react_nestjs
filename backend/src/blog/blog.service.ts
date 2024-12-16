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

  // Update blog by Id
  async updateBlogById(body, blogId, userId): Promise<Blog> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with ID:${blogId} not found.`);
    }
    if (blog?.author?.id.toString() !== userId) {
      throw new UnauthorizedException('Unauthorized request.');
    }

    const updatedBlog = await this.blogModel.findByIdAndUpdate(blogId, body, {
      new: true,
    });

    return updatedBlog;
  }

  // like a blog
  async likeBlogById(blogId, userId) {
    let message: Object = {};
    const user = await this.userModel.findById(userId);

    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with ID: ${blogId} not found.`);
    }

    if (!blog.likes.includes(userId)) {
      blog.likes.push(user.id);
      await this.blogModel.findByIdAndUpdate(blogId, blog, { new: true });

      message = {
        message: `Liked the blog post: ${blogId}`,
        userId: userId,
      };
    } else {
      blog.likes = blog.likes.filter((like) => like.toString() !== userId);
      await this.blogModel.findByIdAndUpdate(blogId, blog, { new: true });

      message = {
        message: `Un Liked the blog post: ${blogId}`,
        userId: userId,
      };
    }
    return message;
  }

  // comment on blog
  async commentOnBlog(comment, blogId, userId) {
    const user = await this.userModel.findById(userId);

    const blog = await this.blogModel.findById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found.');
    }

    const newComment = {
      text: comment,
      author: {
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    };
    blog.comments.push(newComment);
    await this.blogModel.findByIdAndUpdate(blogId, blog, { new: true });
    return {
      message: 'Comment added successfully.',
    };
  }

  // Get all comment on blog
  async getAllCommentOnBlog(blogId) {
    const blog = await this.blogModel.findById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog.comments.reverse();
  }

  // delete comment
  async deleteComment(blogId, commentId) {
    const blog = await this.blogModel.findById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    let comments = [];
    let flag = false;
    blog.comments.forEach((cmt) => {
      if (cmt['_id'].toString() == commentId) {
        flag = true;
      } else {
        comments.push(cmt);
      }
    });

    if (!flag) {
      throw new NotFoundException('Comment not found');
    }

    blog.comments = comments;
    await this.blogModel.findByIdAndUpdate(blogId, blog, { new: true });
    return {
      message: 'Comment deleted successfully.',
    };
  
  }
}
