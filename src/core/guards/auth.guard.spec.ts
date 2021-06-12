import { AuthGuard } from './auth.guard';
import { Test } from '@nestjs/testing';
import { UsersService } from '../services/users/users.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { UserTokenService } from '../services/user-token/user-token.service';
import { DatabaseModule } from '../../database/database.module';
import { AuthController } from '../../auth/auth.controller';
import { ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../entities/user-entity';
import { UserTokenEntity } from '../entities/user-token-entity';

describe('AuthGuard', () => {
  let tokenService: UserTokenService;
  // let context: ExecutionContext;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserTokenService,
        {
          provide: getModelToken('UserToken'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: () => {
              return new UserTokenEntity({
                token: 'abcdefg',
                valid_till: new Date(),
                created_at: new Date(),
              });
            },
          },
        },
      ],
      imports: [
        MongooseModule.forRoot(`mongodb://localhost:27017/testv2`),
        DatabaseModule,
      ],
    }).compile();

    tokenService = module.get<UserTokenService>(UserTokenService);
  });
  it('should be defined', async () => {
    // Mock UserTokenService

    expect(new AuthGuard(tokenService)).toBeDefined();
  });

  it('should check for a valid token', async () => {
    jest.spyOn(tokenService, 'findByToken').mockImplementation(async () => {
      return new UserTokenEntity({
        token: 'abcdefg',
        valid_till: new Date(),
        created_at: new Date(),
      });
    });

    const guard = new AuthGuard(tokenService);

    const token = await guard.getUserByToken('abcdefg');
    expect(token).toBeInstanceOf(UserTokenEntity);
    expect(token.token).toEqual('abcdefg');
  });

  it('should properly cut out the token', async () => {
    const authHeader = 'Bearer abcdefghijklmnopq';
    const guard = new AuthGuard(tokenService);
    const token = guard.grabTokenFromAuthorizationHeader(authHeader);
    expect(token).toEqual('abcdefghijklmnopq');
  });
});
