(function(window, document, undefined) {

	var FontPreloader = function FontPreloader() {
		var addEventDispatcher = function addEventDispatcher(eventObject) {
			eventObject.eventListeners = {};

			eventObject.addCustomEventListener = function(key, listenerFunction) {
				if (!eventObject.eventListeners[key] || eventObject.eventListeners[key] !== listenerFunction) {
					eventObject.eventListeners[key] = listenerFunction;
				}
			};

			eventObject.on = function(key, listenerFunction) {
				if (!eventObject.eventListeners[key] || eventObject.eventListeners[key] !== listenerFunction) {
					eventObject.eventListeners[key] = listenerFunction;
				}
			};

			eventObject.removeCustomEventListener = function(key) {
				delete eventObject.eventListeners[key];
			};

			eventObject.off = function(key) {
				delete eventObject.eventListeners[key];
			};

			eventObject.removeAllEventListeners = function(exceptionArray) {

				for (var key in eventObject.eventListeners) {
					delete eventObject.eventListeners[key];
				}

				eventObject.eventListeners = {};
			};

			eventObject.dispatchCustomEvent = function() {
				var argumentsArray = arguments;
				var functionArgumentsArray = Array.prototype.slice.call(argumentsArray, 1);

				if (eventObject.eventListeners[argumentsArray[0]] !== undefined) {
					eventObject.eventListeners[argumentsArray[0]].apply(this, functionArgumentsArray);
				}
			};
		};

		var generateString = function generateString() {
			var randomStringCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789._*&^!@#$%';
			var max = randomStringCharacters.length;
			var length = 50;

			var i;
			var returnArray = [];

			returnArray.push('&#xE87C;');

			for (i = 0; i < length; i++) {
				returnArray.push(randomStringCharacters.substr(Math.floor(Math.random() * max), 1));
			}

			return returnArray.join('');
		};

		var checkPreloaderStatus = function checkPreloaderStatus() {
			var boundingClientRect = typeof document.body.getBoundingClientRect === 'function' ? true : false;
			var offsetWidth = document.body.offsetWidth ? true : false;
			var complete = true;
			var i;

			if (!boundingClientRect && !offsetWidth) {
				self.dispatchCustomEvent('preloadReady', {
					success: false,
					error: 'clientUnSupported'
				});
				cleanPreloader();
				return;
			}


			for (i = 0; i < preloadItems; i++) {
				if (boundingClientRect) {
					if (document.getElementById('font-styled-' + i).getBoundingClientRect().width === document.getElementById('font-' + i).getBoundingClientRect().width) {
						complete = false;
					}
				}

				if (!boundingClientRect) {
					if (document.getElementById('font-styled-' + i).offsetWidth === document.getElementById('font-' + i).getBoundingClientRect().offsetWidth) {
						complete = false;
					}
				}
			}

			if (complete && !preloadComplete) {
				preloadComplete = true;
				self.dispatchCustomEvent('preloadReady', {
					success: true
				});
				cleanPreloader();
			}
		};

		var cleanPreloader = function cleanPreloader() {
			clearTimeout(preloadTimeout);
			clearInterval(preloadInterval);

			if (document.getElementById('font-preloader')) {
				document.body.removeChild(preloadElement);
			}

			preloadItems = 0;

			preloadTimeout = null;
			preloadInterval = null;
		};

		var preload = function preload(fontFace, weight, customString) {
			if (!preloadElement) {
				preloadElement = document.createElement('div');
				preloadElement.id = 'font-preloader';
				preloadElement.setAttribute('style', 'position:absolute;display:block;top:0px;width:100%;overflow:hidden;visibility:hidden;opacity:0;font-family:serif');
				document.body.appendChild(preloadElement);
			}

			var fontString = customString ? generateString() + customString : generateString();

			var fontFamily = fontFace || 'serif';
			var fontWeight = weight || '400';

			var styledSpan;
			var normalSpan;

            preloadRunning = false;
			preloadComplete = false;

			styledSpan = document.createElement('span');
			styledSpan.id = 'font-styled-' + preloadItems;
			styledSpan.setAttribute('style', 'font-family:' + fontFamily + ';font-weight:' + fontWeight + ';font-size:17px;letter-spacing:normal;white-space:nowrap;');
			styledSpan.appendChild(document.createTextNode(fontString));
			preloadElement.appendChild(styledSpan);

			normalSpan = document.createElement('span');
			normalSpan.id = 'font-' + preloadItems;
			normalSpan.setAttribute('style', 'font-weight:' + fontWeight + ';font-size:17px;letter-spacing:normal;white-space:nowrap;');
			normalSpan.appendChild(document.createTextNode(fontString));
			preloadElement.appendChild(normalSpan);

			preloadItems++;
		};

		var runPreloader = function runPreloader() {
			clearTimeout(preloadTimeout);
			clearInterval(preloadInterval);

			if (preloadItems === 0) {
				preloadComplete = true;
				self.dispatchCustomEvent('preloadReady', {
					success: false,
					error: 'noFontfacesProvided'
				});
				cleanPreloader();
				return;
			}

			preloadRunning = true;

			checkPreloaderStatus();
			preloadInterval = setInterval(function() {
				checkPreloaderStatus();
			}, 100);

			preloadTimeout = setTimeout(function() {
				preloadComplete = true;
				self.dispatchCustomEvent('preloadReady', {
					success: false,
					error: 'couldNotLoadAllFontsFaces'
				});
				cleanPreloader();
			}, preloadDefaultTimeout);
		};

		var preloadDefaultTimeout = 3000;
		var preloadItems = 0;

		var preloadComplete = false;
		var preloadRunning = false;

		var preloadTimeout;
		var preloadInterval;
		var preloadElement;

		var self = this;

		addEventDispatcher(this);

		this.preload = preload;
		this.runPreloader = runPreloader;
	};

	window.FontPreloader = FontPreloader;

})(window, document);
