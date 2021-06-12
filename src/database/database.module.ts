import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FragmentSchema } from './schemas/fragment.schema';
import { FragmentSetSchema } from './schemas/fragmentSet.schema';
import { SourceSchema } from './schemas/source.schema';
import { UserSchema } from './schemas/user.schema';
import { WordSchema } from './schemas/word.schema';
import { UserTokenSchema } from './schemas/user-token.schema';

const schemas = [
  MongooseModule.forFeature([{ name: 'Fragment', schema: FragmentSchema }]),
  MongooseModule.forFeature([
    { name: 'FragmentSet', schema: FragmentSetSchema },
  ]),
  MongooseModule.forFeature([{ name: 'Source', schema: SourceSchema }]),
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  MongooseModule.forFeature([{ name: 'UserToken', schema: UserTokenSchema }]),
  MongooseModule.forFeature([{ name: 'Word', schema: WordSchema }]),
];

const allDb = schemas.concat([]);

@Module({
  imports: allDb,
  exports: allDb,
})
export class DatabaseModule {}
