import raf from 'raf';
import {createClass, createElement} from 'react';
import tween from 'tween-interpolate';
import 'should';

const __DEV__ = process.env.NODE_ENV === 'development';
const __BROWSER__ = typeof window === 'object';

function isMobile(userAgent) {
  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(userAgent);
}

function isGingerbread(userAgent) {
  return (/Android 2\.3\.[3-7]/i).test(userAgent);
}

// Hardware acceleration trick constants
const transformProperties = ['WebkitTransform', 'MozTransform', 'MSTransform', 'OTransform', 'Transform'];
const transformHA = 'translateZ(0)';

// Decide whether we should do the hardware accelaration trick
// if we are not explicitly prevented from.
// The trick will be enabled in mobile browsers which are not
// Android Gingerbread.
function shouldEnableHA() {
  if (!__BROWSER__) {
    return false;
  }
  const { userAgent } = navigator;
  if (!userAgent) {
    return false;
  }
  // is mobile but not gingerbread
  return isMobile(userAgent) && !isGingerbread(userAgent);
}

function enableHA(styles) {
  // for each 'transform' property, set/prepend 'translateZ(0)'
  transformProperties.forEach((property) => {
    if (styles[property] === void 0) {
      styles[property] = [transformHA, transformHA];
    }
    else {
      const [from, to] = styles[property];
      styles[property] = [`${transformHA} ${from}`, `${transformHA} ${to}`];
    }
  });
}

const AnimateProps = {
  DEFAULT_EASING: 'cubic-in-out',
};

function animatedStyleStateKey(name) {
  return `Animate@${name}`;
}

const Animate = (Component) => createClass({

  getInitialState() {
    this.__animations = {};
    return {};
  },

  componentWillUnmount() {
    if (this.__animations !== null) {
      Object.keys(this.__animations, (name) => {
        const animation = this.__animations[name];
        Animate.abortAnimation.call(this, name, animation);
      });
    }
  },

  getAnimatedStyle(name) {
    if (__DEV__) {
      name.should.be.a.String;
    }
    return this.state && this.state[animatedStyleStateKey(name)] || {};
  },

  isAnimated(name) {
    if (__DEV__) {
      name.should.be.a.String;
    }
    return this.__animations[name] !== void 0;
  },

  abortAnimation(name) {
    if (__DEV__) {
      name.should.be.a.String;
    }
    if (this.__animations[name] !== void 0) {
      const { easingFn, onAbort, nextTick, t, currentStyle } = this.__animations[name];
      raf.cancel(nextTick);
      onAbort(currentStyle, t, easingFn(t));
      // unregister the animation
      delete this.__animations[name];
      return true;
    }
    // silently fail but returns false
    return false;
  },

  animate(name, fromStyle, toStyle, duration, opts = {}) {
    const {
      easing = AnimateProps.DEFAULT_EASING,
      onTick = () => void 0,
      onAbort = () => void 0,
      onComplete = () => void 0,
      disableMobileHA = false,
    } = opts;

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
    const easingFn = typeof easing === 'object' ?
      tween.ease.apply(tween, [easing.type, ...easing.arguments]) :
      tween.ease(easing);
    // reformat the input: [property]: [from, to]
    const styles = {};
    // unless told otherwise below, the value is assumed constant
    Object.keys(fromStyle).forEach(property => {
      const value = fromStyle[property];
      styles[property] = [value, value];
    });
    // if we dont have an initial value for each property, assume it is constant from the beginning
    Object.keys(toStyle).forEach(property => {
      const value = toStyle[property];
      styles[property] = styles[property] === void 0 ? [value, value] : [styles[property][0], value];
    });
    // get an interpolator for each property
    const interpolators = Object.keys(styles).reduce((_interpolators, key) => {
      const [from, to] = styles[key];
      _interpolators[key] = tween.interpolate(from, to);
      return _interpolators;
    }, {});
    // pre-compute the final style (ignore [from])
    const finalStyle = Object.keys(styles).reduce((_finalStyle, key) => {
      _finalStyle[key] = styles[key][1];
      return _finalStyle;
    }, {});

    // do the hardware acceleration trick
    if (!disableMobileHA && shouldEnableHA()) {
      enableHA(transformProperties, styles);
    }

    const start = Date.now();
    const stateKey = animatedStyleStateKey(name);

    // the main ticker function
    const tick = () => {
      const now = Date.now();
      // progress: starts at 0, ends at > 1
      const t = (now - start) / duration;
      // we are past the end
      if (t > 1) {
        this.setState({ [stateKey]: finalStyle });
        onTick(finalStyle, 1, easingFn(1));
        onComplete(finalStyle, t, easingFn(t));
        // unregister the animation
        delete this.__animations[name];
        return;
        // the animation is not over yet
      }
      const currentStyle = Object.keys(interpolators).reduce((_currentStyle, key) => {
        _currentStyle[key] = interpolators[key](easingFn(t));
        return _currentStyle;
      }, {});
      this.setState({ [stateKey]: currentStyle });
      onTick(currentStyle, t, easingFn(t));
      Object.assign(this.__animations[name], { nextTick: raf(tick), t, currentStyle });
    };

    // register the animation
    this.__animations[name] = {
      easingFn,
      onAbort,
      nextTick: raf(tick),
      t: 0,
      currentStyle: fromStyle,
    };
    return this;
  },

  render() {
    const props = {
      getAnimatedStyle: this.getAnimatedStyle,
      isAnimated: this.isAnimated,
      abortAnimation: this.abortAnimation,
      animate: this.animate,
    };
    Object.keys(this.props, prop => {
      props[prop] = this.props[prop];
    });
    return createElement(Component, props);
  },

});

export default Animate;
