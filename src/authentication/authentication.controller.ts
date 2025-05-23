import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateUserSchema } from 'src/user/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DefinedException } from 'src/utils/exceptions';
import { SuccessResponse } from 'src/utils/response';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async register(
    @Body() data: CreateUserSchema,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const isValidUser = await this.authService.isValidUser(data);

    if (!isValidUser) {
      return DefinedException.Conflict409('Email already exists');
    }

    if (file) {
      const imagePath = await this.authService.saveAvatarImage(file);
      data.avatar = imagePath;
    }

    const user = await this.authService.register(data);

    return SuccessResponse.Ok(user);
  }
}
