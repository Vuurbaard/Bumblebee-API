import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Fragment, FragmentSchema } from './schemas/fragment.schema';
import { Source, SourceSchema } from './schemas/source.schema';
import { User, UserSchema } from './schemas/user.schema';
import { Word, WordSchema } from './schemas/word.schema';


let schemas = [
	MongooseModule.forFeature([{ name: 'Fragment', schema: FragmentSchema }]),
	MongooseModule.forFeature([{ name: 'Source', schema: SourceSchema }]),
	MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
	MongooseModule.forFeature([{ name: 'Word', schema: WordSchema }]),
]


let allDb = schemas.concat([]);


@Module({
	imports: allDb,
	exports: allDb
})
export class DatabaseModule {}

