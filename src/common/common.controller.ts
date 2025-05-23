import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from './common.service';
import { DefinedException } from 'src/utils/exceptions';
import { Request } from 'express';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: CommonService.getMulterStorage(),
    }),
  )
  uploadFile(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      DefinedException.BadRequest400('File is empty');
    }

    return this.commonService.uploadFile(req, file);
  }
}
