import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = ServiceEntity & Document;

@Schema({ _id: false })
class PriceRange {
  @Prop({ required: true, min: 0 })
  min!: number;

  @Prop({ required: true, min: 0 })
  max!: number;
}

@Schema({ _id: false })
class FixingSteps {
  @Prop({ type: [String], default: [] })
  includes?: string[];

  @Prop({ type: [String], default: [] })
  doesNotInclude?: string[];
}

/********************will be separated ************ */
@Schema({ _id: true })
class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ trim: true })
  userName?: string;

  @Prop({ trim: true })
  userAvatar?: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ required: true, trim: true })
  text!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}
/********************************************************* */
@Schema({ timestamps: true })
export class ServiceEntity {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  key!: string; // e.g. "FIX_LEAKAGE"

  @Prop({ required: true, unique: true, trim: true })
  name!: string; // Arabic only e.g. "تصليح تسريب"

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  image?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category!: Types.ObjectId;

  @Prop({ type: FixingSteps, default: () => ({}) })
  fixingSteps?: FixingSteps;

  @Prop({ type: PriceRange, required: true })
  priceRange!: PriceRange;

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating?: number;

  @Prop({ default: 0 })
  totalRatings?: number;

  @Prop({ type: [Comment], default: [] })
  comments?: Comment[];

  @Prop({ default: true })
  isActive?: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(ServiceEntity);
//  pre save
ServiceSchema.pre('save', async function () {
  if (this.category && typeof this.category === 'string') {
    this.category = new Types.ObjectId(this.category as string);
  }
});

//pre update
ServiceSchema.pre(
  ['findOneAndUpdate', 'updateOne', 'updateMany'],
  async function () {
    const update = this.getUpdate() as any;
    if (update?.category && typeof update.category === 'string') {
      update.category = new Types.ObjectId(update.category);
    }
  },
);
ServiceSchema.index({ category: 1, isActive: 1 });
