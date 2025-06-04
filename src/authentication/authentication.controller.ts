import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import {
  CreateUserSchema,
  LoginUserSchema,
} from 'src/core/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DefinedException } from 'src/core/utils/exceptions';
import { SuccessResponse } from 'src/core/utils/response';
import { Request } from 'express';
import { JwtTokenService } from 'src/jwt/jwt-token.service';
import { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_EXPIRED_TIME,
  REFRESH_TOKEN_EXPIRED_TIME,
} from 'src/core/constants/config';
import { AppLogger } from 'src/core/utils/logger';
import { getDeltaTime } from 'src/core/utils';
import { TokenGuard } from './token.guard';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly configService: ConfigService,
  ) {}

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
    try {
      const { password, phoneNumber, email } = data;

      if (!email?.trim() || !phoneNumber?.trim() || !password?.trim()) {
        return DefinedException.BadRequest400('Data error');
      }

      const isValidUser = await this.authService.isValidUser(data);

      if (!isValidUser) {
        return DefinedException.Conflict409('Email already exists');
      }

      const createUserData = { ...data };

      if (file) {
        const { url } = await this.authService.saveAvatarImage(file);

        createUserData.avatar = url;
      }

      const user = await this.authService.register(createUserData);

      return SuccessResponse.Ok({
        message: 'Registered successfully',
        user,
      });
    } catch (error) {
      AppLogger.error('[Register]: Register failed: ', error);
      throw error;
    }
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginUserSchema) {
    try {
      const { email, password } = data;

      if (!email?.trim() || !password?.trim()) {
        return DefinedException.BadRequest400('Data error');
      }

      const user = await this.authService.login(data);

      if (!user) {
        return DefinedException.Unauthenticated401(
          'Email or password are incorrect',
        );
      }

      const { accessToken, refreshToken } =
        await this.jwtTokenService.generateToken({
          userId: user.id.toString(),
          email: user.email,
        });

      await this.jwtTokenService.saveToken(
        user.id.toString(),
        accessToken,
        ACCESS_TOKEN_EXPIRED_TIME,
      );

      return SuccessResponse.Ok({
        user,
        message: 'Login successfully',
        accessToken: {
          token: accessToken,
          expiresTime: getDeltaTime(ACCESS_TOKEN_EXPIRED_TIME * 60),
        },
        refreshToken: {
          token: refreshToken,
          expiresTime: getDeltaTime(REFRESH_TOKEN_EXPIRED_TIME * 60),
        },
      });
    } catch (error) {
      AppLogger.error('[Login]: Login failed', error);
      throw error;
    }
  }

  @Get('refresh-token')
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request) {
    try {
      const refreshToken = req['token'];

      const payload = await this.jwtTokenService.decodeToken(refreshToken);

      if (!payload || !payload.userId) {
        return DefinedException.Unauthenticated401('Invalid token');
      }

      await this.jwtTokenService.verifyRefreshToken(
        payload.userId,
        refreshToken,
      );

      const { accessToken } = await this.jwtTokenService.generateToken({
        userId: payload.userId,
        email: payload.email,
      });

      return SuccessResponse.Ok({
        message: 'Token refresh successfully',
        accessToken: {
          token: accessToken,
          expiresTime: getDeltaTime(ACCESS_TOKEN_EXPIRED_TIME * 60),
        },
      });
    } catch (error) {
      AppLogger.error('[RefreshToken]: Refresh token failed', error);
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    try {
      const refreshToken = req['token'];

      const payload = await this.jwtTokenService.decodeToken(refreshToken);

      if (!payload || !payload.userId) {
        return DefinedException.Unauthenticated401('Invalid token');
      }

      await this.jwtTokenService.verifyRefreshToken(
        payload.userId,
        refreshToken,
      );

      await this.jwtTokenService.revokeToken(payload.userId, refreshToken);

      return SuccessResponse.Ok({
        message: 'Logout successfully',
      });
    } catch (error) {
      AppLogger.error('[Logout]: Logout failed', error);
      throw error;
    }
  }
}
