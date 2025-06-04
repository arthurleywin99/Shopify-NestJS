import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/core/models/user.model';
import {
  CreateUserSchema,
  LoginUserSchema,
} from 'src/core/schemas/user.schema';
import { MinIOService } from 'src/minio/minio.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioService: MinIOService,
  ) {}

  async isValidUser(data: CreateUserSchema): Promise<boolean> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    return !existingUser;
  }

  async register(data: CreateUserSchema): Promise<User> {
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword;

    const user = await this.prismaService.user.create({
      data,
    });

    return user;
  }

  async saveAvatarImage(file: Express.Multer.File): Promise<{
    key: string;
    bucket: any;
    url: string;
  }> {
    const result = await this.minioService.uploadImage(file);

    return result;
  }

  async login({
    email,
    password,
  }: LoginUserSchema): Promise<Omit<User, 'password'> | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
      }
    }

    return null;
  }
}
