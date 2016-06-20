'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

var _react = require('react');

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

var AnimateProps = {
  DEFAULT_EASING: 'cubic-in-out'
};

function animatedStyleStateKey(name) {
  return 'Animate@' + name;
}

var Animate = function Animate(Component) {
  return (0, _react.createClass)({

    getInitialState: function getInitialState() {
      this.__animations = {};
      return {};
    },

    componentWillUnmount: function componentWillUnmount() {
      var _this = this;

      if (this.__animations !== null) {
        Object.keys(this.__animations, function (name) {
          var animation = _this.__animations[name];
          Animate.abortAnimation.call(_this, name, animation);
        });
      }
    },

    getAnimatedStyle: function getAnimatedStyle(name) {
      if (__DEV__) {
        name.should.be.a.String;
      }
      return this.state && this.state[animatedStyleStateKey(name)] || {};
    },

    isAnimated: function isAnimated(name) {
      if (__DEV__) {
        name.should.be.a.String;
      }
      return this.__animations[name] !== void 0;
    },

    abortAnimation: function abortAnimation(name) {
      if (__DEV__) {
        name.should.be.a.String;
      }
      if (this.__animations[name] !== void 0) {
        var _animations$name = this.__animations[name];
        var easingFn = _animations$name.easingFn;
        var onAbort = _animations$name.onAbort;
        var nextTick = _animations$name.nextTick;
        var t = _animations$name.t;
        var currentStyle = _animations$name.currentStyle;

        _raf2['default'].cancel(nextTick);
        onAbort(currentStyle, t, easingFn(t));
        // unregister the animation
        delete this.__animations[name];
        return true;
      }
      // silently fail but returns false
      return false;
    },

    animate: function animate(name, fromStyle, toStyle, duration) {
      var _this2 = this;

      var opts = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
      var _opts$easing = opts.easing;
      var easing = _opts$easing === undefined ? AnimateProps.DEFAULT_EASING : _opts$easing;
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
      if (this.__animations[name] !== void 0) {
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
          delete _this2.__animations[name];
          return;
          // the animation is not over yet
        }
        var currentStyle = Object.keys(interpolators).reduce(function (_currentStyle, key) {
          _currentStyle[key] = interpolators[key](easingFn(t));
          return _currentStyle;
        }, {});
        _this2.setState(_defineProperty({}, stateKey, currentStyle));
        onTick(currentStyle, t, easingFn(t));
        Object.assign(_this2.__animations[name], { nextTick: (0, _raf2['default'])(tick), t: t, currentStyle: currentStyle });
      };

      // register the animation
      this.__animations[name] = {
        easingFn: easingFn,
        onAbort: onAbort,
        nextTick: (0, _raf2['default'])(tick),
        t: 0,
        currentStyle: fromStyle
      };
      return this;
    },

    render: function render() {
      var _this3 = this;

      var props = {
        getAnimatedStyle: this.getAnimatedStyle,
        isAnimated: this.isAnimated,
        abortAnimation: this.abortAnimation,
        animate: this.animate
      };
      Object.keys(this.props, function (prop) {
        props[prop] = _this3.props[prop];
      });
      return (0, _react.createElement)(Component, props);
    }

  });
};

exports['default'] = Animate;
module.exports = exports['default'];

