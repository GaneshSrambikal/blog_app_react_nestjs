import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUserProfileDto } from './dto/get-users-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { User } from './user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer-config';
import * as fs from 'fs';
import cloudinary from 'src/cloudinary/cloudinary.config';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Register a User
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async registerUser(@Body() data: RegisterUserDto) {
    return this.userService.registerUser(data);
  }

  // Get User Profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    try {
      const user = await this.userService.getProfile(req.user.id);

      if (!user) {
        throw new NotFoundException('user not found!.');
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get Users Profile
  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getUsersProfile(@Param() params: GetUserProfileDto) {
    const { id } = params;
    try {
      const user = await this.userService.getUsersProfile(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetUser() user: User,
  ) {
    try {
      const updatedUser = await this.userService.updateProfile(
        user.id,
        updateProfileDto,
      );

      return {
        message: 'Profile updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // upload avatar
  // @Post('upload-avatar')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('image', multerConfig))
  // async uploadAvatar(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() req: any,
  // ) {
  //   console.log(req.user.id);
  //   if (!file) {
  //     throw new BadRequestException('No file uploaded.');
  //   }
  //   console.log(file.path);
  //   try {
  //     const result = await cloudinary.uploader.upload(file.path, {
  //       folder: 'blog_app_react_node',
  //       allowed_formats: ['jpg', 'png'],
  //       transformation: [{ width: 500, height: 500, crop: 'fill' }],
  //     });
  //     console.log(result);
  //     // clean up local file
  //     fs.unlinkSync(file.path);

  //     // update user record
  //     const userId = req.user.id;
  //     const updatedUser = await this.userService.uploadAvatar(
  //       userId,
  //       result.secure_url,
  //     );

  //     return {
  //       message: 'Avatar uploaded successfully',
  //       avatarUrl: result.secure_url,
  //       user: updatedUser,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException('Failed to upload avatar.');
  //   }
  // }

  // upload avatar
  // upload avatar
  // @Post('upload-avatar')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('image', multerConfig))
  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    try {
      const result = await this.userService.uploadImage(file.path);
      // clean the local file at ./upload
      fs.unlinkSync(file.path);

      // update user avatar
      let userId = req.user.id;
      let avatarUrl = result?.secure_url;
      const updatedUser = await this.userService.updateAvatar(
        userId,
        avatarUrl,
      );
      return {
        message: 'Profile avatar updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error uploading image', error);
      throw new BadRequestException(error.message);
    }
  }
}
