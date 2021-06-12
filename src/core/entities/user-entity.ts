import { BaseEntity } from './base-entity';
import { Expose } from 'class-transformer';

export class UserEntity extends BaseEntity {
  email: string;
  isAdmin: boolean;
  name: string;
  password: string;
  username: string;

  _excluded = ['password'];

  @Expose({ name: 'id' })
  getKey() {
    return super.getKey();
  }

  @Expose({ name: 'type' })
  getType() {
    return 'users';
  }

  @Expose({ name: 'attributes' })
  getAttributes(): any {
    return super.getAttributes();
  }
}
