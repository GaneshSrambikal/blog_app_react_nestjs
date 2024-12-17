import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { UserService } from 'src/user/user.service';

@Controller('/api/auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.userService.loginUser(loginUserDto);
  }

  @Post('logout')
  async logoutUser() {}
}
