'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

var _tweenInterpolate = require('tween-interpolate');

var _tweenInterpolate2 = _interopRequireDefault(_tweenInterpolate);

require('should');

var __DEV__ = process.env.NODE_ENV === 'development';
var __BROWSER__ = typeof window === 'object';

function isMobile(userAgent) {
  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  );
}

function isGingerbread(userAgent) {
  return (/Android 2\.3\.[3-7]/i.test(userAgent)
  );
}

// Hardware acceleration trick constants
var transformProperties = ['WebkitTransform', 'MozTransform', 'MSTransform', 'OTransform', 'Transform'];
var transformHA = 'translateZ(0)';

// Decide whether we should do the hardware accelaration trick
// if we are not explicitly prevented from.
// The trick will be enabled in mobile browsers which are not
// Android Gingerbread.
function shouldEnableHA() {
  if (!__BROWSER__) {
    return false;
  }
  var userAgent = navigator.userAgent;

  if (!userAgent) {
    return false;
  }
  // is mobile but not gingerbread
  return isMobile(userAgent) && !isGingerbread(userAgent);
}

function enableHA(styles) {
  // for each 'transform' property, set/prepend 'translateZ(0)'
  transformProperties.forEach(function (property) {
    if (styles[property] === void 0) {
      styles[property] = [transformHA, transformHA];
    } else {
      var _styles$property = _slicedToArray(styles[property], 2);

      var from = _styles$property[0];
      var to = _styles$property[1];

      styles[property] = [transformHA + ' ' + from, transformHA + ' ' + to];
    }
  });
}

var Animate = {
  '@animations': '__animations',

  '@abortAnimation': '__abortAnimation',

  '@animate': '__animate',

  '@getAnimatedStyle': '__getAnimatedStyle',

  '@isAnimated': '__isAnimated',

  animate: function animate() {
    if (__DEV__) {
      this.should.not.be.exactly(Animate);
    }
    return this[Animate['@animate']].apply(this, arguments);
  },

  abortAnimation: function abortAnimation() {
    if (__DEV__) {
      this.should.not.be.exactly(Animate);
    }
    return this[Animate['@abortAnimation']].apply(this, arguments);
  },

  getAnimatedStyle: function getAnimatedStyle() {
    if (__DEV__) {
      this.should.not.be.exactly(Animate);
    }
    return this[Animate['@getAnimatedStyle']].apply(this, arguments);
  },

  isAnimated: function isAnimated() {
    if (__DEV__) {
      this.should.not.be.exactly(Animate);
    }
    return this[Animate['@isAnimated']].apply(this, arguments);
  },

  DEFAULT_EASING: 'cubic-in-out',

  extend: null
};

function animatedStyleStateKey(name) {
  return 'Animate@' + name;
}

