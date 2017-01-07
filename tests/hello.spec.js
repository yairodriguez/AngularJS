import sayHello from '../src/index';

describe('Hello', () => {
  it('says hello', () => {
    expect(sayHello('Jair')).toBe('Hello Jair!');
  });
});
