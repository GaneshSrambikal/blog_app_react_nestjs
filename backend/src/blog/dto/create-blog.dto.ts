import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  // @IsString()
  // @IsNotEmpty()
  // @MaxLength(10)
  // excerpt: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
