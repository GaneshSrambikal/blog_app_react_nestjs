import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CommentBodyDto {
  @IsString({ message: 'Comment should be a string.' })
  @IsNotEmpty({ message: 'Comment should not be empty.' })
  @MinLength(1)
  @MaxLength(80, { message: 'Comment should only be 80 characters long.' })
  comment: string;
}
