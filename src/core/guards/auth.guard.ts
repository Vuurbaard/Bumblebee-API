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

      const authorizationToken = headers['authorization'] ?? '';

      if (
        authorizationToken.length > 0 &&
        authorizationToken.toLowerCase().startsWith('bearer ') &&
        authorizationToken.length >= 'bearer '.length
      ) {
        const authToken = authorizationToken.substr(
          'bearer '.length,
          authorizationToken.length,
        );
        // Get user by token
        this.userTokenService.findByToken(authToken).then((token) => {
          if (token) {
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
}
