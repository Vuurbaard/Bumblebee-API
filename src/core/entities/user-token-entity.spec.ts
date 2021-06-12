import { UserTokenEntity } from './user-token-entity';

describe('UserTokenEntity', () => {
  it('should be defined', () => {
    expect(new UserTokenEntity({})).toBeDefined();
  });
});
