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
    if (blog?.author?.id.toString() !== user.id) {
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

    return { comments: blog.comments.reverse() };
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

  // search blog by title content
  async searchBlogs(query) {
    const searchTerm = query.title || '';
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 1;
    const skip = (page - 1) * limit;

    let queryS = {};

    // sorting
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 1 : -1;
    const sortOrder = { [sortBy]: order };
    // filtering by author and date range
    const author = query.author;
    const startDate = query.startDate;
    const endDate = query.endDate;
    // build filter query
    // let filterQuery = {};
    let filterQuery = {
      title: { $regex: searchTerm, $options: 'i' },
    };
    // if (author) {
    //   filterQuery.author = author; // Ensure the author ID is passed correctly as an ObjectId
    // }

    // date range i.e (2024-05-01 to 2024-05-30)
    // if (startDate || endDate) {
    //   filterQuery.createdAt = {};
    //   if (startDate) {
    //     filterQuery.createdAt.$gte = new Date(startDate);
    //   }
    //   if (endDate) {
    //     filterQuery.createAt.$lte = new Date(endDate);
    //   }
    // }

    const blogs = await this.blogModel
      .find(filterQuery)

      .skip(skip)
      .limit(limit);

    const totalBlogCount = await this.blogModel.countDocuments({
      title: { $regex: searchTerm, $options: 'i' },
    });

    if (blogs.length === 0) {
      return {
        message: 'No Blogs found with the given title',
        blogs: [],
        totalBlogs: totalBlogCount,
      };
    }
    const totalPages = Math.ceil(totalBlogCount / limit);
    if (page > totalPages) {
      return {
        message: `Page ${page} does not exist. Only ${totalPages} available.`,
      };
    }

    return {
      blogs: blogs,
      totalBlogs: totalBlogCount,
      currentPage: page,
      totalPages,
    };
  }

  async searchByCategory(query) {
    const category = query.category || '';
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await this.blogModel.find({}).select('-_v');
    const byCategory = blogs.filter((blog) => blog.category === category);

    return {
      blogs: byCategory,
      totalBlogs: byCategory.length,
    };
  }
}
