import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/core/models/user.model';
import {
  CreateUserSchema,
  LoginUserSchema,
} from 'src/core/schemas/user.schema';

@Injectable()
export class AuthenticationService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async saveAvatarImage(file: Express.Multer.File): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const uploadPath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'users',
      filename,
    );
    await fs.promises.writeFile(uploadPath, file.buffer);
    return uploadPath;
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
