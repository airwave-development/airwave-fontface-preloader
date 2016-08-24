(function() {
	var FontFacePreloader = function FontFacePreloader(family, optionDescriptors) {
		var descriptors = optionDescriptors || {};

		/**
		 * @type {string}
		 */
		this.family = family;

		/**
		 * @type {string}
		 */
		this.style = descriptors.style || 'normal';

		/**
		 * @type {string}
		 */
		this.weight = descriptors.weight || 'normal';

		/**
		 * @type {string}
		 */
		this.stretch = descriptors.stretch || 'normal';
	};

	var Dom = function Dom() {
		/**
		 * @private
		 * @return {boolean}
		 */
		var self = this;
		self.supportsAddEventListener = function() {
			return !!document.addEventListener;
		};

		/**
		 * @param {string} name
		 * @return {Element}
		 */
		self.createElement = function(name) {
			return document.createElement(name);
		};

		/**
		 * @param {string} text
		 * @return {Text}
		 */
		self.createText = function(text) {
			return document.createTextNode(text);
		};

		/**
		 * @param {Element} element
		 * @param {string} style
		 */
		self.style = function(element, style) {
			element.style.cssText = style;
		};

		/**
		 * @param {Node} parent
		 * @param {Node} child
		 */
		self.append = function(parent, child) {
			parent.appendChild(child);
		};

		/**
		 * @param {Node} parent
		 * @param {Node} child
		 */
		self.remove = function(parent, child) {
			parent.removeChild(child);
		};

		/**
		 * @param {Element} element
		 * @param {string} className
		 *
		 * @return {boolean}
		 */
		self.hasClass = function(element, className) {
			return element.className.split(/\s+/).indexOf(className) !== -1;
		};

		/**
		 * @param {Element} element
		 * @param {string} className
		 */
		self.addClass = function(element, className) {
			if (!self.hasClass(element, className)) {
				element.className += ' ' + className;
			}
		};

		/**
		 * @param {Element} element
		 * @param {string} className
		 */
		self.removeClass = function(element, className) {
			if (self.hasClass(element, className)) {
				var parts = element.className.split(/\s+/);
				var index = parts.indexOf(className);

				parts.splice(index, 1);

				element.className = parts.join(' ');
			}
		};

		/**
		 * @param {Element} element
		 * @param {string} oldClassName
		 * @param {string} newClassName
		 */
		self.replaceClass = function(element, oldClassName, newClassName) {
			if (self.hasClass(element, oldClassName)) {
				var parts = element.className.split(/\s+/);
				var index = parts.indexOf(oldClassName);

				parts[index] = newClassName;

				element.className = parts.join(' ');
			}
		};

		/**
		 * @param {Element} element
		 * @param {string} event
		 * @param {function(Event)} callback
		 */
		self.addListener = function(element, event, callback) {
			if (self.supportsAddEventListener()) {
				element.addEventListener(event, callback, false);
			} else {
				element.attachEvent(event, callback);
			}
		};

		/**
		 * @param {function()} callback
		 */
		self.waitForBody = function(callback) {
			if (document.body) {
				callback();
			} else {
				if (self.supportsAddEventListener()) {
					document.addEventListener('DOMContentLoaded', function listener() {
						document.removeEventListener('DOMContentLoaded', listener);
						callback();
					});
				} else {
					// IE8
					document.attachEvent('onreadystatechange', function listener() {
						if (document.readyState === 'interactive' || document.readyState === 'complete') {
							document.detachEvent('onreadystatechange', listener);
							callback();
						}
					});
				}
			}
		};
	};

	var dom = new Dom();

	var Ruler = function Ruler(text) {
		var style = 'max-width:none;' +
			'display:inline-block;' +
			'position:absolute;' +
			'height:100%;' +
			'width:100%;' +
			'overflow:scroll;' +
			'font-size:16px;';

		this.element = dom.createElement('div');
		this.element.setAttribute('aria-hidden', 'true');

		dom.append(this.element, dom.createText(text));

		this.collapsible = dom.createElement('span');
		this.expandable = dom.createElement('span');
		this.collapsibleInner = dom.createElement('span');
		this.expandableInner = dom.createElement('span');

		this.lastOffsetWidth = -1;

		dom.style(this.collapsible, style);
		dom.style(this.expandable, style);
		dom.style(this.expandableInner, style);
		dom.style(this.collapsibleInner, 'display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;');

		dom.append(this.collapsible, this.collapsibleInner);
		dom.append(this.expandable, this.expandableInner);

		dom.append(this.element, this.collapsible);
		dom.append(this.element, this.expandable);
	};

	/**
	 * @return {Element}
	 */
	Ruler.prototype.getElement = function() {
		return this.element;
	};

	/**
	 * @param {string} font
	 */
	Ruler.prototype.setFont = function(font) {
		dom.style(this.element, 'max-width:none;' +
			'min-width:20px;' +
			'min-height:20px;' +
			'display:inline-block;' +
			'overflow:hidden;' +
			'position:absolute;' +
			'width:auto;' +
			'margin:0;' +
			'padding:0;' +
			'top:-999px;' +
			'left:-999px;' +
			'white-space:nowrap;' +
			'font:' + font + ';');
	};

	/**
	 * @return {number}
	 */
	Ruler.prototype.getWidth = function() {
		return this.element.offsetWidth;
	};

	/**
	 * @param {string} width
	 */
	Ruler.prototype.setWidth = function(width) {
		this.element.style.width = width + 'px';
	};

	/**
	 * @private
	 *
	 * @return {boolean}
	 */
	Ruler.prototype.reset = function() {
		var offsetWidth = this.getWidth(),
			width = offsetWidth + 100;

		this.expandableInner.style.width = width + 'px';
		this.expandable.scrollLeft = width;
		this.collapsible.scrollLeft = this.collapsible.scrollWidth + 100;

		if (this.lastOffsetWidth !== offsetWidth) {
			this.lastOffsetWidth = offsetWidth;
			return true;
		} else {
			return false;
		}
	};

	/**
	 * @private
	 * @param {function(number)} callback
	 */
	Ruler.prototype.onScroll = function(callback) {
		if (this.reset() && this.element.parentNode !== null) {
			callback(this.lastOffsetWidth);
		}
	};

	/**
	 * @param {function(number)} callback
	 */
	Ruler.prototype.onResize = function(callback) {
		var that = this;

		function onScroll() {
			that.onScroll(callback);
		}

		dom.addListener(this.collapsible, 'scroll', onScroll);
		dom.addListener(this.expandable, 'scroll', onScroll);
		this.reset();
	};

	var Observer = FontFacePreloader;

	/**
	 * @type {null|boolean}
	 */
	Observer.HAS_WEBKIT_FALLBACK_BUG = null;

	/**
	 * @type {null|boolean}
	 */
	Observer.SUPPORTS_STRETCH = null;

	/**
	 * @type {null|boolean}
	 */
	Observer.SUPPORTS_NATIVE_FONT_LOADING = null;

	/**
	 * @type {number}
	 */
	Observer.DEFAULT_TIMEOUT = 3000;

	/**
	 * @return {string}
	 */
	Observer.getUserAgent = function() {
		return window.navigator.userAgent;
	};

	/**
	 * Returns true if this browser is WebKit and it has the fallback bug
	 * which is present in WebKit 536.11 and earlier.
	 *
	 * @return {boolean}
	 */
	Observer.hasWebKitFallbackBug = function() {
		if (Observer.HAS_WEBKIT_FALLBACK_BUG === null) {
			var match = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(Observer.getUserAgent());

			Observer.HAS_WEBKIT_FALLBACK_BUG = !!match &&
				(parseInt(match[1], 10) < 536 ||
					(parseInt(match[1], 10) === 536 &&
						parseInt(match[2], 10) <= 11));
		}
		return Observer.HAS_WEBKIT_FALLBACK_BUG;
	};

	/**
	 * Returns true if the browser supports the native font loading
	 * API.
	 *
	 * @return {boolean}
	 */
	Observer.supportsNativeFontLoading = function() {
		if (Observer.SUPPORTS_NATIVE_FONT_LOADING === null) {
			Observer.SUPPORTS_NATIVE_FONT_LOADING = !!window.FontFace;
		}
		return Observer.SUPPORTS_NATIVE_FONT_LOADING;
	};

	/**
	 * Returns true if the browser supports font-style in the font
	 * short-hand syntax.
	 *
	 * @return {boolean}
	 */
	Observer.supportStretch = function() {
		if (Observer.SUPPORTS_STRETCH === null) {
			var div = dom.createElement('div');

			try {
				div.style.font = 'condensed 100px sans-serif';
			} catch (e) {}
			Observer.SUPPORTS_STRETCH = (div.style.font !== '');
		}

		return Observer.SUPPORTS_STRETCH;
	};

	/**
	 * @private
	 *
	 * @param {string} family
	 * @return {string}
	 */
	Observer.prototype.getStyle = function(family) {
		return [this.style, this.weight, Observer.supportStretch() ? this.stretch : '', '100px', family].join(' ');
	};

	/**
	 * Returns the current time in milliseconds
	 *
	 * @return {number}
	 */
	Observer.prototype.getTime = function() {
		return new Date().getTime();
	};

	/**
	 * @param {string=} text Optional test string to use for detecting if a font is available.
	 * @param {number=} timeout Optional timeout for giving up on font load detection and rejecting the promise (defaults to 3 seconds).
	 * @return {Promise.<fontface.Preloader>}
	 */
	Observer.prototype.load = function(text, timeout) {
		var self = this;
		var testString = text || 'BESbswy';
		var timeoutValue = timeout || Observer.DEFAULT_TIMEOUT;
		var start = self.getTime();

		var pto;
		var cto;

		return new Promise(function(resolve, reject) {
			if (Observer.supportsNativeFontLoading()) {
				var loader = new Promise(function(resolve, reject) {
					var check = function() {
						var now = self.getTime();

						clearTimeout(cto);

						if (now - start >= timeoutValue) {
							reject(createError('Font unavailable'));
						} else {
							document.fonts.load(self.getStyle(self.family), testString).then(function(fonts) {
								if (fonts.length >= 1) {
									resolve();
								} else {
									cto = setTimeout(check, 25);
								}
							}, function() {
								clearTimeout(cto);
								reject(createError('font error'));
							});
						}
					};

					check();
				});

				var createError = function(errorMessage) {
					var error = new Error();
					error.message = errorMessage || '';

					return error;
				};

				var timer = new Promise(function(resolve, reject) {
					clearTimeout(pto);

					pto = setTimeout(function() {
						reject(createError('Font unavailable'));
					}, timeoutValue);
				});

				Promise.race([timer, loader]).then(function() {
					clearTimeout(cto);
					clearTimeout(pto);
					resolve(self);
				}, function(errorObject) {
					clearTimeout(cto);
					clearTimeout(pto);
					reject(errorObject);
				});
			} else {
				dom.waitForBody(function() {
					var rulerA = new Ruler(testString);
					var rulerB = new Ruler(testString);
					var rulerC = new Ruler(testString);

					var widthA = -1;
					var widthB = -1;
					var widthC = -1;

					var fallbackWidthA = -1;
					var fallbackWidthB = -1;
					var fallbackWidthC = -1;

					var container = dom.createElement('div');

					var timeoutId = 0;

					/**
					 * @private
					 */
					function removeContainer() {
						if (container.parentNode !== null) {
							dom.remove(container.parentNode, container);
						}
					}

					/**
					 * @private
					 *
					 * If metric compatible fonts are detected, one of the widths will be -1. This is
					 * because a metric compatible font won't trigger a scroll event. We work around
					 * this by considering a font loaded if at least two of the widths are the same.
					 * Because we have three widths, this still prevents false positives.
					 *
					 * Cases:
					 * 1) Font loads: both a, b and c are called and have the same value.
					 * 2) Font fails to load: resize callback is never called and timeout happens.
					 * 3) WebKit bug: both a, b and c are called and have the same value, but the
					 *    values are equal to one of the last resort fonts, we ignore this and
					 *    continue waiting until we get new values (or a timeout).
					 */
					function check() {
						if ((widthA !== -1 && widthB !== -1) || (widthA !== -1 && widthC !== -1) || (widthB !== -1 && widthC !== -1)) {
							if (widthA === widthB || widthA === widthC || widthB === widthC) {
								// All values are the same, so the browser has most likely loaded the web font

								if (Observer.hasWebKitFallbackBug()) {
									// Except if the browser has the WebKit fallback bug, in which case we check to see if all
									// values are set to one of the last resort fonts.

									if (((widthA === fallbackWidthA && widthB === fallbackWidthA && widthC === fallbackWidthA) ||
											(widthA === fallbackWidthB && widthB === fallbackWidthB && widthC === fallbackWidthB) ||
											(widthA === fallbackWidthC && widthB === fallbackWidthC && widthC === fallbackWidthC))) {
										// The width we got matches some of the known last resort fonts, so let's assume we're dealing with the last resort font.
										return;
									}
								}
								removeContainer();
								clearTimeout(timeoutId);
								resolve(self);
							}
						}
					}

					// This ensures the scroll direction is correct.
					container.dir = 'ltr';

					rulerA.setFont(self.getStyle('sans-serif'));
					rulerB.setFont(self.getStyle('serif'));
					rulerC.setFont(self.getStyle('monospace'));

					dom.append(container, rulerA.getElement());
					dom.append(container, rulerB.getElement());
					dom.append(container, rulerC.getElement());

					dom.append(document.body, container);

					fallbackWidthA = rulerA.getWidth();
					fallbackWidthB = rulerB.getWidth();
					fallbackWidthC = rulerC.getWidth();

					function checkForTimeout() {
						var now = self.getTime();

						if (now - start >= timeoutValue) {
							removeContainer();
							reject(self);
						} else {
							var hidden = document.hidden;
							if (hidden === true || hidden === undefined) {
								widthA = rulerA.getWidth();
								widthB = rulerB.getWidth();
								widthC = rulerC.getWidth();
								check();
							}
							timeoutId = setTimeout(checkForTimeout, 50);
						}
					}

					checkForTimeout();


					rulerA.onResize(function(width) {
						widthA = width;
						check();
					});

					rulerA.setFont(self.getStyle('"' + self.family + '",sans-serif'));

					rulerB.onResize(function(width) {
						widthB = width;
						check();
					});

					rulerB.setFont(self.getStyle('"' + self.family + '",serif'));

					rulerC.onResize(function(width) {
						widthC = width;
						check();
					});

					rulerC.setFont(self.getStyle('"' + self.family + '",monospace'));
				});
			}
		});
	};

	window.FontFacePreloader = FontFacePreloader;
})();
