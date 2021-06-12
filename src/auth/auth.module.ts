import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CoreModule } from '../core/core.module';

@Module({
  controllers: [AuthController],
  imports: [CoreModule],
})
export class AuthModule {}
