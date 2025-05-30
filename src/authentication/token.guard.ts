import { CanActivate, ExecutionContext } from '@nestjs/common';

export class TokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      request['token'] = token;
      return true;
    }

    return false;
  }
}
