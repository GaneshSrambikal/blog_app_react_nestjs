import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { getReadingTime } from 'src/utils/commons';

// comment subdocument schema
@Schema({ timestamps: true })
export class Comment {

  @Prop({
    type: {
      id: { type: Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      avatar_url: { type: String },
    },
    _id: false,
  })
  author: { id: Types.ObjectId; name: string; avatar_url: string };

  @Prop({ type: String, required: true, trim: true })
  text: string;
}

@Schema({ timestamps: true })
export class Blog extends Document {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String, length: 250 })
  excerpt: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({
    type: {
      id: { type: Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      avatar_url: { type: String },
    },
    _id: false,
  })
  author: { id: Types.ObjectId; name: string; avatar_url: string };

  @Prop({ type: String, required: true })
  heroImage: string;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Number })
  readingTime: number;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  likes: Types.ObjectId[];

  @Prop({ type: [SchemaFactory.createForClass(Comment)] })
  comments: Comment[];
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.readingTime = getReadingTime(this.content);
    next();
  }
});
