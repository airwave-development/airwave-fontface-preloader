goog.require('fontface.Preloader');

/**
 * @define {boolean} DEBUG
 */
var DEBUG = true;

if (typeof module !== 'undefined') {
  module.exports = fontface.Preloader;
} else {
  window['FontFacePreloader'] = fontface.Preloader;
  window['FontFacePreloader']['prototype']['load'] = fontface.Preloader.prototype.load;
}
