import { NotFoundException } from './not-found-exception';

describe('NotFoundException', () => {
  it('should be defined', () => {
    expect(new NotFoundException()).toBeDefined();
  });
});
