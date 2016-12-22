import sayHello from '../src/index';

describe('Hello', function () {
  it('says hello', function () {
    expect(sayHello('Jair')).toBe('Hello Jair!');
  });
});
