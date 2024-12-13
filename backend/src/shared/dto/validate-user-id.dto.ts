import { IsMongoId } from 'class-validator';

export class ValidateUserIdDto {
  @IsMongoId({ message: 'Please enter a valid user Id.' })
  id: string;
}
