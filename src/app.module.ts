import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SpeechModule } from './speech/speech.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
	  ConfigModule.forRoot({
			isGlobal: true
	  }),
	  MongooseModule.forRoot(`mongodb://${process.env.MONGO_HOST}/bumblebeev2`),
	  AuthModule,
	  SpeechModule,
	  CoreModule,
	  DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
