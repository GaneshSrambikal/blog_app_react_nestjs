import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PasswordResetDto {
  @IsString({ message: 'Password must be string.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsNotEmpty({ message: 'Password can not be empty.' })
  password: string;
}
