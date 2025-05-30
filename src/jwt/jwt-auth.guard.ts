import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { DefinedException } from 'src/core/utils/exceptions';

export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      DefinedException.Unauthenticated401('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const key = `jwt:${payload.sub}:${token}`;

      const isValid = await this.redis.get(key);

      if (!isValid) {
        DefinedException.Unauthenticated401('Token revoked or expired');
      }

      request.user = payload;
      return true;
    } catch {
      DefinedException.Unauthenticated401('Invalid token');
    }

    return false;
  }
}
