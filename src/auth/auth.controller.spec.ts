import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserLoginDto } from './validators/UserLoginDto';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import { UsersService } from '../core/services/users/users.service';
import { UserTokenService } from '../core/services/user-token/user-token.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/schemas/user.schema';
import { UserEntity } from '../core/entities/user-entity';
import { UserTokenEntity } from '../core/entities/user-token-entity';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: UsersService;
  const password = 'test';

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn(),
            findOne: () => {
              return {
                username: 'pannenkoek',
                password: hash,
              };
            },
            findById: jest.fn(),
          },
        },
        UserTokenService,
        {
          provide: getModelToken('UserToken'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: () => {
              return {
                token: 'abcdefg',
                valid_till: new Date(),
                created_at: new Date(),
              };
            },
          },
        },
      ],
      imports: [
        MongooseModule.forRoot(`mongodb://localhost:27017/testv2`),
        DatabaseModule,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('allow existing users to login', async () => {
    jest.spyOn(userService, 'login').mockImplementation(async () => {
      return new UserEntity({
        username: 'pannenkoek',
        password: 'bla',
        email: 'test@test.nl',
        isAdmin: false,
        name: 'bitch',
      });
    });

    const dto = new UserLoginDto();
    dto.username = 'pannenkoek';
    dto.password = password;

    const result = await controller.login(dto);
    expect(result).toBeInstanceOf(UserTokenEntity);
  });

  it('unauthorized with incorrect credentials', async () => {
    jest.spyOn(userService, 'login').mockImplementation(async () => {
      return new UserEntity({
        username: 'pannenkoek',
        password: 'bla',
        email: 'test@test.nl',
        isAdmin: false,
        name: 'bitch',
      });
    });

    const dto = new UserLoginDto();
    dto.username = 'pannenkoek';
    dto.password = 'notpassword';

    try {
      await controller.login(dto);
    } catch (e) {
      console.log(e);
    }

    // expect(result).toBeInstanceOf(UserTokenEntity);
  });
});
