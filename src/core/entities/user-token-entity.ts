import { BaseEntity } from './base-entity';
import { Expose } from 'class-transformer';
import { UserEntity } from './user-entity';

export class UserTokenEntity extends BaseEntity {
  token: string;
  valid_till: Date;
  created_at: Date;
  // user: UserEntity;

  @Expose({ name: 'id' })
  getKey() {
    return super.getKey();
  }

  @Expose({ name: 'type' })
  getType() {
    return 'user-tokens';
  }

  @Expose({ name: 'attributes' })
  getAttributes(): any {
    return super.getAttributes();
  }

  get user(): UserEntity {
    const rel = this._model.get('user');
    return rel ? new UserEntity(rel) : null;
  }
}
