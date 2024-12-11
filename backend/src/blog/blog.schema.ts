import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { getReadingTime } from 'src/utils/commons';
@Schema({ timestamps: true })
export class Blog extends Document {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  excerpt: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Number })
  readingTime: number;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.readingTime = getReadingTime(this.content);
    next();
  }
});
