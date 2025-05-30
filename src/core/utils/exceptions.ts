import { HttpException, HttpStatus } from '@nestjs/common';

export class DefinedException {
  static BadRequest400(message: string) {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  static Unauthenticated401(message: string) {
    throw new HttpException(message, HttpStatus.UNAUTHORIZED);
  }

  static Forbidden403(message: string) {
    throw new HttpException(message, HttpStatus.FORBIDDEN);
  }

  static NotFound404(message: string) {
    throw new HttpException(message, HttpStatus.NOT_FOUND);
  }

  static Conflict409(message: string) {
    throw new HttpException(message, HttpStatus.CONFLICT);
  }

  static InternalServerError500(message: string) {
    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static Exception(message: string, statusCode: HttpStatus) {
    throw new HttpException(message, statusCode);
  }
}
