import {
  Controller, Post, Body,
  UseGuards, Req, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TechnicianService } from './technician.service';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';

@Controller('technician')
@UseGuards(AuthGuard('jwt'))
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
        { name: 'idImage', maxCount: 1 },
        { name: 'certificateImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/technician',
          filename: (req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${unique}${extname(file.originalname)}`);
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
      idImage?: Express.Multer.File[];
      certificateImage?: Express.Multer.File[];
    },
  ) {
    return this.technicianService.updateStep5(req.user.userId, {
      personalImage: files.personalImage?.[0]?.path,
      idImage: files.idImage?.[0]?.path,
      certificateImage: files.certificateImage?.[0]?.path,
    });
  }
}