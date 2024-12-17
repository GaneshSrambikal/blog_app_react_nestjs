import { IsMongoId } from 'class-validator';

export class DeleteBlogDto {
  @IsMongoId({ message: 'Invalid Blog Id, Please try with valid id.' })
  id: string;
}
