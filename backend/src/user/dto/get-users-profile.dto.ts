import { IsMongoId } from 'class-validator';

export class GetUserProfileDto {
  @IsMongoId({ message: 'Please enter a valid user Id.' })
  id: string;
}
