import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, type: String, unique: true, trim: true })
  username: string;

  @Prop({ required: true, type: String, trim: true })
  name: string;

  @Prop({ required: true, type: String, enum: ['male', 'female', 'other'] })
  gender: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String, trim: true })
  about: string;

  @Prop({
    required: true,
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  })
  email: string;

  @Prop({ required: true, type: String, minlength: 6, select: false })
  password: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ required: true, type: Date })
  dob: Date;

  @Prop({ type: String, default: Date.now })
  joined: string;

  @Prop({
    type: String,
    default:
      'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg',
  })
  avatar_url: string;

  @Prop({ type: Number, default: 10 })
  rewards: number;

  @Prop({ type: Number, default: 100 })
  totalAiCredit: number;

  @Prop({ required: true, type: Boolean, default: false })
  isAdmin: boolean;

  @Prop({ type: String, default: undefined, trim: true })
  resetPasswordToken: string;

  @Prop({ type: Number, default: undefined })
  resetPasswordExpire: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save middleware for password hashing
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// compare password
UserSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};
