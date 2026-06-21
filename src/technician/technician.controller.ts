/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TechnicianService } from './technician.service';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';
import * as fs from 'fs';
import { TechnicianGuard } from 'src/auth/guards/technician.guard';
import { VerifiedEmailGuard } from 'src/auth/guards/verified-email.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Technician')
@ApiBearerAuth('JWT')
@Controller('technician')
@UseGuards(AuthGuard('jwt'), TechnicianGuard, VerifiedEmailGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @ApiOperation({
    summary: 'Step 2 — Set specialization (categoryId + serviceIds)',
  })
  @Post('step2')
  step2(@Req() req, @Body() dto: Step2Dto) {
    return this.technicianService.updateStep2(req.user.userId, dto);
  }

  @ApiOperation({
    summary: 'Step 3 — Professional info (experience, tools, schedule)',
  })
  @Post('step3')
  step3(@Req() req, @Body() dto: Step3Dto) {
    return this.technicianService.updateStep3(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Step 4 — Service areas' })
  @Post('step4')
  step4(@Req() req, @Body() dto: Step4Dto) {
    return this.technicianService.updateStep4(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Step 5 — Upload documents (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['personalImage', 'idFrontImage', 'idBackImage'],
      properties: {
        personalImage: { type: 'string', format: 'binary' },
        idFrontImage: { type: 'string', format: 'binary' },
        idBackImage: { type: 'string', format: 'binary' },
        certificateImage: { type: 'string', format: 'binary' },
        criminalRecordImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('step5')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'personalImage', maxCount: 1 },
        { name: 'idFrontImage', maxCount: 1 },
        { name: 'idBackImage', maxCount: 1 },
        { name: 'certificateImage', maxCount: 1 },
        { name: 'criminalRecordImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req: any, file, cb) => {
            const userId = req.user.userId;
            const uploadPath = `./uploads/technician/${userId}`;

            if (!fs.existsSync(uploadPath)) {
              fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(
              null,
              `${file.fieldname}-${unique}${extname(file.originalname)}`,
            );
          },
        }),
      },
    ),
  )
  step5(
    @Req() req,
    @UploadedFiles()
    files: {
      personalImage?: Express.Multer.File[];
      idFrontImage?: Express.Multer.File[];
      idBackImage?: Express.Multer.File[];
      certificateImage?: Express.Multer.File[];
      criminalRecordImage?: Express.Multer.File[];
    },
  ) {
    const requiredFiles = [
      files?.personalImage?.[0],
      files?.idFrontImage?.[0],
      files?.idBackImage?.[0],
    ];

    if (requiredFiles.some((file) => !file)) {
      Object.values(files || {})
      .flat()
      .forEach((file) => {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      throw new BadRequestException(
        'personalImage, idFrontImage and idBackImage are required',
      );
    }

    return this.technicianService.updateStep5(req.user.userId, {
      personalImage: files.personalImage![0].path,
      idFrontImage: files.idFrontImage![0].path,
      idBackImage: files.idBackImage![0].path,
      certificateImage: files.certificateImage?.[0]?.path,
      criminalRecordImage: files.criminalRecordImage?.[0]?.path,
    });
  }

  @ApiOperation({ summary: 'Get technician profile and registration details' })
  @Get('details')
  profile(@Req() req) {
    return this.technicianService.getTechData(req.user.userId);
  }

  @ApiOperation({ summary: 'Get technician dashboard' })
  @Get('dashboard')
  dashboard(@Req() req) {
    return this.technicianService.getDashboard(req.user.userId);
  }
}
