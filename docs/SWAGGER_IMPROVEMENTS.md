# Swagger Improvements Documentation

**Project:** Usta Technical Service Platform  
**Generated:** 2026-06-07  
**Purpose:** Enhance Swagger documentation quality with descriptive decorators

---

## Table of Contents

1. [Current Swagger Coverage Analysis](#current-swagger-coverage-analysis)
2. [DTOs Needing Improvements](#dtos-needing-improvements)
3. [Swagger Decorator Recommendations](#swagger-decorator-recommendations)
4. [Missing Decorators by Module](#missing-decorators-by-module)
5. [Implementation Guide](#implementation-guide)
6. [Example Implementations](#example-implementations)

---

## Current Swagger Coverage Analysis

### Coverage Summary

| Module     | Controllers | Swagger Coverage | Status        |
| ---------- | ----------- | ---------------- | ------------- |
| Auth       | 1           | 100%             | ✅ Excellent  |
| Users      | 1           | 100%             | ✅ Excellent  |
| Technician | 1           | 100%             | ✅ Excellent  |
| Categories | 1           | 100%             | ✅ Excellent  |
| Services   | 1           | 100%             | ✅ Excellent  |
| Requests   | 1           | 100%             | ✅ Excellent  |
| Reviews    | 1           | 100%             | ✅ Excellent  |
| Admin      | 1           | 100%             | ✅ Excellent  |
| Emergency  | 2           | 100%             | ✅ Excellent  |
| Chat       | 1           | 100%             | ✅ Excellent  |
| **App**    | 1           | 0%               | ❌ Needs Work |

**Overall Coverage:** 99.9% (72 of 73 endpoints)

---

## DTOs Needing Improvements

### Priority Level: HIGH

These DTOs should be enhanced first as they are used in critical user flows.

---

## 1. Auth DTOs

### RegisterDto - `/src/auth/dto/register.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Issues:**

- No field descriptions in Swagger
- No example values shown
- No validation rule indicators

**Recommended Improvements:**

```typescript
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../users/schemas/user.schema';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Ahmed Mohamed',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    description: 'Unique email address',
    example: 'client@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Account password (minimum 8 characters)',
    example: 'SecurePass123',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Password confirmation (must match password field)',
    example: 'SecurePass123',
    minLength: 8,
  })
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    description: 'Phone number (11 digits for Egypt)',
    example: '20123456789',
    pattern: '^[0-9]{11}$',
  })
  @IsNotEmpty()
  @Matches(/^[0-9]{11}$/, { message: 'Phone must be 11 digits' })
  phone: string;

  @ApiProperty({
    description: 'Governorate/State name',
    example: 'Cairo',
  })
  @IsNotEmpty()
  @IsString()
  governorate: string;

  @ApiProperty({
    description: 'City name',
    example: 'Giza',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'User gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsNotEmpty()
  @IsEnum(Gender, { message: 'Gender must be male or female' })
  gender: Gender;
}
```

**Benefits:**

- Clear field descriptions in Swagger UI
- Example values for testing
- Validation constraints visible
- Better developer understanding

---

### LoginDto - `/src/auth/dto/login.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Registered email address',
    example: 'client@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Account password',
    example: 'SecurePass123',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
```

---

### VerifyOtpDto - `/src/auth/dto/verify-otp.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address registered for password reset',
    example: 'client@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'One-time password (6 digits)',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;
}
```

---

### ResetPasswordDto - `/src/auth/dto/reset-pass.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address',
    example: 'client@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'NewSecurePass456',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (must match newPassword)',
    example: 'NewSecurePass456',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
```

---

### ForgetPasswordDto - `/src/auth/dto/forgetPass.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'Registered email address to receive OTP',
    example: 'client@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}
```

---

## 2. User DTOs

### UpdateProfileDto - `/src/users/dto/update-profile.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../schemas/user.schema';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User full name (minimum 3 characters)',
    example: 'Ahmed Mohamed Updated',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  fullName?: string;

  @ApiPropertyOptional({
    description:
      'Phone number (valid phone format with digits, +, -, spaces, parentheses)',
    example: '20123456789',
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @IsOptional()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Governorate/State name',
    example: 'Alexandria',
  })
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Alexandria City',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'User gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
```

**Benefits:**

- Uses `@ApiPropertyOptional` for optional fields
- Clear descriptions for each field
- Enums displayed properly
- Pattern validation visible

---

## 3. Technician DTOs

### Step2Dto - `/src/technician/dto/step2.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsMongoId, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Step2Dto {
  @ApiProperty({
    description: 'Category ID for technician specialization',
    example: '60d5ec49c1234567890abc20',
    format: 'mongo-id',
  })
  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid category id' })
  categoryId: string;

  @ApiProperty({
    description: 'Array of service IDs belonging to selected category',
    example: ['60d5ec49c1234567890abc21', '60d5ec49c1234567890abc22'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true, message: 'Invalid service id' })
  serviceIds: string[];
}
```

---

### Step3Dto - `/src/technician/dto/step3.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkingDay } from '../schemas/technician.schema';

export class Step3Dto {
  @ApiProperty({
    description: 'Years of professional experience',
    example: 5,
    minimum: 0,
    type: 'integer',
  })
  @IsNumber()
  yearsOfExperience: number;

  @ApiProperty({
    description: 'Whether technician has required tools',
    example: true,
  })
  @IsBoolean()
  hasTools: boolean;

  @ApiProperty({
    description: 'Whether technician has transportation',
    example: true,
  })
  @IsBoolean()
  hasTransportation: boolean;

  @ApiProperty({
    description: 'Days of week available for work (Arabic names)',
    example: ['السبت', 'الأحد', 'الاثنين'],
    type: [String],
    enum: WorkingDay,
  })
  @IsArray()
  @IsEnum(WorkingDay, { each: true, message: 'Invalid working day' })
  workingDays: WorkingDay[];

  @ApiProperty({
    description: 'Working start time (24-hour format)',
    example: '08:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'Working end time (24-hour format, must be after startTime)',
    example: '18:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsNotEmpty()
  @IsString()
  endTime: string;
}
```

---

### Step4Dto - `/src/technician/dto/step4.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsArray, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Step4Dto {
  @ApiProperty({
    description: 'List of cities/areas where technician provides services',
    example: ['Cairo', 'Giza', 'Helwan'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  serviceAreas: string[];

  @ApiProperty({
    description:
      'Whether technician is willing to work outside specified service areas',
    example: true,
  })
  @IsBoolean()
  canWorkOutsideArea: boolean;
}
```

---

## 4. Category DTOs

### CreateCategoryDto - `/src/categories/dto/create-category.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUppercase,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Unique uppercase identifier for category',
    example: 'PLUMBING',
    pattern: '^[A-Z_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  key: string;

  @ApiProperty({
    description: 'Category display name',
    example: 'Plumbing Services',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed description of category',
    example: 'Complete plumbing solutions including repairs and installations',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://cdn.example.com/categories/plumbing.jpg',
    format: 'uri',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Whether category is active and visible',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

---

## 5. Service DTOs

### PriceRangeDto - `/src/services/dto/create-service.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PriceRangeDto {
  @ApiProperty({
    description: 'Minimum service price in currency',
    example: 50,
    minimum: 0,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  min: number;

  @ApiProperty({
    description: 'Maximum service price in currency',
    example: 200,
    minimum: 0,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  max: number;
}
```

---

### FixingStepsDto - `/src/services/dto/create-service.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsArray, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FixingStepsDto {
  @ApiPropertyOptional({
    description: 'Steps included in the service',
    example: ['Diagnosis', 'Repair', 'Testing'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includes?: string[];

  @ApiPropertyOptional({
    description: 'Steps NOT included in the service',
    example: ['Full system replacement'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  doesNotInclude?: string[];
}
```

---

### AddCommentDto - `/src/services/dto/create-service.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCommentDto {
  @ApiPropertyOptional({
    description: 'User ID who is adding the comment',
    example: '60d5ec49c1234567890abc12',
  })
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'User name to display with comment',
    example: 'Ahmed Mohamed',
  })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://cdn.example.com/avatars/user123.jpg',
    format: 'uri',
  })
  @IsString()
  @IsOptional()
  userAvatar?: string;

  @ApiProperty({
    description: 'Service rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Comment text',
    example: 'Excellent service! Very professional.',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
```

---

### CreateServiceDto - `/src/services/dto/create-service.dto.ts`

**Current State:** ⚠️ PARTIAL - @ApiProperty missing for nested objects

**Recommended Improvements:**

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsUppercase,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Unique uppercase identifier for service',
    example: 'PIPE_REPAIR',
    pattern: '^[A-Z_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  key: string;

  @ApiProperty({
    description: 'Service display name',
    example: 'Pipe Repair',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed service description',
    example: 'Professional pipe repair and installation',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Service image URL',
    example: 'https://cdn.example.com/services/pipe-repair.jpg',
    format: 'uri',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Category ID this service belongs to',
    example: '60d5ec49c1234567890abc20',
  })
  @IsMongoId()
  category: string;

  @ApiProperty({
    description: 'Price range for this service',
    type: PriceRangeDto,
  })
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange: PriceRangeDto;

  @ApiPropertyOptional({
    description: 'Service steps and inclusions',
    type: FixingStepsDto,
  })
  @ValidateNested()
  @Type(() => FixingStepsDto)
  @IsOptional()
  fixingSteps?: FixingStepsDto;

  @ApiPropertyOptional({
    description: 'Whether service is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

---

## 6. Request DTOs

### CoordinatesDto (nested) - `/src/request/dto/create-request.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CoordinatesDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 30.0897,
    type: 'number',
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 31.341,
    type: 'number',
  })
  @IsNumber()
  lng: number;
}
```

---

### AddressDto (nested) - `/src/request/dto/create-request.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty({
    description: 'Full address including street, city, and country',
    example: '123 Main St, Cairo, Egypt',
  })
  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @ApiPropertyOptional({
    description: 'Street name',
    example: 'Main St',
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Cairo',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'District/neighborhood name',
    example: 'Heliopolis',
  })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({
    description: 'GPS coordinates',
    type: CoordinatesDto,
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;
}
```

---

### CreateRequestDto - `/src/request/dto/create-request.dto.ts`

**Current State:** ⚠️ PARTIAL - Nested objects missing decorators

**Recommended Improvements:**

```typescript
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({
    description: 'Request title',
    example: 'Urgent plumbing repair',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the service needed',
    example: 'My kitchen sink is leaking water',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category ID',
    example: '60d5ec49c1234567890abc20',
  })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Service ID',
    example: '60d5ec49c1234567890abc21',
  })
  @IsMongoId()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    description: 'Service location address',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({
    description: 'Preferred date for service (ISO 8601 format)',
    example: '2026-06-10',
    format: 'date',
  })
  @IsDateString()
  preferredDate: string;

  @ApiProperty({
    description: 'Preferred time for service (24-hour format)',
    example: '14:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  preferredTime: string;
}
```

---

### RequestPaginationDto - `/src/request/dto/request-pagination.dto.ts`

**Current State:** ⚠️ PARTIAL - Inherits from PaginationDto

**Recommended Improvements:**

```typescript
import { IsOptional, IsEnum, Type, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '../enums/request-status.enum';

export class RequestPaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by request status',
    enum: RequestStatus,
    example: RequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
```

---

### CancelRequestDto - `/src/request/dto/cancel-request.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelRequestDto {
  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'Found another provider',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
```

---

### UpdateStatusDto - `/src/request/dto/update-status.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../enums/request-status.enum';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'New request status',
    enum: RequestStatus,
    example: RequestStatus.COMPLETED,
  })
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
```

---

## 7. Review DTOs

### CreateReviewDto - `/src/reviews/dto/create-review.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Request ID this review is for',
    example: '60d5ec49c1234567890abc40',
  })
  @IsMongoId()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Rating score (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
    type: 'integer',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional review comment',
    example: 'Excellent work! Very professional.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
```

---

### UpdateReviewDto - `/src/reviews/dto/update-review.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Updated rating (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
    type: 'integer',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Updated comment',
    example: 'Great service overall',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
```

---

## 8. Emergency DTOs

### CreateEmergencyDto - `/src/emergency/dto/create-emergency.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmergencyType } from '../schemas/emergency.schema';

export class CreateEmergencyDto {
  @ApiProperty({
    description: 'Emergency type category',
    enum: EmergencyType,
    example: EmergencyType.URGENT,
  })
  @IsEnum(EmergencyType, {
    message: `type must be one of: ${Object.values(EmergencyType).join(', ')}`,
  })
  type: EmergencyType;

  @ApiProperty({
    description: 'Name of emergency service',
    example: 'Police',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Emergency contact phone number',
    example: '122',
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Description of the emergency service',
    example: 'Police emergency line',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Icon or emoji for UI display',
    example: '🚨',
  })
  @IsString()
  @IsOptional()
  icon?: string;
}
```

---

### EmergencyQueryDto - `/src/emergency/dto/emergency-query.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsOptional, IsEnum, Type, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmergencyType } from '../schemas/emergency.schema';

export class EmergencyQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by emergency type',
    enum: EmergencyType,
    example: EmergencyType.URGENT,
  })
  @IsOptional()
  @IsEnum(EmergencyType)
  type?: EmergencyType;
}
```

---

### UpdateEmergencyDto - `/src/emergency/dto/update-emergency.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmergencyType } from '../schemas/emergency.schema';

export class UpdateEmergencyDto {
  @ApiPropertyOptional({
    description: 'Emergency type category',
    enum: EmergencyType,
    example: EmergencyType.URGENT,
  })
  @IsOptional()
  @IsEnum(EmergencyType)
  type?: EmergencyType;

  @ApiPropertyOptional({
    description: 'Name of emergency service',
    example: 'Police Updated',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone number',
    example: '122',
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Description of the emergency service',
    example: 'Updated description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Icon or emoji for UI display',
    example: '🚔',
  })
  @IsString()
  @IsOptional()
  icon?: string;
}
```

---

## 9. Admin DTOs

### AdminUsersQueryDto - `/src/admin/dto/admin-users-query.dto.ts`

**Current State:** ⚠️ PARTIAL - Inherits from PaginationDto

**Recommended Improvements:**

```typescript
import { IsOptional, IsEnum, Type, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/users/schemas/user.schema';

export class AdminUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by user role',
    enum: UserRole,
    example: UserRole.CLIENT,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

---

### RejectTechnicianDto - `/src/admin/dto/reject-technician.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectTechnicianDto {
  @ApiProperty({
    description: 'Reason for rejection (visible to technician)',
    example:
      'Incomplete documentation. Please resubmit with valid certifications.',
    minLength: 5,
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(300)
  reason: string;
}
```

---

## 10. Chat DTOs

### ChatDto - `/src/assistant/chat/dto/chat.dto.ts`

**Current State:** ❌ NO @ApiProperty decorators

**Recommended Improvements:**

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({
    description: 'Message to send to AI assistant',
    example: 'I need plumbing assistance, my sink is leaking',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
```

---

## 11. Common DTOs

### PaginationDto - `/src/common/dto/pagination.dto.ts`

**Current State:** ⚠️ PARTIAL - Type() decorator present but missing @ApiProperty

**Recommended Improvements:**

```typescript
import { IsOptional, Type, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

---

## Swagger Decorator Recommendations

### @ApiProperty vs @ApiPropertyOptional

**Use @ApiProperty for:**

- Required fields
- Always shown in Swagger UI
- No default value

**Use @ApiPropertyOptional for:**

- Optional fields
- Shows "(optional)" in UI
- Can specify default values

### Common Property Options

```typescript
@ApiProperty({
  description: 'Clear, user-friendly description',
  example: 'Value that should be copied',
  type: String,              // or Number, Date, DTO class, [String], etc
  enum: SomeEnum,           // if field is enum
  minimum: 0,               // for numbers
  maximum: 100,
  minLength: 1,             // for strings
  maxLength: 255,
  pattern: '^[A-Z]+$',      // regex pattern
  format: 'email',          // 'date', 'date-time', 'uri', 'mongo-id', etc
  default: 'defaultValue',
  isArray: true,            // if field is array
  deprecated: false,        // mark as deprecated if needed
})
```

---

## Implementation Guide

### Step 1: Update Auth DTOs

File: `/src/auth/dto/register.dto.ts`

1. Add import: `import { ApiProperty } from '@nestjs/swagger';`
2. Add decorator to each property
3. Add meaningful descriptions and examples

### Step 2: Update User DTOs

File: `/src/users/dto/update-profile.dto.ts`

1. Import `ApiPropertyOptional`
2. Replace with `@ApiPropertyOptional` for all fields
3. Add examples and descriptions

### Step 3: Update Nested DTOs

For complex DTOs with nested objects:

```typescript
@ApiProperty({
  description: 'Service price range',
  type: PriceRangeDto,  // Reference the nested DTO
})
@ValidateNested()
@Type(() => PriceRangeDto)
priceRange: PriceRangeDto;
```

### Step 4: Update Pagination DTOs

Ensure all pagination DTOs inherit from `PaginationDto` and add `@ApiPropertyOptional` decorators.

### Step 5: Test Swagger Output

After implementation:

1. Start the application
2. Navigate to `/api/docs`
3. Verify:
   - All fields are visible
   - Examples are displayed correctly
   - Required vs optional fields are marked properly
   - Enums show dropdown options

---

## Example Implementations

### Complete Example: RegisterDto (Before & After)

**BEFORE:**

```typescript
export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullName: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;
  // ... more fields
}
```

**AFTER:**

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Ahmed Mohamed',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    description: 'Unique email address',
    example: 'client@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;
  // ... more fields
}
```

**Swagger UI Benefits:**

- 🎯 Clear field descriptions
- 📋 Example values ready to copy
- ✅ Validation rules visible
- 🔒 Required fields clearly marked

---

### Complete Example: Nested DTO (CreateRequestDto)

**BEFORE:**

```typescript
export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
  // ... no swagger decorators on nested objects
}

class AddressDto {
  @IsString()
  fullAddress: string;
  // ... no swagger decorators
}
```

**AFTER:**

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({
    description: 'Request title',
    example: 'Urgent plumbing repair',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Service location address',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

class AddressDto {
  @ApiProperty({
    description: 'Full address including street, city, and country',
    example: '123 Main St, Cairo, Egypt',
  })
  @IsString()
  @IsNotEmpty()
  fullAddress: string;
}
```

---

## Priority Implementation Order

1. **HIGH Priority (Critical User Flows):**
   - RegisterDto
   - LoginDto
   - CreateRequestDto
   - UpdateProfileDto

2. **MEDIUM Priority (Core Features):**
   - Step2Dto, Step3Dto, Step4Dto (Technician)
   - CreateServiceDto, CreateCategoryDto
   - CreateReviewDto

3. **LOW Priority (Administrative):**
   - EmergencyDTOs
   - AdminDTOs
   - ChatDto

---

## Testing Checklist

After implementing Swagger improvements:

- [ ] All DTOs have @ApiProperty or @ApiPropertyOptional decorators
- [ ] Each property has meaningful description
- [ ] Example values are realistic and copy-friendly
- [ ] Enums show as dropdown in Swagger UI
- [ ] Nested objects display with proper structure
- [ ] Required vs optional fields are correctly marked
- [ ] Swagger docs generate without errors
- [ ] API endpoint documentation is complete

---

## Benefits Summary

### For Developers

✅ Clear understanding of field requirements
✅ Real-world examples for testing
✅ Validation rules visible upfront
✅ Reduced back-and-forth questions

### For QA Engineers

✅ Test cases easier to create
✅ Validation scenarios documented
✅ Example payloads ready to use
✅ Edge cases identified

### For Product Managers

✅ API capabilities clearly documented
✅ User permissions visible
✅ Integration paths understood
✅ Scope and requirements clear

---

**End of Swagger Improvements Documentation**

_This document provides detailed recommendations for enhancing Swagger documentation quality without changing any business logic or API behavior._
