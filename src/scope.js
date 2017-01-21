import _ from 'lodash';

/**
 * @namespace Scope
 * @class Scope
 * @name Scope
 * @description Scopes can be created by applying the `new` operator to the
 *     `Scope` constructor.
 * @type {Class}
 * @since 1.0.0
 * @author Yair Rodriguez
 * @example
 * const scope = new Scope();
 */
export default class Scope {
  /**
   * @constructs Scope#constructor
   * @description Create and instance of `Scope`.
   * @function
   * @instance
   *
   * @property {Array} $$watchers - A place to store all the watches that
   *    have been registered.
   */
  constructor () {
    /**
     * @description The double-dollar prefix $$ signifies that this variable
     *     should be considered private to the framework, and should not be
     *     called from application code.
     * @type {Array}
     * @readonly
     */
    this.$$watchers = [];
  }

  /**
   * @name Scope#$watch
   * @function
   * @description Registers a `listener` callback to be executed whenever the
   *     `watchExpression` changes.
   * @param {(string|function)} watchExpression - The `watchExpression` is called
   *     on every call to `$digest()` and should return the value that will be
   *     watched.
   * @param {function} listener - The `listener` is called only when the value from
   *     the current `watchExpression` and the previous call to `watchExpression`
   *     are not equal.
   *
   * @example
   * scope.someValue = 'a';
   * scope.counter = 0;
   *
   * scope.$watch(
   *   scope => scope.someValue,
   *   (newValue, oldValue, scope) => { scope.counter++; }
   * );
   *
   * expect(scope.counter).toBe(0);
   *
   * scope.$digest();
   * expect(scope.counter).toBe(1);
   *
   * scope.someValue = 'b';
   *
   * scope.$digest();
   * expect(scope.counter).toBe(2);
   */
  $watch (watchExpression, listener) {
    const watcher = {
      watchExpression,
      listener
    };

    this.$$watchers.push(watcher);
  }

  /**
   * @name Scope#$digest
   * @description Iterates over all registered watchers and calls their listener
   *     functions on the current `Scope`.
   * @function
   *
   * @example
   * scope.someValue = 'a';
   * scope.counter = 0;
   *
   * scope.$watch(
   *   scope => scope.someValue,
   *   (newValue, oldValue, scope) => { scope.counter++; }
   * );
   *
   * expect(scope.counter).toBe(0);
   *
   * scope.$digest();
   * expect(scope.counter).toBe(1);
   *
   * scope.someValue = 'b';
   *
   * scope.$digest();
   * expect(scope.counter).toBe(2);
   */
  $digest () {
    _.forEach(this.$$watchers, watcher => {
      watcher.watchExpression(this);
      watcher.listener();
    });
  }
}
