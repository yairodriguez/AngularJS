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

  it('calls the watch function with the scope as the argument', () => {
    const watchExpression = jasmine.createSpy();
    const listener        = () => {};

    scope.$watch(watchExpression, listener);
    scope.$digest();

    expect(watchExpression).toHaveBeenCalledWith(scope);
  });

  it('calls the listener function when the watched value changes', () => {
    scope.someValue = 'a';
    scope.counter   = 0;

    scope.$watch(
      scope => scope.someValue,
      (newValue, oldValue, scope) => { scope.counter++; }
    );

    expect(scope.counter).toBe(0);

    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.someValue = 'b';
    expect(scope.counter).toBe(1);

    scope.$digest();
    expect(scope.counter).toBe(2);
  });

  it('calls listener when watch value is first undefined', () => {
    scope.counter = 0;

    scope.$watch(
      scope => scope.someValue,
      (newValue, oldValue, scope) => { scope.counter++; }
    );

    scope.$digest();
    expect(scope.counter).toBe(1);
  });

  it('calls listener with newValue as oldValue the first time', () => {
    let oldValueGiven;

    scope.someValue = 123;

    scope.$watch(
      scope => scope.someValue,
      (newValue, oldValue, scope) => { oldValueGiven = oldValue; }
    );

    scope.$digest();
    expect(oldValueGiven).toBe(123);
  });

  it('may have watchers that omit the listener function', () => {
    const watchExpression = jasmine.createSpy().and.returnValue('something');

    scope.$watch(watchExpression);
    scope.$digest();

    expect(watchExpression).toHaveBeenCalled();
  });

  it('triggers chained watchers in the same digest', () => {
    scope.name = 'Jair';

    scope.$watch(
      scope => scope.nameUpper,
      (newValue, oldValue, scope) => {
        if (newValue) {
          scope.initial = `${newValue.substring(0, 1)}.`;
        }
      }
    );

    scope.$watch(
      scope => scope.name,
      (newValue, oldValue, scope) => {
        if (newValue) {
          scope.nameUpper = newValue.toUpperCase();
        }
      }
    );

    scope.$digest();
    expect(scope.initial).toBe('J.');

    scope.name = 'Genius';

    scope.$digest();
    expect(scope.initial).toBe('G.');
  });

  it('gives up on the watches after 10 iterations', () => {
    scope.counterA = 0;
    scope.counterB = 0;

    scope.$watch(
      scope => scope.counterA,
      (newValue, oldValue, scope) => {
        scope.counterB++;
      }
    );

    scope.$watch(
      scope => scope.counterB,
      (newValue, oldValue, scope) => {
        scope.counterA++;
      }
    );

    expect(() => { scope.$digest(); }).toThrow();
  });
});
