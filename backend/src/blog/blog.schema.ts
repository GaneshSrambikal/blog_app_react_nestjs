import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true})
export class Blog extends Document{
    @Prop({required: true})
    title: String

    @Prop({required: true})
    content: String

}

export const BlogSchema = SchemaFactory.createForClass(Blog)