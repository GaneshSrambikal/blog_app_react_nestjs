import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Address cannot be empty' })
  address?: string;

  @IsOptional()
  @IsDateString()
  // @IsDate()
  dob?: Date;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'], {
    message: 'Gender must be either male, female, or other',
  })
  gender?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  about?: string;
}
