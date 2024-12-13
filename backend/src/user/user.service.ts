import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { createUserSchema } from 'src/validators/userValidator';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
// import cloudinary from 'src/cloudinary/cloudinary.config';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { getRandomAvatarbyGender } from 'src/utils/avatar.util';
import { Request } from 'express';
import { sendEmail } from 'src/utils/mailer.util';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async registerUser(data: RegisterUserDto): Promise<User> {
    //    find user with the email if exist
    const userExist = await this.userModel
      .findOne({ email: data.email })
      .exec();

    if (userExist) {
      throw new BadRequestException('Email is already taken.');
    }

    const newUser = new this.userModel(data);
    await newUser.save();

    return newUser;
  }

  async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<{ token: string; user: Partial<User> }> {
    const { email, password } = loginUserDto;
    // find the user with email
    const user = await this.userModel
      .findOne({ email: email })
      .select('+password')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    } else {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new BadRequestException('Invalid password');
      }

      const payload = { id: user._id, email: user.email, name: user.name };

      const token = this.jwtService.sign(payload);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      };
    }
  }

  async getProfile(userId: string): Promise<User | null> {
    try {
      return await this.userModel
        .findById(userId)
        .select(['-password', '-__v'])
        .exec();
    } catch (error) {
      throw new HttpException(
        'Error fetching user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUsersProfile(userId: string) {
    try {
      return await this.userModel
        .findById(userId)
        .select(['-password', '-__v'])
        .exec();
    } catch (error) {
      throw new HttpException(
        'Error fetching user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel
      .findById(userId)
      .select('-password -following -followers');

    if (!user) {
      throw new NotFoundException('User not Found!');
    }
    if (user) {
      user.name = updateProfileDto?.name || user.name;
      user.gender = updateProfileDto?.gender || user.gender;
      user.address = updateProfileDto?.address || user.address;
      user.dob = updateProfileDto?.dob || user.dob;
      user.title = updateProfileDto?.title || user?.title;
      user.about = updateProfileDto?.about || user?.about;

      const updatedUser = await user.save();

      return {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        title: updatedUser.title,
        about: updatedUser.about,
        username: updatedUser.username,
        joined: updatedUser.joined,
        avatar_url: updatedUser.avatar_url,
        // followers: updatedUser.followers,
        // following: updatedUser.following,
      };
    }
  }

  // Upload Avatar
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.avatar_url = avatarUrl;

    return await user.save();
  }

  // cloudinary

  async uploadImage(
    filePath: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        { folder: 'blog_app_react_node' },
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        },
      );
    });
  }

  // Generate Avatar
  async generateAvatar(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.avatar_url = getRandomAvatarbyGender(user.gender);
    return await user.save();
  }

  // Get users current avatar
  async getUserCurrentAvatar(userId: string): Promise<Partial<User> | null> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { avatar_url: user.avatar_url };
  }

  // forgot Password
  async forgotPassword(req: Request, email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException(`User with email: ${email} not found.`);
    }

    // generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // set token and expiration on user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save();

    // send reset token via email
    const resetUrl = `${req.protocol}://${req.get(`host`)}/api/users/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`;

    // send email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      text: message,
      html: `<h1>You requested a password reset. Please click the following link to reset your password: <a href=${resetUrl}>reset password</a></h1>`,
    });
    
    return {
      message: 'Password reset link sent to email',
      link: resetUrl,
      resetToken: resetToken,
    };
  }
}
