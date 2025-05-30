import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import {
  ACCESS_TOKEN_EXPIRED_TIME,
  REFRESH_TOKEN_EXPIRED_TIME,
} from 'src/core/constants/config';
import { getDeltaTime } from 'src/core/utils';
import { DefinedException } from 'src/core/utils/exceptions';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(payload: {
    userId: string;
    email: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(
      {
        ...payload,
        expiresTime: getDeltaTime(ACCESS_TOKEN_EXPIRED_TIME * 60),
      },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: ACCESS_TOKEN_EXPIRED_TIME,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        expiresTime: getDeltaTime(REFRESH_TOKEN_EXPIRED_TIME * 60),
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: ACCESS_TOKEN_EXPIRED_TIME,
      },
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(userId: string, incomingToken: string) {
    const savedToken = await this.redis.get(`jwt:${userId}`);

    if (!savedToken || savedToken !== incomingToken) {
      DefinedException.Unauthenticated401('Invalid or expired refresh token');
    }

    await this.revokeToken(userId, incomingToken);

    const payload = { sub: userId };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRED_TIME,
    });
  }

  async saveToken(userId: string, token: string, ttl: number): Promise<void> {
    await this.redis.set(`jwt:${userId}:${token}`, 'valid', 'EX', ttl);
  }

  async isTokenValid(userId: string, token: string): Promise<boolean> {
    const result = await this.redis.get(`jwt:${userId}:${token}`);
    return result === 'valid';
  }

  async revokeToken(userId: string, token: string): Promise<void> {
    await this.redis.del(`jwt:${userId}:${token}`);
  }

  async decodeToken(
    token: string,
  ): Promise<{ userId: string; email: string; expiresTime: number } | null> {
    return await this.jwtService.decode(token);
  }

  async verifyRefreshToken(userId: string, refreshToken?: string) {
    if (!refreshToken) {
      return DefinedException.Unauthenticated401('Invalid token');
    }

    const isValidToken = await this.isTokenValid(userId, refreshToken);

    if (!isValidToken) {
      return DefinedException.Unauthenticated401('Invalid token');
    }
  }
}
