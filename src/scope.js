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
   * @property {Object} $$lastDirtyWatch - Keep track of the last dirty watch.
   */
  constructor () {
    /**
     * @description The double-dollar prefix $$ signifies that this variable
     *     should be considered private to the framework, and should not be
     *     called from application code.
     * @readonly
     */
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
  }

  /**
   * @name Scope#uuid
   * @function
   * @description Function used to initialize the `last` attribute to something
   *     we can guarantee to be unique, so that’s different from anything a
   *     watch function might return, including `undefined`.
   */
  uuid () {}

  /**
   * @name Scope#$$areEqual
   * @function
   * @description Determines if two objects or two values are equivalent. Two
   * objects or values are considered equivalent if at least one of the
   * following is true:
   *
   * * Both objects or values pass `===` comparision.
   * * Both objects or values are of the same type and all of their
   *   properties are equal.
   *
   * @param {(Object|Array)} newValue - Object or value to compare.
   * @param {(Object|Array)} oldValue - Object or value to compare.
   * @param {Boolean} equality - Boolea flag to compare values in a deep way.
   * @returns {Boolean} True if arguments are equal.
   */
  $$areEqual (newValue, oldValue, equality) {
    if (equality)
      return _.isEqual(newValue, oldValue);

    return (newValue === oldValue) ||
      (typeof newValue === 'number' && typeof oldValue === 'number' &&
      isNaN(newValue) && isNaN(oldValue));
  }

  /**
   * @name Scope#$$digestOnce
   * @function
   * @description Runs all the watchers once, and returns a boolean value that
   *     determines whether there any changes or not.
   * @returns {Boolean} Value that determine if a watcher is dirty or not.
   * @readonly
   *
   * @example
   * const dirty = $$digestOnce();
   */
  $$digestOnce () {
    let newValue, oldValue, dirty;

    _.forEach(this.$$watchers, watcher => {
      // $digest has to remember what the last value of each `watch` function
      // was.
      newValue = watcher.watchExpression(this);
      oldValue = watcher.last;

      if (!this.$$areEqual(newValue, oldValue, watcher.equality)) {
        this.$$lastDirtyWatch = watcher;
        watcher.last = (watcher.equality ? _.cloneDeep(newValue) : newValue);
        watcher.listener(
          newValue,
          (oldValue === this.uuid ? newValue : oldValue),
          this);
        dirty = true;
      } else if (this.$$lastDirtyWatch === watcher) {
        return false;
      }
    });

    return dirty;
  }

  /**
   * @name Scope#$watch
   * @function
   * @description Registers a `listener` callback to be executed whenever the
   *     `watchExpression` changes.
   * @param {(string|function)} watchExpression - The `watchExpression` is called
   *     on every call to `$digest()` and should return the value that will be
   *     watched.
   * @param {function} [listener] - The `listener` is called only when the value from
   *     the current `watchExpression` and the previous call to `watchExpression`
   *     are not equal.
   * @param {Boolean} [equality] - When is `true`, value–based checking is used.
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
  $watch (watchExpression, listener = () => {}, equality = false) {
    const watcher = {
      watchExpression,
      listener,
      equality,
      last: this.uuid
    };

    this.$$watchers.push(watcher);
    this.$$lastDirtyWatch = null;
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
    let TTL = 10;
    let dirty;

    this.$$lastDirtyWatch = null;

    do {
      dirty = this.$$digestOnce();

      if (dirty && !(TTL--)) {
        throw 'ngException: 10 $digest iterations reached.';
      }
    } while (dirty);
  }
}
