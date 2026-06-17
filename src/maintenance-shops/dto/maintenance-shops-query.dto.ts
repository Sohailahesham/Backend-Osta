import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MaintenanceShopsQueryDto {
  @ApiProperty({ example: 'Dakahlia', description: 'Governorate as stored on user/technician docs' })
  @IsString()
  @IsNotEmpty()
  governorate!: string;

  @ApiProperty({ example: 'Mansoura', description: 'City as stored on user/technician docs' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'PLUMBING', description: 'Category key or name' })
  @IsString()
  @IsNotEmpty()
  category!: string;
}