import Scope from 'src/scope';

describe('Scope :: $digest', () => {
  let scope;

  beforeEach(() => {
    scope = new Scope();
  });

  it('calls the listener function of a watch on first $digest', () => {
    const watchExpression = () => 'watchExpression';
    const listener        = jasmine.createSpy();

    scope.$watch(watchExpression, listener);
    scope.$digest();

    expect(listener).toHaveBeenCalled();
  });
});
