var Neutral = (function (exports) {
    'use strict';

    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function (s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s);
                    var i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {
                    }
                    return i > -1;
                };
    }
    var registerEventOptions = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function () {
                registerEventOptions = { passive: true };
            }
        });
        window.addEventListener('dummy', null, opts);
    }
    catch (e) {
    }
    function registerEventListener(element, event, callback) {
        if (element.addEventListener) {
            element.addEventListener(event, callback, registerEventOptions);
            return function unregisterEvent() {
                element.removeEventListener(event, callback, registerEventOptions);
            };
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + event, callback);
            return function unregisterEvent() {
                element.detachEvent('on' + event, callback);
            };
        }
        else {
            return function () {
            };
        }
    }
    function findParentMatchingSelector(element, selector) {
        var parent = element;
        if (parent) {
            do {
                if (parent.matches(selector)) {
                    return parent;
                }
                parent = parent.parentElement;
            } while (parent != null);
        }
        return null;
    }
    function getStyleSheetValue(ruleSelector, propName) {
        for (var sheetIdx = 0; sheetIdx < document.styleSheets.length; sheetIdx++) {
            var sheet = document.styleSheets.item(sheetIdx);
            if (sheet) {
                var rules = void 0;
                if (sheet.cssRules) {
                    rules = sheet.cssRules;
                }
                else {
                    rules = sheet.rules;
                }
                for (var ruleIdx = 0; ruleIdx < rules.length; ruleIdx++) {
                    var rule = rules.item(ruleIdx);
                    if (rule.selectorText && ((rule.selectorText === ruleSelector) || (rule.selectorText.split(',').indexOf(ruleSelector) >= 0))) {
                        return rule.style[propName];
                    }
                }
            }
        }
        return undefined;
    }
    function getValueOrCSSProp(valueOrRuleSelector, cssProp) {
        var result = 0;
        if (valueOrRuleSelector) {
            if (typeof valueOrRuleSelector === 'string') {
                var cssValue = getStyleSheetValue(valueOrRuleSelector, cssProp);
                if (cssValue && (cssValue.substr(cssValue.length - 2) === 'px')) {
                    result = parseInt(cssValue, 10);
                }
                else {
                    throw Error('CSS property ' + cssProp + ' value "' + cssValue + '" is not in pixels.');
                }
            }
            else if (typeof valueOrRuleSelector === 'number') {
                result = valueOrRuleSelector;
            }
        }
        return result;
    }
    function isWindow(elementOrWindow) {
        return elementOrWindow === window;
    }

    var ScrollLimiter = (function () {
        function ScrollLimiter(element) {
            this.left = 0;
            this.top = 0;
            this.right = Infinity;
            this.bottom = Infinity;
            this.element = element;
            this.refCount = 1;
        }
        ScrollLimiter.prototype.increaseRef = function () {
            this.refCount += 1;
        };
        ScrollLimiter.prototype.decreaseRef = function () {
            this.refCount -= 1;
            return this.refCount <= 0;
        };
        return ScrollLimiter;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var ScrollStacker = (function () {
        function ScrollStacker(winLeft, winTop, limiter, baseElement, stackElement, stackWidth, stackHeight, canUseFixed, trackOffset, callback) {
            this.enabled = true;
            var rect = baseElement.getBoundingClientRect();
            this.limiter = limiter;
            this.baseElement = baseElement;
            this.baseLeft = winLeft + rect.left;
            this.baseTop = winTop + rect.top;
            this.baseRight = winLeft + rect.right;
            this.baseBottom = winTop + rect.bottom;
            this.stackElement = stackElement;
            this.stackWidth = getValueOrCSSProp(stackWidth, 'width');
            this.stackHeight = getValueOrCSSProp(stackHeight, 'height');
            this.canUseFixed = canUseFixed;
            this.trackOffset = trackOffset;
            this.callback = callback;
            this.lastStacked = false;
            this.stacked = false;
            this.offset = 0;
            this.fixedOffset = 0;
            this.useFixed = false;
            this.hidden = false;
            this.changed = false;
        }
        ScrollStacker.prototype.unregister = function () {
            this.callback(false, 0, false, false, false);
        };
        ScrollStacker.prototype.enable = function () {
            this.enabled = true;
        };
        ScrollStacker.prototype.disable = function () {
            this.enabled = false;
        };
        return ScrollStacker;
    }());

    var ScrollStackerTop = (function (_super) {
        __extends(ScrollStackerTop, _super);
        function ScrollStackerTop() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScrollStackerTop.prototype.update = function (offsetPos, winPos, winSize, useFixed, hideNonFixed, restack, resize, winLeft, winTop) {
            if (!this.enabled) {
                if (this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            }
            else {
                if (resize) {
                    var rect = this.baseElement.getBoundingClientRect();
                    this.baseLeft = rect.left - winLeft;
                    this.baseTop = winPos + rect.top - winTop;
                    this.baseRight = rect.right - winLeft;
                    this.baseBottom = winPos + rect.bottom - winTop;
                }
                if ((winPos + offsetPos > this.limiter.top) && (winPos + offsetPos < this.limiter.bottom - this.stackHeight)) {
                    if ((winPos + offsetPos > this.baseTop) && (!useFixed || !this.canUseFixed || this.trackOffset || !this.stacked || restack)) {
                        var offset = winPos + offsetPos;
                        this.changed = true;
                        this.stacked = true;
                        this.offset = offset;
                        this.fixedOffset = offsetPos;
                        if (useFixed && this.canUseFixed) {
                            this.useFixed = true;
                            this.hidden = false;
                        }
                        else {
                            this.useFixed = false;
                            this.hidden = hideNonFixed;
                        }
                    }
                    else if ((winPos + offsetPos <= this.baseTop) && this.stacked) {
                        this.changed = true;
                        this.stacked = false;
                        this.offset = 0;
                        this.fixedOffset = 0;
                        this.useFixed = false;
                        this.hidden = false;
                        this.lastStacked = false;
                    }
                }
                else if (this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            }
            return (this.stacked ? this.stackHeight : 0);
        };
        ScrollStackerTop.prototype.apply = function () {
            if (this.changed) {
                this.changed = false;
                if (this.stacked) {
                    if (this.useFixed) {
                        this.stackElement.style.top = this.fixedOffset.toFixed(0) + 'px';
                    }
                    else {
                        this.stackElement.style.top = this.offset.toFixed(0) + 'px';
                    }
                }
                else {
                    this.stackElement.style.top = '';
                }
                this.callback(this.stacked, this.offset, this.useFixed, this.hidden, this.lastStacked);
            }
        };
        ScrollStackerTop.prototype.simulate = function (offsetPos, winPos, winSize) {
            if ((winPos + offsetPos > this.limiter.top) && (winPos + offsetPos < this.limiter.bottom - this.stackHeight)) {
                if (winPos + offsetPos > this.baseTop) {
                    return this.stackHeight;
                }
            }
            return 0;
        };
        return ScrollStackerTop;
    }(ScrollStacker));

    var ScrollStackerBottom = (function (_super) {
        __extends(ScrollStackerBottom, _super);
        function ScrollStackerBottom() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScrollStackerBottom.prototype.update = function (offsetPos, winPos, winSize, useFixed, hideNonFixed, restack, resize, winLeft, winTop) {
            if (!this.enabled) {
                if (this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            }
            else {
                if (resize) {
                    var rect = this.baseElement.getBoundingClientRect();
                    this.baseLeft = rect.left - winLeft;
                    this.baseTop = winPos + rect.top - winTop;
                    this.baseRight = rect.right - winLeft;
                    this.baseBottom = winPos + rect.bottom - winTop;
                }
                if ((winPos + winSize - offsetPos > this.limiter.top + this.stackHeight) && (winPos + winSize - offsetPos < this.limiter.bottom)) {
                    if ((winPos + winSize - offsetPos < this.baseBottom) && (!useFixed || !this.canUseFixed || this.trackOffset || !this.stacked || restack)) {
                        var offset = (winPos + winSize) - offsetPos - this.stackHeight;
                        this.changed = true;
                        this.stacked = true;
                        this.offset = offset;
                        this.fixedOffset = offsetPos;
                        if (useFixed && this.canUseFixed) {
                            this.useFixed = true;
                            this.hidden = false;
                        }
                        else {
                            this.useFixed = false;
                            this.hidden = hideNonFixed;
                        }
                    }
                    else if ((winPos + winSize - offsetPos >= this.baseBottom) && this.stacked) {
                        this.changed = true;
                        this.stacked = false;
                        this.offset = 0;
                        this.fixedOffset = 0;
                        this.useFixed = false;
                        this.hidden = false;
                        this.lastStacked = false;
                    }
                }
                else if (this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            }
            return (this.stacked ? this.stackHeight : 0);
        };
        ScrollStackerBottom.prototype.apply = function () {
            if (this.changed) {
                this.changed = false;
                if (this.stacked) {
                    if (this.useFixed) {
                        this.stackElement.style.bottom = this.fixedOffset.toFixed(0) + 'px';
                    }
                    else {
                        this.stackElement.style.top = this.offset.toFixed(0) + 'px';
                    }
                }
                else {
                    if (this.useFixed) {
                        this.stackElement.style.bottom = '';
                    }
                    else {
                        this.stackElement.style.top = '';
                    }
                }
                this.callback(this.stacked, this.offset, this.useFixed, this.hidden, this.lastStacked);
            }
        };
        ScrollStackerBottom.prototype.simulate = function (offsetPos, winPos, winSize) {
            if ((winPos + winSize - offsetPos > this.limiter.top + this.stackHeight) && (winPos + winSize - offsetPos < this.limiter.bottom)) {
                if (winPos + winSize - offsetPos < this.baseBottom) {
                    return this.stackHeight;
                }
            }
            return 0;
        };
        return ScrollStackerBottom;
    }(ScrollStacker));

    var ScrollStackerLeft = (function (_super) {
        __extends(ScrollStackerLeft, _super);
        function ScrollStackerLeft() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScrollStackerLeft.prototype.update = function (offsetPos, winPos, winSize, useFixed, hideNonFixed, restack, resize, winLeft, winTop) {
            if (!this.enabled) {
                if (this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            }
            else {
                if (resize) {
                    var rect = this.baseElement.getBoundingClientRect();
                    this.baseLeft = winPos + rect.left - winLeft;
                    this.baseTop = rect.top - winTop;
                    this.baseRight = winPos + rect.right - winLeft;
                    this.baseBottom = rect.bottom - winTop;
                }
                if ((winPos + offsetPos > this.limiter.left) && (winPos + offsetPos < this.limiter.right - this.stackWidth)) {
                    if ((winPos + offsetPos > this.baseLeft) && (!useFixed || !this.canUseFixed || this.trackOffset || !this.stacked || restack)) {
                        var offset = winPos + offsetPos;
                        this.changed = true;
                        this.stacked = true;
                        this.offset = offset;
                        this.fixedOffset = offsetPos;
                        if (useFixed && this.canUseFixed) {
                            this.useFixed = true;
                            this.hidden = false;
                        }
                        else {
                            this.useFixed = false;
                            this.hidden = hideNonFixed;
                        }
                    }
                    else if ((winPos + offsetPos <= this.baseLeft) && this.stacked) {
                        this.changed = true;
                        this.stacked = false;
                        this.offset = 0;
                        this.fixedOffset = 0;
                        this.useFixed = false;
                        this.hidden = false;
                        this.lastStacked = false;
                    }
                }
                else if (this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            }
            return (this.stacked ? this.stackWidth : 0);
        };
        ScrollStackerLeft.prototype.apply = function () {
            if (this.changed) {
                this.changed = false;
                if (this.stacked) {
                    if (this.useFixed) {
                        this.stackElement.style.left = this.fixedOffset.toFixed(0) + 'px';
                    }
                    else {
                        this.stackElement.style.left = this.offset.toFixed(0) + 'px';
                    }
                }
                else {
                    this.stackElement.style.left = '';
                }
                this.callback(this.stacked, this.offset, this.useFixed, this.hidden, this.lastStacked);
            }
        };
        ScrollStackerLeft.prototype.simulate = function (offsetPos, winPos, winSize) {
            if ((winPos + offsetPos > this.limiter.left) && (winPos + offsetPos < this.limiter.right - this.stackWidth)) {
                if (winPos + offsetPos > this.baseLeft) {
                    return this.stackHeight;
                }
            }
            return 0;
        };
        return ScrollStackerLeft;
    }(ScrollStacker));

    var ScrollStackerRight = (function (_super) {
        __extends(ScrollStackerRight, _super);
        function ScrollStackerRight() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScrollStackerRight.prototype.update = function (offsetPos, winPos, winSize, useFixed, hideNonFixed, restack, resize, winLeft, winTop) {
            if (!this.enabled) {
                if (this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            }
            else {
                if (resize) {
                    var rect = this.baseElement.getBoundingClientRect();
                    this.baseLeft = winPos + rect.left - winLeft;
                    this.baseTop = rect.top - winTop;
                    this.baseRight = winPos + rect.right - winLeft;
                    this.baseBottom = rect.bottom - winTop;
                }
                if ((winPos + winSize - offsetPos > this.limiter.left + this.stackWidth) && (winPos + winSize - offsetPos < this.limiter.right)) {
                    if ((winPos + winSize - offsetPos < this.baseRight) && (!useFixed || !this.canUseFixed || this.trackOffset || !this.stacked || restack)) {
                        var offset = (winPos + winSize) - offsetPos - this.stackWidth;
                        this.changed = true;
                        this.stacked = true;
                        this.offset = offset;
                        this.fixedOffset = offsetPos;
                        if (useFixed && this.canUseFixed) {
                            this.useFixed = true;
                            this.hidden = false;
                        }
                        else {
                            this.useFixed = false;
                            this.hidden = hideNonFixed;
                        }
                    }
                    else if ((winPos + winSize - offsetPos >= this.baseRight) && this.stacked) {
                        this.changed = true;
                        this.stacked = false;
                        this.offset = 0;
                        this.fixedOffset = 0;
                        this.useFixed = false;
                        this.hidden = false;
                        this.lastStacked = false;
                    }
                }
                else if (this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            }
            return (this.stacked ? this.stackWidth : 0);
        };
        ScrollStackerRight.prototype.apply = function () {
            if (this.changed) {
                this.changed = false;
                if (this.stacked) {
                    if (this.useFixed) {
                        this.stackElement.style.right = this.fixedOffset.toFixed(0) + 'px';
                    }
                    else {
                        this.stackElement.style.left = this.offset.toFixed(0) + 'px';
                    }
                }
                else {
                    if (this.useFixed) {
                        this.stackElement.style.right = '';
                    }
                    else {
                        this.stackElement.style.left = '';
                    }
                }
                this.callback(this.stacked, this.offset, this.useFixed, this.hidden, this.lastStacked);
            }
        };
        ScrollStackerRight.prototype.simulate = function (offsetPos, winPos, winSize) {
            if ((winPos + winSize - offsetPos > this.limiter.left + this.stackWidth) && (winPos + winSize - offsetPos < this.limiter.right)) {
                if (winPos + winSize - offsetPos < this.baseRight) {
                    return this.stackHeight;
                }
            }
            return 0;
        };
        return ScrollStackerRight;
    }(ScrollStacker));

    var AnchorTracker = (function () {
        function AnchorTracker(baseElement, anchoredElement, anchorClass, anchorClasses, callback) {
            var _this = this;
            this.changed = false;
            this.enabled = true;
            this.enable = function () {
                _this.enabled = true;
            };
            this.disable = function () {
                _this.enabled = false;
            };
            this.baseElement = baseElement;
            this.anchoredElement = anchoredElement;
            this.defaultClass = anchorClass;
            this.currentClass = anchorClass;
            this.classes = anchorClasses;
            this.callback = callback;
        }
        AnchorTracker.prototype.update = function (winTop, winRight, winBottom, winLeft) {
            var currentClass;
            if (this.enabled) {
                var baseRect = this.baseElement.getBoundingClientRect();
                var anchoredRect = this.anchoredElement.getBoundingClientRect();
                var defaultClass = this.defaultClass;
                var classes = this.classes;
                var elemWidth = anchoredRect.right - anchoredRect.left;
                var elemHeight = anchoredRect.bottom - anchoredRect.top;
                if ((defaultClass === classes.topLeft)
                    || (defaultClass === classes.topRight)
                    || (defaultClass === classes.bottomLeft)
                    || (defaultClass === classes.bottomRight)) {
                    currentClass = this.calculateVertClass(baseRect, elemWidth, elemHeight, winTop, winRight, winBottom, winLeft);
                }
                else {
                    currentClass = this.calculateHorizClass(baseRect, elemWidth, elemHeight, winTop, winRight, winBottom, winLeft);
                }
            }
            else {
                currentClass = this.defaultClass;
            }
            if (currentClass !== this.currentClass) {
                this.changed = true;
                this.currentClass = currentClass;
            }
        };
        AnchorTracker.prototype.apply = function () {
            if (this.changed) {
                this.changed = false;
                this.callback(this.currentClass);
            }
        };
        AnchorTracker.prototype.calculateHorizClass = function (baseRect, elemWidth, elemHeight, winTop, winRight, winBottom, winLeft) {
            var leftTop = this.visibleArea(baseRect.right, baseRect.top, baseRect.right + elemWidth, baseRect.top + elemHeight, winLeft, winTop, winRight, winBottom);
            var leftBottom = this.visibleArea(baseRect.right, baseRect.bottom - elemHeight, baseRect.right + elemWidth, baseRect.bottom, winLeft, winTop, winRight, winBottom);
            var rightTop = this.visibleArea(baseRect.left - elemWidth, baseRect.top, baseRect.left, baseRect.top + elemHeight, winLeft, winTop, winRight, winBottom);
            var rightBottom = this.visibleArea(baseRect.left - elemWidth, baseRect.bottom - elemHeight, baseRect.left, baseRect.bottom, winLeft, winTop, winRight, winBottom);
            var defaultClass = this.defaultClass;
            var classes = this.classes;
            if (defaultClass === classes.leftTop) {
                if ((leftTop >= rightTop) && (leftTop >= leftBottom) && (leftTop >= rightBottom)) {
                    return classes.leftTop;
                }
                else if ((leftBottom >= leftTop) && (leftBottom >= rightTop) && (leftBottom >= rightBottom)) {
                    return classes.leftBottom;
                }
                else if ((rightTop >= leftTop) && (rightTop >= leftBottom) && (rightTop >= rightBottom)) {
                    return classes.rightTop;
                }
                else {
                    return classes.rightBottom;
                }
            }
            else if (defaultClass === classes.rightTop) {
                if ((rightTop >= leftTop) && (rightTop >= leftBottom) && (rightTop >= rightBottom)) {
                    return classes.rightTop;
                }
                else if ((rightBottom >= leftTop) && (rightBottom >= rightTop) && (rightBottom >= leftBottom)) {
                    return classes.rightBottom;
                }
                else if ((leftTop >= rightTop) && (leftTop >= leftBottom) && (leftTop >= rightBottom)) {
                    return classes.leftTop;
                }
                else {
                    return classes.leftBottom;
                }
            }
            else if (defaultClass === classes.leftBottom) {
                if ((leftBottom >= leftTop) && (leftBottom >= rightTop) && (leftBottom >= rightBottom)) {
                    return classes.leftBottom;
                }
                else if ((leftTop >= rightTop) && (leftTop >= leftBottom) && (leftTop >= rightBottom)) {
                    return classes.leftTop;
                }
                else if ((rightBottom >= leftTop) && (rightBottom >= rightTop) && (rightBottom >= leftBottom)) {
                    return classes.rightBottom;
                }
                else {
                    return classes.rightTop;
                }
            }
            else {
                if ((rightBottom >= leftTop) && (rightBottom >= rightTop) && (rightBottom >= leftBottom)) {
                    return classes.rightBottom;
                }
                else if ((rightTop >= leftTop) && (rightTop >= leftBottom) && (rightTop >= rightBottom)) {
                    return classes.rightTop;
                }
                else if ((leftBottom >= leftTop) && (leftBottom >= rightTop) && (leftBottom >= rightBottom)) {
                    return classes.leftBottom;
                }
                else {
                    return classes.leftTop;
                }
            }
        };
        AnchorTracker.prototype.calculateVertClass = function (baseRect, elemWidth, elemHeight, winTop, winRight, winBottom, winLeft) {
            var topLeft = this.visibleArea(baseRect.left, baseRect.bottom, baseRect.left + elemWidth, baseRect.bottom + elemHeight, winLeft, winTop, winRight, winBottom);
            var topRight = this.visibleArea(baseRect.right - elemWidth, baseRect.bottom, baseRect.right, baseRect.bottom + elemHeight, winLeft, winTop, winRight, winBottom);
            var bottomLeft = this.visibleArea(baseRect.left, baseRect.top - elemHeight, baseRect.left + elemWidth, baseRect.top, winLeft, winTop, winRight, winBottom);
            var bottomRight = this.visibleArea(baseRect.right - elemWidth, baseRect.top - elemHeight, baseRect.right, baseRect.top, winLeft, winTop, winRight, winBottom);
            var defaultClass = this.defaultClass;
            var classes = this.classes;
            if (defaultClass === classes.topLeft) {
                if ((topLeft >= topRight) && (topLeft >= bottomLeft) && (topLeft >= bottomRight)) {
                    return classes.topLeft;
                }
                else if ((bottomLeft >= topLeft) && (bottomLeft >= topRight) && (bottomLeft >= bottomRight)) {
                    return classes.bottomLeft;
                }
                else if ((topRight >= topLeft) && (topRight >= bottomLeft) && (topRight >= bottomRight)) {
                    return classes.topRight;
                }
                else {
                    return classes.bottomRight;
                }
            }
            else if (defaultClass === classes.topRight) {
                if ((topRight >= topLeft) && (topRight >= bottomLeft) && (topRight >= bottomRight)) {
                    return classes.topRight;
                }
                else if ((bottomRight >= topLeft) && (bottomRight >= topRight) && (bottomRight >= bottomLeft)) {
                    return classes.bottomRight;
                }
                else if ((topLeft >= topRight) && (topLeft >= bottomLeft) && (topLeft >= bottomRight)) {
                    return classes.topLeft;
                }
                else {
                    return classes.bottomLeft;
                }
            }
            else if (defaultClass === classes.bottomLeft) {
                if ((bottomLeft >= topLeft) && (bottomLeft >= topRight) && (bottomLeft >= bottomRight)) {
                    return classes.bottomLeft;
                }
                else if ((topLeft >= topRight) && (topLeft >= bottomLeft) && (topLeft >= bottomRight)) {
                    return classes.topLeft;
                }
                else if ((bottomRight >= topLeft) && (bottomRight >= topRight) && (bottomRight >= bottomLeft)) {
                    return classes.bottomRight;
                }
                else {
                    return classes.topRight;
                }
            }
            else {
                if ((bottomRight >= topLeft) && (bottomRight >= topRight) && (bottomRight >= bottomLeft)) {
                    return classes.bottomRight;
                }
                else if ((topRight >= topLeft) && (topRight >= bottomLeft) && (topRight >= bottomRight)) {
                    return classes.topRight;
                }
                else if ((bottomLeft >= topLeft) && (bottomLeft >= topRight) && (bottomLeft >= bottomRight)) {
                    return classes.bottomLeft;
                }
                else {
                    return classes.topLeft;
                }
            }
        };
        AnchorTracker.prototype.visibleArea = function (elemLeft, elemTop, elemRight, elemBottom, winLeft, winTop, winRight, winBottom) {
            var widthOverlap = Math.max(0, Math.min(elemRight, winRight) - Math.max(elemLeft, winLeft));
            var heightOverlap = Math.max(0, Math.min(elemBottom, winBottom) - Math.max(elemTop, winTop));
            return widthOverlap * heightOverlap;
        };
        return AnchorTracker;
    }());

    var StackerLocation;
    (function (StackerLocation) {
        StackerLocation[StackerLocation["TOP"] = 0] = "TOP";
        StackerLocation[StackerLocation["BOTTOM"] = 1] = "BOTTOM";
        StackerLocation[StackerLocation["LEFT"] = 2] = "LEFT";
        StackerLocation[StackerLocation["RIGHT"] = 3] = "RIGHT";
    })(StackerLocation || (StackerLocation = {}));
    var ScrollTracker = (function () {
        function ScrollTracker() {
            this.globalLeft = 0;
            this.globalTop = 0;
            this.left = 0;
            this.top = 0;
            this.width = 0;
            this.height = 0;
            this.fixedTop = 0;
            this.fixedRight = 0;
            this.fixedBottom = 0;
            this.fixedLeft = 0;
            this.stackedTop = 0;
            this.stackedRight = 0;
            this.stackedBottom = 0;
            this.stackedLeft = 0;
            this.canUseFixed = false;
            this.unregisterListener = undefined;
            this.changeListeners = [];
            this.limiters = [];
            this.topStackers = [];
            this.bottomStackers = [];
            this.leftStackers = [];
            this.rightStackers = [];
            this.anchorTrackers = [];
            this.hasHiddenStackers = false;
            this.element = undefined;
            this.horizScrolled = true;
            this.vertScrolled = true;
            this.restack = true;
        }
        ScrollTracker.prototype.register = function (element, listener) {
            this.element = element;
            this.unregisterListener = registerEventListener(this.element, 'scroll', listener);
            this.canUseFixed = this.element === window;
        };
        ScrollTracker.prototype.unregister = function () {
            if (this.unregisterListener) {
                this.unregisterListener();
                this.unregisterListener = undefined;
            }
        };
        ScrollTracker.prototype.addScrollChangeListener = function (callback) {
            var _this = this;
            this.changeListeners.push(callback);
            return function () {
                var index = _this.changeListeners.indexOf(callback);
                if (index >= 0) {
                    _this.changeListeners.splice(index, 1);
                }
            };
        };
        ScrollTracker.prototype.addAnchorTracker = function (baseElement, anchoredElement, anchorClass, anchorClasses, callback) {
            var _this = this;
            var anchorTracker = new AnchorTracker(baseElement, anchoredElement, anchorClass, anchorClasses, callback);
            this.anchorTrackers.push(anchorTracker);
            return {
                unregister: function () {
                    var index = _this.anchorTrackers.indexOf(anchorTracker);
                    if (index >= 0) {
                        _this.anchorTrackers.splice(index, 1);
                    }
                },
                enable: anchorTracker.enable,
                disable: anchorTracker.disable
            };
        };
        ScrollTracker.prototype.addScrollStacker = function (baseElement, stackElement, limiterSelector, limiterSkipCount, stackWidth, stackHeight, canUseFixed, trackOffset, callback, stackerLocation) {
            this.updateScrolled();
            var winLeft = this.left;
            var winTop = this.top;
            var limitElem = null;
            if (limiterSelector) {
                limitElem = findParentMatchingSelector(baseElement, limiterSelector);
                var count = 0;
                while (limitElem && limitElem.parentElement && (count < limiterSkipCount)) {
                    var tmp = findParentMatchingSelector(limitElem.parentElement, limiterSelector);
                    if (tmp) {
                        limitElem = tmp;
                    }
                    count += 1;
                }
                if (!limitElem) {
                    throw new Error('Missing limiter element with selector "' + limiterSelector + '" skipped ' + limiterSkipCount + ' times');
                }
            }
            var limiter = this.createLimiter(limitElem);
            switch (stackerLocation) {
                case StackerLocation.TOP:
                    return this.addStackerToList(new ScrollStackerTop(winLeft, winTop, limiter, baseElement, stackElement, stackWidth, stackHeight, canUseFixed, trackOffset, callback), this.topStackers, this.sortStackerVertAscending);
                case StackerLocation.BOTTOM:
                    return this.addStackerToList(new ScrollStackerBottom(winLeft, winTop, limiter, baseElement, stackElement, stackWidth, stackHeight, canUseFixed, trackOffset, callback), this.bottomStackers, this.sortStackerVertDescending);
                case StackerLocation.LEFT:
                    return this.addStackerToList(new ScrollStackerLeft(winLeft, winTop, limiter, baseElement, stackElement, stackWidth, stackHeight, canUseFixed, trackOffset, callback), this.leftStackers, this.sortStackerHorizAscending);
                case StackerLocation.RIGHT:
                    return this.addStackerToList(new ScrollStackerRight(winLeft, winTop, limiter, baseElement, stackElement, stackWidth, stackHeight, canUseFixed, trackOffset, callback), this.rightStackers, this.sortStackerHorizDescending);
            }
        };
        ScrollTracker.prototype.sortStackerHorizAscending = function (s1, s2) {
            if (s1.baseLeft < s2.baseLeft) {
                return -1;
            }
            else if (s1.baseLeft > s2.baseLeft) {
                return 1;
            }
            return 0;
        };
        ScrollTracker.prototype.sortStackerHorizDescending = function (s1, s2) {
            if (s1.baseLeft > s2.baseLeft) {
                return -1;
            }
            else if (s1.baseLeft < s2.baseLeft) {
                return 1;
            }
            return 0;
        };
        ScrollTracker.prototype.sortStackerVertAscending = function (s1, s2) {
            if (s1.baseTop < s2.baseTop) {
                return -1;
            }
            else if (s1.baseTop > s2.baseTop) {
                return 1;
            }
            return 0;
        };
        ScrollTracker.prototype.sortStackerVertDescending = function (s1, s2) {
            if (s1.baseTop > s2.baseTop) {
                return -1;
            }
            else if (s1.baseTop < s2.baseTop) {
                return 1;
            }
            return 0;
        };
        ScrollTracker.prototype.addStackerToList = function (stacker, stackers, compareFn) {
            var _this = this;
            stackers.push(stacker);
            stackers.sort(compareFn);
            this.restack = true;
            return {
                unregister: function () {
                    _this.destroyLimiter(stacker.limiter);
                    var index = stackers.indexOf(stacker);
                    if (index >= 0) {
                        stackers.splice(index, 1);
                    }
                    stacker.unregister();
                    _this.restack = true;
                },
                enable: function () {
                    stacker.enable();
                    _this.restack = true;
                },
                disable: function () {
                    stacker.disable();
                    _this.restack = true;
                }
            };
        };
        ScrollTracker.prototype.setFixedOffsets = function (top, right, bottom, left) {
            this.fixedTop = top;
            this.fixedRight = right;
            this.fixedBottom = bottom;
            this.fixedLeft = left;
        };
        ScrollTracker.prototype.updateScrolled = function () {
            var oldLeft = this.left;
            var oldTop = this.top;
            if (this.element === window) {
                this.left = (window.pageXOffset || document.documentElement.scrollLeft);
                this.top = (window.pageYOffset || document.documentElement.scrollTop);
            }
            else if (this.element) {
                this.left = this.element.scrollLeft;
                this.top = this.element.scrollTop;
                var rect = this.element.getBoundingClientRect();
                this.globalLeft = rect.left;
                this.globalTop = rect.top;
            }
            this.horizScrolled = (oldLeft !== this.left);
            this.vertScrolled = (oldTop !== this.top);
        };
        ScrollTracker.prototype.updateResized = function () {
            if (this.element === window) {
                this.left = window.pageXOffset || document.documentElement.scrollLeft;
                this.top = window.pageYOffset || document.documentElement.scrollTop;
                this.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            }
            else if (this.element) {
                this.left = this.element.scrollLeft;
                this.top = this.element.scrollTop;
                this.width = this.element.offsetWidth;
                this.height = this.element.offsetHeight;
                var rect = this.element.getBoundingClientRect();
                this.globalLeft = rect.left;
                this.globalTop = rect.top;
            }
        };
        ScrollTracker.prototype.createLimiter = function (element) {
            for (var _i = 0, _a = this.limiters; _i < _a.length; _i++) {
                var limiter = _a[_i];
                if (limiter.element === element) {
                    limiter.increaseRef();
                    return limiter;
                }
            }
            var result = new ScrollLimiter(element || undefined);
            this.limiters.unshift(result);
            return result;
        };
        ScrollTracker.prototype.destroyLimiter = function (limiter) {
            if (limiter.decreaseRef()) {
                var index = this.limiters.indexOf(limiter);
                if (index >= 0) {
                    this.limiters.splice(index, 1);
                }
            }
        };
        ScrollTracker.prototype.updateResize = function (hideNonFixed) {
            this.updateResized();
            var globalLeft = this.globalLeft;
            var globalTop = this.globalTop;
            var winLeft = this.left;
            var winTop = this.top;
            var winWidth = this.width;
            var winHeight = this.height;
            var canUseFixed = this.canUseFixed;
            var restack = this.restack;
            this.hasHiddenStackers = false;
            for (var _i = 0, _a = this.limiters; _i < _a.length; _i++) {
                var limiter = _a[_i];
                if (!limiter.element) {
                    continue;
                }
                var rect = limiter.element.getBoundingClientRect();
                limiter.left = winLeft + rect.left - globalLeft;
                limiter.top = winTop + rect.top - globalTop;
                limiter.right = winLeft + rect.right - globalLeft;
                limiter.bottom = winTop + rect.bottom - globalTop;
            }
            this.stackedTop = this.updateStackers(this.topStackers, this.fixedTop, winTop, winHeight, canUseFixed, hideNonFixed, restack, true, globalLeft, globalTop);
            this.stackedBottom = this.updateStackers(this.bottomStackers, this.fixedBottom, winTop, winHeight, canUseFixed, hideNonFixed, restack, true, globalLeft, globalTop);
            this.stackedLeft = this.updateStackers(this.leftStackers, this.fixedLeft, winLeft, winWidth, canUseFixed, hideNonFixed, restack, true, globalLeft, globalTop);
            this.stackedRight = this.updateStackers(this.rightStackers, this.fixedRight, winLeft, winWidth, canUseFixed, hideNonFixed, restack, true, globalLeft, globalTop);
            this.updateAnchors(winWidth, winHeight);
            this.restack = false;
            return this.hasHiddenStackers;
        };
        ScrollTracker.prototype.applyResize = function () {
            for (var _i = 0, _a = this.topStackers; _i < _a.length; _i++) {
                var stacker = _a[_i];
                stacker.apply();
            }
            for (var _b = 0, _c = this.bottomStackers; _b < _c.length; _b++) {
                var stacker = _c[_b];
                stacker.apply();
            }
            for (var _d = 0, _e = this.leftStackers; _d < _e.length; _d++) {
                var stacker = _e[_d];
                stacker.apply();
            }
            for (var _f = 0, _g = this.rightStackers; _f < _g.length; _f++) {
                var stacker = _g[_f];
                stacker.apply();
            }
            for (var _h = 0, _j = this.anchorTrackers; _h < _j.length; _h++) {
                var anchor = _j[_h];
                anchor.apply();
            }
        };
        ScrollTracker.prototype.updateScroll = function (hideNonFixed) {
            this.updateScrolled();
            var globalLeft = this.globalLeft;
            var globalTop = this.globalTop;
            var winLeft = this.left;
            var winTop = this.top;
            var winWidth = this.width;
            var winHeight = this.height;
            var canUseFixed = this.canUseFixed;
            var restack = this.restack;
            this.hasHiddenStackers = false;
            if (this.vertScrolled || restack) {
                this.stackedTop = this.updateStackers(this.topStackers, this.fixedTop, winTop, winHeight, canUseFixed, hideNonFixed, restack, false, globalLeft, globalTop);
                this.stackedBottom = this.updateStackers(this.bottomStackers, this.fixedBottom, winTop, winHeight, canUseFixed, hideNonFixed, restack, false, globalLeft, globalTop);
            }
            if (this.horizScrolled || restack) {
                this.stackedLeft = this.updateStackers(this.leftStackers, this.fixedLeft, winLeft, winWidth, canUseFixed, hideNonFixed, restack, false, globalLeft, globalTop);
                this.stackedRight = this.updateStackers(this.rightStackers, this.fixedRight, winLeft, winWidth, canUseFixed, hideNonFixed, restack, false, globalLeft, globalTop);
            }
            if (this.vertScrolled || this.horizScrolled) {
                this.updateAnchors(winWidth, winHeight);
            }
            this.restack = false;
            this.horizScrolled = false;
            this.vertScrolled = false;
            return this.hasHiddenStackers;
        };
        ScrollTracker.prototype.applyScroll = function () {
            var winLeft = this.left;
            var winTop = this.top;
            var listeners = this.changeListeners.slice();
            var count = listeners.length;
            for (var n = 0; n < count; n++) {
                listeners[n].call(undefined, winLeft, winTop);
            }
            for (var _i = 0, _a = this.topStackers; _i < _a.length; _i++) {
                var stacker = _a[_i];
                stacker.apply();
            }
            for (var _b = 0, _c = this.bottomStackers; _b < _c.length; _b++) {
                var stacker = _c[_b];
                stacker.apply();
            }
            for (var _d = 0, _e = this.leftStackers; _d < _e.length; _d++) {
                var stacker = _e[_d];
                stacker.apply();
            }
            for (var _f = 0, _g = this.rightStackers; _f < _g.length; _f++) {
                var stacker = _g[_f];
                stacker.apply();
            }
            for (var _h = 0, _j = this.anchorTrackers; _h < _j.length; _h++) {
                var anchor = _j[_h];
                anchor.apply();
            }
        };
        ScrollTracker.prototype.revealHidden = function () {
            this.revealHiddenStackers(this.topStackers);
            this.revealHiddenStackers(this.bottomStackers);
            this.revealHiddenStackers(this.leftStackers);
            this.revealHiddenStackers(this.rightStackers);
        };
        ScrollTracker.prototype.updateStackers = function (stackers, fixedOffset, winPos, winSize, canUseFixed, hideNonFixed, restack, resize, winLeft, winTop) {
            var offset = fixedOffset;
            var previous;
            var hasHiddenStackers = this.hasHiddenStackers;
            for (var _i = 0, stackers_1 = stackers; _i < stackers_1.length; _i++) {
                var stacker = stackers_1[_i];
                offset = offset + stacker.update(offset, winPos, winSize, canUseFixed, hideNonFixed, restack, resize, winLeft, winTop);
                hasHiddenStackers = hasHiddenStackers || stacker.hidden;
                if (previous && previous.lastStacked && stacker.stacked) {
                    previous.lastStacked = false;
                    previous.changed = true;
                }
                if (stacker.stacked) {
                    previous = stacker;
                }
            }
            if (previous && previous.stacked && !previous.lastStacked) {
                previous.lastStacked = true;
                previous.changed = true;
            }
            else if (previous && !previous.stacked && previous.lastStacked) {
                previous.lastStacked = false;
                previous.changed = true;
            }
            this.hasHiddenStackers = hasHiddenStackers;
            return offset;
        };
        ScrollTracker.prototype.revealHiddenStackers = function (stackers) {
            for (var _i = 0, stackers_2 = stackers; _i < stackers_2.length; _i++) {
                var stacker = stackers_2[_i];
                if (stacker.hidden) {
                    stacker.hidden = false;
                    stacker.changed = true;
                }
            }
        };
        ScrollTracker.prototype.updateAnchors = function (winWidth, winHeight) {
            var anchorTrackers = this.anchorTrackers;
            if (anchorTrackers.length > 0) {
                var boxLeft = void 0;
                var boxTop = void 0;
                var boxRight = void 0;
                var boxBottom = void 0;
                var element = this.element;
                if (element) {
                    if (isWindow(element)) {
                        boxLeft = this.stackedLeft;
                        boxTop = this.stackedTop;
                        boxRight = winWidth - this.stackedRight;
                        boxBottom = winHeight - this.stackedBottom;
                    }
                    else {
                        var boxRect = element.getBoundingClientRect();
                        boxLeft = boxRect.left + this.stackedLeft;
                        boxTop = boxRect.top + this.stackedTop;
                        boxRight = boxRect.right - this.stackedRight;
                        boxBottom = boxRect.bottom - this.stackedBottom;
                    }
                    for (var _i = 0, anchorTrackers_1 = anchorTrackers; _i < anchorTrackers_1.length; _i++) {
                        var anchorTracker = anchorTrackers_1[_i];
                        anchorTracker.update(boxTop, boxRight, boxBottom, boxLeft);
                    }
                }
            }
        };
        ScrollTracker.prototype.scrollTop = function (coordOrElemOrSelector, offset, callback) {
            var targetTop = this.calcScrollTargetPos(coordOrElemOrSelector, -(offset || 0), function (rect) { return rect.top; });
            var boxTop;
            var boxHeight;
            var element = this.element;
            if (!element) {
                return;
            }
            var left;
            var top;
            if (isWindow(element)) {
                boxTop = 0;
                boxHeight = this.height;
                left = window.pageXOffset || document.documentElement.scrollLeft;
                top = window.pageYOffset || document.documentElement.scrollTop;
            }
            else {
                var boxRect = element.getBoundingClientRect();
                boxTop = boxRect.top;
                boxHeight = boxRect.bottom - boxRect.top;
                left = element.scrollLeft;
                top = element.scrollTop;
            }
            targetTop += (top - boxTop);
            targetTop -= this.simulateStackers(this.topStackers, this.fixedTop, targetTop, boxHeight);
            if (isWindow(element)) {
                if (callback) {
                    callback(left, targetTop);
                }
                else {
                    element.scrollTo(left, targetTop);
                }
            }
            else {
                if (callback) {
                    callback(element.scrollLeft, targetTop);
                }
                else {
                    element.scrollTop = targetTop;
                }
            }
        };
        ScrollTracker.prototype.scrollBottom = function (coordOrElemOrSelector, offset, callback) {
            var targetBottom = this.calcScrollTargetPos(coordOrElemOrSelector, (offset || 0), function (rect) { return rect.bottom; });
            var boxTop;
            var boxHeight;
            var element = this.element;
            if (!element) {
                return;
            }
            var left;
            var top;
            if (isWindow(element)) {
                boxTop = 0;
                boxHeight = this.height;
                left = window.pageXOffset || document.documentElement.scrollLeft;
                top = window.pageYOffset || document.documentElement.scrollTop;
            }
            else {
                var boxRect = element.getBoundingClientRect();
                boxTop = boxRect.top;
                boxHeight = boxRect.bottom - boxRect.top;
                left = element.scrollLeft;
                top = element.scrollTop;
            }
            targetBottom += (top - boxHeight - boxTop);
            targetBottom += this.simulateStackers(this.bottomStackers, this.fixedBottom, targetBottom, boxHeight);
            if (isWindow(element)) {
                if (callback) {
                    callback(left, targetBottom);
                }
                else {
                    element.scrollTo(left, targetBottom);
                }
            }
            else {
                if (callback) {
                    callback(element.scrollLeft, targetBottom);
                }
                else {
                    element.scrollTop = targetBottom;
                }
            }
        };
        ScrollTracker.prototype.scrollLeft = function (coordOrElemOrSelector, offset, callback) {
            var targetLeft = this.calcScrollTargetPos(coordOrElemOrSelector, -(offset || 0), function (rect) { return rect.left; });
            var boxLeft;
            var boxWidth;
            var element = this.element;
            if (!element) {
                return;
            }
            var left;
            var top;
            if (isWindow(element)) {
                boxLeft = 0;
                boxWidth = this.width;
                left = window.pageXOffset || document.documentElement.scrollLeft;
                top = window.pageYOffset || document.documentElement.scrollTop;
            }
            else {
                var boxRect = element.getBoundingClientRect();
                boxLeft = boxRect.left;
                boxWidth = boxRect.right - boxRect.left;
                left = element.scrollLeft;
                top = element.scrollTop;
            }
            targetLeft += (left - boxLeft);
            targetLeft -= this.simulateStackers(this.leftStackers, this.fixedLeft, targetLeft, boxWidth);
            if (isWindow(element)) {
                if (callback) {
                    callback(targetLeft, top);
                }
                else {
                    element.scrollTo(targetLeft, top);
                }
            }
            else {
                if (callback) {
                    callback(targetLeft, element.scrollTop);
                }
                else {
                    element.scrollLeft = targetLeft;
                }
            }
        };
        ScrollTracker.prototype.scrollRight = function (coordOrElemOrSelector, offset, callback) {
            var targetRight = this.calcScrollTargetPos(coordOrElemOrSelector, (offset || 0), function (rect) { return rect.right; });
            var boxLeft;
            var boxWidth;
            var element = this.element;
            if (!element) {
                return;
            }
            var left;
            var top;
            if (isWindow(element)) {
                boxLeft = 0;
                boxWidth = this.width;
                left = window.pageXOffset || document.documentElement.scrollLeft;
                top = window.pageYOffset || document.documentElement.scrollTop;
            }
            else {
                var boxRect = element.getBoundingClientRect();
                boxLeft = boxRect.left;
                boxWidth = boxRect.right - boxRect.left;
                left = element.scrollLeft;
                top = element.scrollTop;
            }
            targetRight += (left - boxWidth - boxLeft);
            targetRight += this.simulateStackers(this.rightStackers, this.fixedRight, targetRight, boxWidth);
            if (isWindow(element)) {
                if (callback) {
                    callback(targetRight, top);
                }
                else {
                    element.scrollTo(targetRight, top);
                }
            }
            else {
                if (callback) {
                    callback(targetRight, element.scrollTop);
                }
                else {
                    element.scrollLeft = targetRight;
                }
            }
        };
        ScrollTracker.prototype.scrollIntoView = function (elemOrSelector, offset, callback) {
            var targetElement = null;
            if (typeof elemOrSelector === 'string') {
                targetElement = document.querySelector(elemOrSelector);
            }
            else {
                targetElement = elemOrSelector;
            }
            if (!targetElement) {
                return;
            }
            var boxTop;
            var boxLeft;
            var boxHeight;
            var boxWidth;
            var element = this.element;
            if (!element) {
                return;
            }
            if (isWindow(element)) {
                boxTop = 0;
                boxLeft = 0;
                boxHeight = this.height;
                boxWidth = this.width;
            }
            else {
                var boxRect = element.getBoundingClientRect();
                boxTop = boxRect.top;
                boxLeft = boxRect.left;
                boxHeight = boxRect.bottom - boxRect.top;
                boxWidth = boxRect.right - boxRect.left;
            }
            var rect = targetElement.getBoundingClientRect();
            var elemTop = rect.top - boxTop;
            var elemLeft = rect.left - boxLeft;
            var elemHeight = rect.bottom - rect.top;
            var elemWidth = rect.right - rect.left;
            offset = offset || 0;
            if (elemTop - offset < this.stackedTop) {
                this.scrollTop(targetElement, offset, callback);
            }
            else if (elemTop + elemHeight + offset > boxHeight - this.stackedBottom) {
                this.scrollBottom(targetElement, offset, callback);
            }
            if (elemLeft - offset < this.stackedLeft) {
                this.scrollLeft(targetElement, offset, callback);
            }
            else if (elemLeft + elemWidth + offset > boxWidth - this.stackedRight) {
                this.scrollRight(targetElement, offset, callback);
            }
        };
        ScrollTracker.prototype.calcScrollTargetPos = function (coordOrElemOrSelector, offset, getRectProp) {
            var targetPos = offset;
            if (typeof coordOrElemOrSelector === 'number') {
                targetPos += coordOrElemOrSelector;
            }
            else {
                var targetElement = null;
                if (typeof coordOrElemOrSelector === 'string') {
                    targetElement = document.querySelector(coordOrElemOrSelector);
                }
                else {
                    targetElement = coordOrElemOrSelector;
                }
                if (targetElement) {
                    targetPos += getRectProp(targetElement.getBoundingClientRect());
                }
            }
            return targetPos;
        };
        ScrollTracker.prototype.simulateStackers = function (stackers, fixedOffset, winPos, winSize) {
            var offset = fixedOffset;
            for (var _i = 0, stackers_3 = stackers; _i < stackers_3.length; _i++) {
                var stacker = stackers_3[_i];
                offset = offset + stacker.simulate(offset, winPos, winSize);
            }
            return offset;
        };
        return ScrollTracker;
    }());

    var ScrollTrackerRegistry = (function () {
        function ScrollTrackerRegistry() {
            this.trackerMap = {};
        }
        ScrollTrackerRegistry.prototype.createTracker = function (key) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                tracker = new ScrollTracker();
                this.trackerMap[key] = tracker;
            }
            return tracker;
        };
        ScrollTrackerRegistry.prototype.destroyTracker = function (key) {
            var tracker = this.trackerMap[key];
            if (tracker) {
                tracker.unregister();
                delete this.trackerMap[key];
            }
        };
        ScrollTrackerRegistry.prototype.addScrollChangeListener = function (key, callback) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                throw new Error('Tracker key not found for addScrollChangeListener: ' + key);
            }
            return tracker.addScrollChangeListener(callback);
        };
        ScrollTrackerRegistry.prototype.addAnchorTracker = function (key, baseElement, anchoredElement, anchorClass, anchorClasses, callback) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                throw new Error('Tracker key not found for addAnchorTracker: ' + key);
            }
            return tracker.addAnchorTracker(baseElement, anchoredElement, anchorClass, anchorClasses, callback);
        };
        ScrollTrackerRegistry.prototype.addScrollStacker = function (key, baseElement, stackElement, limiterSelector, limiterSkipCount, stackWidth, stackHeight, canUseFixed, trackOffset, callback, stackerLocation) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                throw new Error('Tracker key not found for addScrollStacker: ' + key);
            }
            return tracker.addScrollStacker(baseElement, stackElement, limiterSelector, limiterSkipCount, stackWidth, stackHeight, canUseFixed, trackOffset, callback, stackerLocation);
        };
        ScrollTrackerRegistry.prototype.updateResize = function (hideNonFixed) {
            var hasHiddenStackers = false;
            var trackerMap = this.trackerMap;
            for (var key in trackerMap) {
                if (!trackerMap.hasOwnProperty(key)) {
                    continue;
                }
                hasHiddenStackers = hasHiddenStackers || trackerMap[key].updateResize(hideNonFixed);
            }
            return hasHiddenStackers;
        };
        ScrollTrackerRegistry.prototype.applyResize = function () {
            var trackerMap = this.trackerMap;
            for (var key in trackerMap) {
                if (!trackerMap.hasOwnProperty(key)) {
                    continue;
                }
                trackerMap[key].applyResize();
            }
        };
        ScrollTrackerRegistry.prototype.updateScroll = function (hideNonFixed) {
            var hasHiddenStackers = false;
            var trackerMap = this.trackerMap;
            for (var key in trackerMap) {
                if (!trackerMap.hasOwnProperty(key)) {
                    continue;
                }
                hasHiddenStackers = hasHiddenStackers || trackerMap[key].updateScroll(hideNonFixed);
            }
            return hasHiddenStackers;
        };
        ScrollTrackerRegistry.prototype.applyScroll = function () {
            var trackerMap = this.trackerMap;
            for (var key in trackerMap) {
                if (!trackerMap.hasOwnProperty(key)) {
                    continue;
                }
                trackerMap[key].applyScroll();
            }
        };
        ScrollTrackerRegistry.prototype.revealHidden = function () {
            var trackerMap = this.trackerMap;
            for (var key in trackerMap) {
                if (!trackerMap.hasOwnProperty(key)) {
                    continue;
                }
                trackerMap[key].revealHidden();
            }
        };
        ScrollTrackerRegistry.prototype.scrollTop = function (key, coordOrElemOrSelector, offset, callback) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                throw new Error('Tracker key not found for scrollTop: ' + key);
            }
            tracker.scrollTop(coordOrElemOrSelector, offset, callback);
        };
        ScrollTrackerRegistry.prototype.scrollBottom = function (key, coordOrElemOrSelector, offset, callback) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                throw new Error('Tracker key not found for scrollBottom: ' + key);
            }
            tracker.scrollBottom(coordOrElemOrSelector, offset, callback);
        };
        ScrollTrackerRegistry.prototype.scrollLeft = function (key, coordOrElemOrSelector, offset, callback) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                throw new Error('Tracker key not found for scrollLeft: ' + key);
            }
            tracker.scrollLeft(coordOrElemOrSelector, offset, callback);
        };
        ScrollTrackerRegistry.prototype.scrollRight = function (key, coordOrElemOrSelector, offset, callback) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                throw new Error('Tracker key not found for scrollRight: ' + key);
            }
            tracker.scrollRight(coordOrElemOrSelector, offset, callback);
        };
        ScrollTrackerRegistry.prototype.scrollIntoView = function (key, elemOrSelector, offset, callback) {
            var tracker = this.trackerMap[key];
            if (!tracker) {
                throw new Error('Tracker key not found for scrollIntoView: ' + key);
            }
            tracker.scrollIntoView(elemOrSelector, offset, callback);
        };
        return ScrollTrackerRegistry;
    }());

    var OverflowTracker = (function () {
        function OverflowTracker(containerElement, element, overflowWidth, overflowHeight, callback) {
            var _this = this;
            this.changed = false;
            this.overflowed = false;
            this.width = 0;
            this.height = 0;
            this.enabled = true;
            this.enable = function () {
                _this.enabled = true;
            };
            this.disable = function () {
                _this.enabled = false;
            };
            this.containerElement = containerElement;
            this.element = element;
            this.overflowWidth = overflowWidth;
            this.overflowHeight = overflowHeight;
            this.callback = callback;
        }
        OverflowTracker.prototype.update = function () {
            if (this.enabled) {
                var containerElement = this.containerElement;
                var containerWidth = 0;
                var containerHeight = 0;
                if (this.overflowWidth) {
                    containerWidth = containerElement.clientWidth;
                }
                if (this.overflowHeight) {
                    containerHeight = containerElement.clientHeight;
                }
                var element = this.element;
                var width = element.offsetWidth;
                var height = element.offsetHeight;
                var overflowed = ((containerHeight > 0) && (height > containerHeight)) || ((containerWidth > 0) && (width > containerWidth));
                if (overflowed && !this.overflowed) {
                    this.changed = true;
                    this.overflowed = true;
                    this.width = width;
                    this.height = height;
                }
                else if (!overflowed && this.overflowed) {
                    this.changed = true;
                    this.overflowed = false;
                    this.width = width;
                    this.height = height;
                }
                else if (((containerWidth > 0) && (width !== this.width))
                    || ((containerHeight > 0) && (height !== this.height))) {
                    this.changed = true;
                    this.width = width;
                    this.height = height;
                }
            }
            else {
                if (this.overflowed) {
                    this.changed = false;
                    this.overflowed = false;
                    this.width = 0;
                    this.height = 0;
                }
            }
        };
        OverflowTracker.prototype.apply = function () {
            if (this.changed) {
                this.changed = false;
                this.callback(this.overflowed, this.width, this.height);
            }
        };
        return OverflowTracker;
    }());

    var REVEAL_COUNTER_START = 10;
    var ScrollSizeManager = (function () {
        function ScrollSizeManager() {
            var _this = this;
            this.trackerRegistry = new ScrollTrackerRegistry();
            this.overflowTrackers = [];
            this.unregisterResizeListener = undefined;
            this.hideNonFixedEnabled = false;
            this.updateRequested = false;
            this.resized = false;
            this.hideNonFixedUpdate = false;
            this.revealCounter = 0;
            this.onUpdate = function () {
                _this.updateRequested = false;
                if (_this.revealCounter > 0) {
                    _this.revealCounter = _this.revealCounter - 1;
                }
                if (_this.resized) {
                    if (_this.trackerRegistry.updateResize(_this.hideNonFixedEnabled && _this.hideNonFixedUpdate)) {
                        _this.revealCounter = REVEAL_COUNTER_START;
                    }
                    for (var _i = 0, _a = _this.overflowTrackers; _i < _a.length; _i++) {
                        var overflowTracker = _a[_i];
                        overflowTracker.update();
                    }
                    if (_this.revealCounter === 0) {
                        _this.revealCounter = -1;
                        _this.trackerRegistry.revealHidden();
                    }
                    else if (_this.revealCounter > 0) {
                        _this.requestUpdate();
                    }
                    _this.trackerRegistry.applyResize();
                    for (var _b = 0, _c = _this.overflowTrackers; _b < _c.length; _b++) {
                        var overflowTracker = _c[_b];
                        overflowTracker.apply();
                    }
                }
                else {
                    if (_this.trackerRegistry.updateScroll(_this.hideNonFixedEnabled && _this.hideNonFixedUpdate)) {
                        _this.revealCounter = REVEAL_COUNTER_START;
                    }
                    if (_this.revealCounter === 0) {
                        _this.revealCounter = -1;
                        _this.trackerRegistry.revealHidden();
                    }
                    else if (_this.revealCounter > 0) {
                        _this.requestUpdate();
                    }
                    _this.trackerRegistry.applyScroll();
                }
                _this.resized = false;
                _this.hideNonFixedUpdate = false;
            };
        }
        ScrollSizeManager.prototype.startResizeTracking = function () {
            var _this = this;
            this.unregisterResizeListener = registerEventListener(window, 'resize', function () {
                _this.updateResized(true);
            });
        };
        ScrollSizeManager.prototype.stopResizeTracking = function () {
            if (this.unregisterResizeListener) {
                this.unregisterResizeListener();
                this.unregisterResizeListener = undefined;
            }
        };
        ScrollSizeManager.prototype.checkResizeFromStateChange = function () {
            this.updateResized(false);
        };
        ScrollSizeManager.prototype.hideNonFixedWhileScrolling = function (hide) {
            this.hideNonFixedEnabled = hide;
        };
        ScrollSizeManager.prototype.updateResized = function (hideNonFixed) {
            this.resized = true;
            if (hideNonFixed) {
                this.hideNonFixedUpdate = true;
            }
            this.requestUpdate();
        };
        ScrollSizeManager.prototype.addScrollTracker = function (key, element, fixedTopOffset, fixedRightOffset, fixedBottomOffset, fixedLeftOffset) {
            var _this = this;
            var tracker = this.trackerRegistry.createTracker(key);
            tracker.register(element, function (event) {
                var target = event.target || event.srcElement;
                if ((target === tracker.element) || ((!target || (target === document)) && (tracker.element === window))) {
                    _this.hideNonFixedUpdate = true;
                    _this.requestUpdate();
                }
            });
            tracker.setFixedOffsets(getValueOrCSSProp(fixedTopOffset, 'height'), getValueOrCSSProp(fixedRightOffset, 'width'), getValueOrCSSProp(fixedBottomOffset, 'height'), getValueOrCSSProp(fixedLeftOffset, 'width'));
            tracker.restack = true;
            this.updateResized(false);
        };
        ScrollSizeManager.prototype.removeTracker = function (key) {
            this.trackerRegistry.destroyTracker(key);
        };
        ScrollSizeManager.prototype.addScrollChangeListener = function (key, callback) {
            return this.trackerRegistry.addScrollChangeListener(key, callback);
        };
        ScrollSizeManager.prototype.addAnchorTracker = function (key, baseElement, anchoredElement, anchorClass, anchorClasses, callback) {
            return this.trackerRegistry.addAnchorTracker(key, baseElement, anchoredElement, anchorClass, anchorClasses, callback);
        };
        ScrollSizeManager.prototype.addOverflowTracker = function (containerElement, element, overflowWidth, overflowHeight, callback) {
            var _this = this;
            var overflowTracker = new OverflowTracker(containerElement, element, overflowWidth, overflowHeight, callback);
            this.overflowTrackers.push(overflowTracker);
            return {
                unregister: function () {
                    var index = _this.overflowTrackers.indexOf(overflowTracker);
                    if (index >= 0) {
                        _this.overflowTrackers.splice(index, 1);
                    }
                },
                enable: overflowTracker.enable,
                disable: overflowTracker.disable
            };
        };
        ScrollSizeManager.prototype.addTopStacker = function (key, baseElement, stackElement, limiterSelector, limiterSkipCount, stackHeight, canUseFixed, trackOffset, callback) {
            this.requestUpdate();
            return this.wrapStackerControl(this.trackerRegistry.addScrollStacker(key, baseElement, stackElement, limiterSelector, limiterSkipCount, 0, stackHeight, canUseFixed, trackOffset, callback, StackerLocation.TOP));
        };
        ScrollSizeManager.prototype.addBottomStacker = function (key, baseElement, stackElement, limiterSelector, limiterSkipCount, stackHeight, canUseFixed, trackOffset, callback) {
            this.requestUpdate();
            return this.wrapStackerControl(this.trackerRegistry.addScrollStacker(key, baseElement, stackElement, limiterSelector, limiterSkipCount, 0, stackHeight, canUseFixed, trackOffset, callback, StackerLocation.BOTTOM));
        };
        ScrollSizeManager.prototype.addLeftStacker = function (key, baseElement, stackElement, limiterSelector, limiterSkipCount, stackWidth, canUseFixed, trackOffset, callback) {
            this.requestUpdate();
            return this.wrapStackerControl(this.trackerRegistry.addScrollStacker(key, baseElement, stackElement, limiterSelector, limiterSkipCount, stackWidth, 0, canUseFixed, trackOffset, callback, StackerLocation.LEFT));
        };
        ScrollSizeManager.prototype.addRightStacker = function (key, baseElement, stackElement, limiterSelector, limiterSkipCount, stackWidth, canUseFixed, trackOffset, callback) {
            this.requestUpdate();
            return this.wrapStackerControl(this.trackerRegistry.addScrollStacker(key, baseElement, stackElement, limiterSelector, limiterSkipCount, stackWidth, 0, canUseFixed, trackOffset, callback, StackerLocation.RIGHT));
        };
        ScrollSizeManager.prototype.wrapStackerControl = function (control) {
            var _this = this;
            return {
                unregister: function () {
                    control.unregister();
                    _this.resized = true;
                    _this.requestUpdate();
                },
                enable: function () {
                    control.enable();
                    _this.resized = true;
                    _this.requestUpdate();
                },
                disable: function () {
                    control.disable();
                    _this.resized = true;
                    _this.requestUpdate();
                }
            };
        };
        ScrollSizeManager.prototype.requestUpdate = function () {
            if (!this.updateRequested) {
                this.updateRequested = true;
                requestAnimationFrame(this.onUpdate);
            }
        };
        ScrollSizeManager.prototype.scrollTop = function (key, coordOrElemOrSelector, offset, callback) {
            this.trackerRegistry.scrollTop(key, coordOrElemOrSelector, offset, callback);
        };
        ScrollSizeManager.prototype.scrollBottom = function (key, coordOrElemOrSelector, offset, callback) {
            this.trackerRegistry.scrollBottom(key, coordOrElemOrSelector, offset, callback);
        };
        ScrollSizeManager.prototype.scrollLeft = function (key, coordOrElemOrSelector, offset, callback) {
            this.trackerRegistry.scrollLeft(key, coordOrElemOrSelector, offset, callback);
        };
        ScrollSizeManager.prototype.scrollRight = function (key, coordOrElemOrSelector, offset, callback) {
            this.trackerRegistry.scrollRight(key, coordOrElemOrSelector, offset, callback);
        };
        ScrollSizeManager.prototype.scrollIntoView = function (key, elemOrSelector, offset, callback) {
            this.trackerRegistry.scrollIntoView(key, elemOrSelector, offset, callback);
        };
        return ScrollSizeManager;
    }());

    exports.ScrollSizeManager = ScrollSizeManager;

    return exports;

}({}));
