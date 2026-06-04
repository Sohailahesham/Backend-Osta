import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
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

@Controller('technician')
@UseGuards(AuthGuard('jwt'), TechnicianGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post('step2')
  step2(@Req() req, @Body() dto: Step2Dto) {
    return this.technicianService.updateStep2(req.user.userId, dto);
  }

  @Post('step3')
  step3(@Req() req, @Body() dto: Step3Dto) {
    return this.technicianService.updateStep3(req.user.userId, dto);
  }

  @Post('step4')
  step4(@Req() req, @Body() dto: Step4Dto) {
    return this.technicianService.updateStep4(req.user.userId, dto);
  }

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
  if (!files?.personalImage?.[0])
    throw new BadRequestException('personalImage is required');

  if (!files?.idFrontImage?.[0])
    throw new BadRequestException('idFrontImage is required');

  if (!files?.idBackImage?.[0])
    throw new BadRequestException('idBackImage is required');

  return this.technicianService.updateStep5(req.user.userId, {
    personalImage: files.personalImage[0].path,
    idFrontImage: files.idFrontImage[0].path,
    idBackImage: files.idBackImage[0].path,
    certificateImage: files.certificateImage?.[0]?.path,
    criminalRecordImage: files.criminalRecordImage?.[0]?.path,
  });
}
}
