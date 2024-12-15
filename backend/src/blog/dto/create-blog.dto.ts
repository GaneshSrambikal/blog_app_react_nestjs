import { IsNotEmpty, IsObject, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogDto {
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title is required.' })
  @MinLength(10, { message: 'Title must be at least 10 characters long.' })
  title: string;

  @IsString({ message: 'Excerpt must be a string.' })
  @IsNotEmpty({ message: 'Excerpt is required.' })
  @MaxLength(250, { message: 'Excerpt must be 250 characters only.' })
  excerpt: string;

  @IsNotEmpty({ message: 'Content is required.' })
  @IsString({ message: 'Content must be string.' })
  @MinLength(10, { message: 'Content must be at least 10 characters long.' })
  content: string;

  @IsString({ message: 'Category must be a string.' })
  @IsNotEmpty({ message: 'Category should not be empty' })
  category: string;

  @IsString({ message: 'heroImage must be a string' })
  heroImage: string;

  
}