Animate.extend = function (Component) {
  return (function (_Component) {
    _inherits(_class, _Component);

    function _class(props) {
      _classCallCheck(this, _class);

      _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this, props);
      if (typeof this.state === 'object') {
        this.state = {};
      }
      this[Animate['@animations']] = {};
    }

    _createClass(_class, [{
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        var _this = this;

        if (_get(Object.getPrototypeOf(_class.prototype), 'componentWillUnmount', this)) {
          _get(Object.getPrototypeOf(_class.prototype), 'componentWillUnmount', this).call(this);
        }
        if (this[Animate['@animations']] !== null) {
          Object.keys(this[Animate['@animations']], function (name) {
            var animation = _this[Animate['@animations']][name];
            Animate.abortAnimation.call(_this, name, animation);
          });
        }
      }
    }, {
      key: Animate['@getAnimatedStyle'],
      value: function value(name) {
        if (__DEV__) {
          name.should.be.a.String;
        }
        return this.state && this.state[animatedStyleStateKey(name)] || {};
      }
    }, {
      key: Animate['@isAnimated'],
      value: function value(name) {
        if (__DEV__) {
          name.should.be.a.String;
        }
        return this[Animate['@animations']][name] !== void 0;
      }
    }, {
      key: Animate['@abortAnimation'],
      value: function value(name) {
        if (__DEV__) {
          name.should.be.a.String;
        }
        if (this[Animate['@animations']][name] !== void 0) {
          var _Animate$Animations$name = this[Animate['@animations']][name];
          var easingFn = _Animate$Animations$name.easingFn;
          var onAbort = _Animate$Animations$name.onAbort;
          var nextTick = _Animate$Animations$name.nextTick;
          var t = _Animate$Animations$name.t;
          var currentStyle = _Animate$Animations$name.currentStyle;

          _raf2['default'].cancel(nextTick);
          onAbort(currentStyle, t, easingFn(t));
          // unregister the animation
          delete this[Animate['@animations']][name];
          return true;
        }
        // silently fail but returns false
        return false;
      }
    }, {
      key: Animate['@animate'],
      value: function value(name, fromStyle, toStyle, duration) {
        var _this2 = this;

        var opts = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
        var _opts$easing = opts.easing;
        var easing = _opts$easing === undefined ? Animate.DEFAULT_EASING : _opts$easing;
        var _opts$onTick = opts.onTick;
        var onTick = _opts$onTick === undefined ? function () {
          return void 0;
        } : _opts$onTick;
        var _opts$onAbort = opts.onAbort;
        var onAbort = _opts$onAbort === undefined ? function () {
          return void 0;
        } : _opts$onAbort;
        var _opts$onComplete = opts.onComplete;
        var onComplete = _opts$onComplete === undefined ? function () {
          return void 0;
        } : _opts$onComplete;
        var _opts$disableMobileHA = opts.disableMobileHA;
        var disableMobileHA = _opts$disableMobileHA === undefined ? false : _opts$disableMobileHA;

        if (__DEV__) {
          name.should.be.a.String;
          fromStyle.should.be.an.Object;
          toStyle.should.be.an.Object;
          duration.should.be.a.Number.which.is.above(0);
          onTick.should.be.a.Function;
          onAbort.should.be.a.Function;
          onComplete.should.be.a.Function;
        }
        // if there is already an animation with this name, abort it
        if (this[Animate['@animations']][name] !== void 0) {
          Animate.abortAnimation.call(this, name);
        }
        // create the actual easing function using tween-interpolate (d3 smash)
        var easingFn = typeof easing === 'object' ? _tweenInterpolate2['default'].ease.apply(_tweenInterpolate2['default'], [easing.type].concat(_toConsumableArray(easing.arguments))) : _tweenInterpolate2['default'].ease(easing);
        // reformat the input: [property]: [from, to]
        var styles = {};
        // unless told otherwise below, the value is assumed constant
        Object.keys(fromStyle).forEach(function (property) {
          var value = fromStyle[property];
          styles[property] = [value, value];
        });
        // if we dont have an initial value for each property, assume it is constant from the beginning
        Object.keys(toStyle).forEach(function (property) {
          var value = toStyle[property];
          styles[property] = styles[property] === void 0 ? [value, value] : [styles[property][0], value];
        });
        // get an interpolator for each property
        var interpolators = Object.keys(styles).reduce(function (_interpolators, key) {
          var _styles$key = _slicedToArray(styles[key], 2);

          var from = _styles$key[0];
          var to = _styles$key[1];

          _interpolators[key] = _tweenInterpolate2['default'].interpolate(from, to);
          return _interpolators;
        }, {});
        // pre-compute the final style (ignore [from])
        var finalStyle = Object.keys(styles).reduce(function (_finalStyle, key) {
          _finalStyle[key] = styles[key][1];
          return _finalStyle;
        }, {});

        // do the hardware acceleration trick
        if (!disableMobileHA && shouldEnableHA()) {
          enableHA(transformProperties, styles);
        }

        var start = Date.now();
        var stateKey = animatedStyleStateKey(name);

        // the main ticker function
        var tick = function tick() {
          var now = Date.now();
          // progress: starts at 0, ends at > 1
          var t = (now - start) / duration;
          // we are past the end
          if (t > 1) {
            _this2.setState(_defineProperty({}, stateKey, finalStyle));
            onTick(finalStyle, 1, easingFn(1));
            onComplete(finalStyle, t, easingFn(t));
            // unregister the animation
            delete _this2[Animate['@animations']][name];
            return;
            // the animation is not over yet
          }
          var currentStyle = Object.keys(interpolators).reduce(function (_currentStyle, key) {
            _currentStyle[key] = interpolators[key](easingFn(t));
            return _currentStyle;
          }, {});
          _this2.setState(_defineProperty({}, stateKey, currentStyle));
          onTick(currentStyle, t, easingFn(t));
          Object.assign(_this2[Animate['@animations']][name], { nextTick: (0, _raf2['default'])(tick), t: t, currentStyle: currentStyle });
        };

        // register the animation
        this[Animate['@animations']][name] = {
          easingFn: easingFn,
          onAbort: onAbort,
          nextTick: (0, _raf2['default'])(tick),
          t: 0,
          currentStyle: fromStyle
        };
        return this;
      }
    }]);

    return _class;
  })(Component);
};

exports['default'] = Animate;
module.exports = exports['default'];

