import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { AppController } from './app.controller';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AuthenticationModule, CommonModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
