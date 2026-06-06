import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CLIENT = 'client',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({ timestamps: true })
export class User {
  // ========== BASIC INFO ==========

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ unique: true, sparse: true, trim: true })
  phone: string;


  @Prop({ enum: Gender })
  gender: Gender;

  // ========== AUTH ==========

  @Prop({ enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop()
  refreshToken?: string;

  // ========== ROLE ==========

  @Prop({ enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  // ========== LOCATION ==========

  @Prop()
  governorate: string;

  @Prop()
  city: string;

  // ========== EMAIL VERIFICATION ==========

  @Prop()
  verificationToken?: string;

  @Prop()
  verificationTokenExpires?: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  otp?: string;

  @Prop()
  otpExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('findOneAndDelete', async function () {
  const user = await this.model.findOne(this.getFilter());
  if (user && user.role === 'technician') {
    await mongoose.model('Technician').findOneAndDelete({ userId: user._id });
  }
});
