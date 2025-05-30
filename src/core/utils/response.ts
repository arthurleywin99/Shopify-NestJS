import { HttpStatus } from '@nestjs/common';

type ResponseType<T> = {
  statusCode: HttpStatus;
  data: T;
};

export class SuccessResponse {
  static Ok<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  static Created<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.CREATED,
      data,
    };
  }

  static Accepted<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.ACCEPTED,
      data,
    };
  }

  static NonAuthoritativeInformation<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.NON_AUTHORITATIVE_INFORMATION,
      data,
    };
  }

  static NoContent<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.NO_CONTENT,
      data,
    };
  }

  static ResetContent<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.RESET_CONTENT,
      data,
    };
  }

  static PartialContent<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.PARTIAL_CONTENT,
      data,
    };
  }

  static MultiStatus<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.MULTI_STATUS,
      data,
    };
  }

  static AlreadyReported<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.ALREADY_REPORTED,
      data,
    };
  }

  static ContentDifferent<T>(data: T): ResponseType<T> {
    return {
      statusCode: HttpStatus.CONTENT_DIFFERENT,
      data,
    };
  }
}
