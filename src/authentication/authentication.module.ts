import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtTokenModule } from 'src/jwt/jwt-token.module';
import { MinIOModule } from 'src/minio/minio.module';

@Module({
  imports: [PrismaModule, JwtTokenModule, MinIOModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
