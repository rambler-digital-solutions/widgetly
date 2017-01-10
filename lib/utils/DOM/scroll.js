'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scrollToTop = scrollToTop;

var _easingJs = require('easing-js');

var _easingJs2 = _interopRequireDefault(_easingJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
  return setTimeout(callback, 1000 / 60);
};

function scrollToTop(element, scrollTargetY) {
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;
  var easing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'easeIn';

  return new Promise(function (resolve) {
    var linear = function linear(pos) {
      return pos;
    };
    var scrollY = getCurrentScroll();
    var currentTime = 0;
    scrollTargetY = Math.max(scrollTargetY, 0);

    // min time .1, max time .8 seconds
    // const time = Math.max(0.1, Math.min(Math.abs(scrollY - scrollTargetY) / duration, 0.8))

    function tick() {
      currentTime += 1 / 60;

      var p = currentTime / (duration / 1e3);
      var t = (_easingJs2.default[easing] || linear)(p);

      if (p < 1) {
        requestAnimFrame(tick);
        var resScroll = Math.round(scrollY + (scrollTargetY - scrollY) * t);
        setScroll(resScroll);
      } else {
        setScroll(scrollTargetY);
        resolve();
      }
    }

    function setScroll(value) {
      if (element === document.body || element === document.documentElement) window.scrollTo(0, value);else element.scrollTop = value;
    }

    function getCurrentScroll() {
      if (element === document.body || element === document.documentElement) return document.body.scrollTop || document.documentElement.scrollTop;
      return element.scrollTop;
    }

    tick();
  });
}