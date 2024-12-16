import { IsMongoId } from 'class-validator';

export class DeleteCommentDto {
  @IsMongoId({ message: 'Please provide a valid blog id' })
  blogId: string;

  @IsMongoId({ message: 'Please provide a valid comment id' })
  commentId: string;
}
