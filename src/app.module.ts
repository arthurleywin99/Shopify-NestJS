import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthenticationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
