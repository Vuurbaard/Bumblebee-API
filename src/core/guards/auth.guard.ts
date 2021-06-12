import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserTokenService } from '../services/user-token/user-token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userTokenService: UserTokenService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise((resolve, reject) => {
      const request = context.switchToHttp().getRequest();

      const headers = request.headers;

      const authorizationToken = this.grabTokenFromAuthorizationHeader(
        headers['authorization'] ?? '',
      );

      if (authorizationToken.length > 0) {
        this.getUserByToken(authorizationToken).then((token) => {
          if (token && token.user) {
            request.user = token.user;
            resolve(true);
          } else {
            resolve(false);
            throw new HttpException('Unauthorized', 401);
          }
        });
      }
    });
  }

  grabTokenFromAuthorizationHeader(header: string) {
    const prefix = 'bearer ';
    if (
      header.length >= prefix.length &&
      header.toLowerCase().startsWith('bearer ')
    ) {
      return header.substr('bearer '.length, header.length);
    }

    return '';
  }

  async getUserByToken(token: string) {
    return await this.userTokenService.findByToken(token);
  }
}
