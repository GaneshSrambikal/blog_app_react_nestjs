import { IsMongoId } from 'class-validator';

export class ValidateBlogIdDto {
  @IsMongoId({ message: 'Please provide a valid id.' })
  id: string;
}
