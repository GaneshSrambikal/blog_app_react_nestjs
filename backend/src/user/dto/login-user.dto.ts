import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  constructor() {}

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
  
}
