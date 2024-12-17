import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: String, required: true })
  paymentId: string;

  @Prop({ type: Number, required: true })
  noOfCredits: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userEmail: string;

  @Prop({ type: String, required: true })
  platform: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

