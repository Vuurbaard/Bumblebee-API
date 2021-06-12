import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserLoginDto } from './validators/UserLoginDto';
import { UsersService } from '../core/services/users/users.service';
import { UserTokenService } from '../core/services/user-token/user-token.service';
import { AuthGuard } from '../core/guards/auth.guard';
import { User } from '../core/entities/user.decorator';

@Controller('v1')
export class AuthController {
  constructor(
    private userService: UsersService,
    private userTokenService: UserTokenService,
  ) {}
  @Post('login')
  async login(@Body() userLogin: UserLoginDto) {
    let token = null;
    const user = await this.userService.login(
      userLogin.username,
      userLogin.password,
    );

    if (!user) {
      throw new HttpException('Unauthorized', 401);
    } else {
      // Generate new authentication token
      token = await this.userTokenService.create(user);
    }

    // Check if we can login with these credentials
    // console.log(userLogin);
    return token;
  }

  @UseGuards(AuthGuard)
  @Get('self')
  async self(@User() user) {
    return user;
  }
}
