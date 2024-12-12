import {
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
  UseGuards,
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
}
