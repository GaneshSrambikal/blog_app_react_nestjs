import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
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
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

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
      return await this.userModel.findById(userId).select(['-password','-__v']).exec();
    } catch (error) {
      throw new HttpException(
        'Error fetching user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
