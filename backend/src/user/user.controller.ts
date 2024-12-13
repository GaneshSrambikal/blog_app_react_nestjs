import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
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
import { ValidateUserIdDto } from 'src/shared/dto/validate-user-id.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
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

  //  Upload avatar
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

  // generate avatar
  @Post('generate-avatar')
  @UseGuards(JwtAuthGuard)
  async generateAvatar(@Req() req: any) {
    const user = await this.userService.generateAvatar(req.user.id);

    return {
      message: 'File Upload successfully',
      user,
    };
  }

  // Get user current avatar url
  @Get('/user/:id/get-avatar-url')
  @UseGuards(JwtAuthGuard)
  async getUserCurrentAvatar(@Param() params: ValidateUserIdDto) {
    const { id } = params;

    return await this.userService.getUserCurrentAvatar(id);
  }

  // Forgot Password
  @Post('forgot-password')
  async forgotPassword(@Req() req: any, @Body() body: { email: string }) {
    return await this.userService.forgotPassword(req, body.email);
  }

  // Reset Password
  @Post('reset-password/:token')
  async resetPassword(
    @Param() params: { token: string },
    @Body() body: PasswordResetDto,
  ) {
    const { token } = params;
    const { password } = body;
    if (!token) {
      throw new BadRequestException('Invalid reset link. Please again.');
    }
    return await this.userService.resetPassword(token, password);
  }
}
