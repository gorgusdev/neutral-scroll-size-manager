import * as domUtils from './dom-utils';

export interface ScrollChangeListener {
	(x: number, y: number): void;
}

export interface StackerCallback {
	(stacked: boolean, offset: number, useFixed: boolean, hidden: boolean): void;
}

interface Limiter {
	elem: Element;
	left: number;
	top: number;
	right: number;
	bottom: number;
	refCount: number;
}

interface Stacker {
	limiter: Limiter;
	baseElem: Element;
	baseLeft: number;
	baseTop: number;
	baseRight: number;
	baseBottom: number;
	stackElem: HTMLElement;
	stackWidth: number;
	stackHeight: number;
	stacked: boolean;
	canUseFixed: boolean;
	trackOffset: boolean;
	offset: number;
	callback: StackerCallback;
}

enum StackerLocation {
	TOP,
	BOTTOM,
	LEFT,
	RIGHT
}

interface ScrollTrackerRoot {
	elem: any;
	left: number;
	top: number;
	width: number;
	height: number;
	canUseFixed: boolean;
	unregisterListener: () => void;
	changeListeners: ScrollChangeListener[];
	limiters: Limiter[];
	topStackers: Stacker[];
	bottomStackers: Stacker[];
	leftStackers: Stacker[];
	rightStackers: Stacker[];
	anchorTrackers: AnchorTracker[];
}

interface ScrollTrackMap {
	[key: string]: ScrollTrackerRoot;
}

export interface OverflowCallback {
	(overflowed: boolean, width: number, height: number): void;
}

interface OverflowTracker {
	elem: Element;
	overflowWidth: boolean;
	overflowHeight: boolean;
	overflowed: boolean;
	width: number;
	height: number;
	callback: OverflowCallback;
}

export interface AnchorCallback {
	(anchorClass: string): void;
}

export interface AnchorClasses {
	topLeft: string;
	topRight: string;
	bottomLeft: string;
	bottomRight: string;
	leftTop: string;
	leftBottom: string;
	rightTop: string;
	rightBottom: string;
}

interface AnchorTracker {
	elem: Element;
	anchorElem: Element;
	defaultClass: string;
	currentClass: string;
	classes: AnchorClasses;
	callback: AnchorCallback;
}

export class ScrollSizeManager {

	private scrollTrackerRoots: ScrollTrackMap;
	private overflowTrackers: OverflowTracker[];

	private scrollDoneTimerId: any;
	private resizeTimerId: any;
	private resizeDuringTimer: boolean;
	private checkResizeTimerId: any;
	private unregisterResizeListener: () => void;

	hideNonFixed: boolean;

	constructor() {
		this.scrollTrackerRoots = {};
		this.overflowTrackers = [];
		this.scrollDoneTimerId = null;
		this.resizeTimerId = null;
		this.resizeDuringTimer = false;
		this.checkResizeTimerId = null;
		this.hideNonFixed = /msie|trident|edge/i.test(navigator.userAgent);
	}

	startResizeTracking() {
		this.unregisterResizeListener = domUtils.registerEventListener(window, 'resize', () => {
			//console.log('SSM: Resize');
			if(!this.resizeTimerId) {
				this.resizeTimerId = setTimeout(() => {
					if(this.resizeDuringTimer) {
						this.updateResize(true);
					}
					this.resizeTimerId = null;
				}, 20);
				this.updateResize(true);
				this.resizeDuringTimer = false;
			} else {
				this.resizeDuringTimer = true;
			}
		});
	}

	stopResizeTracking() {
		if(this.unregisterResizeListener) {
			this.unregisterResizeListener();
		}
	}

	checkResizeFromStateChange() {
		if(this.checkResizeTimerId) {
			return;
		}
		this.checkResizeTimerId = setTimeout(() => {
			this.checkResizeTimerId = null;
			this.updateResize(false);
		}, 0);
	}

	addScrollTracker(key: string, elem: any) {
		let tracker: ScrollTrackerRoot = this.createTrackerRoot(key, elem);
		if(tracker.elem) {
			tracker.unregisterListener = domUtils.registerEventListener(tracker.elem, 'scroll', (event: Event) => {
				//console.log('SSM: Scroll');
				let target = event.target || event.srcElement;
				if((target === tracker.elem) || ((!target || (target === document)) && (tracker.elem === window))) {
					this.updateScroll(tracker);
				}
			});
		}
		if(tracker.elem === window) {
			tracker.canUseFixed = true;
		}
		//console.log('SSM: addScrollTracker');
		this.updateResize(false);
		this.updateScroll(tracker);
	}

	removeTracker(key: string) {
		let tracker: ScrollTrackerRoot = this.scrollTrackerRoots[key];
		if(tracker) {
			if(tracker.unregisterListener) {
				tracker.unregisterListener();
			}
			delete this.scrollTrackerRoots[key];
		}
	}

	addScrollChangeListener(key: string, callback: ScrollChangeListener): () => void {
		let tracker: ScrollTrackerRoot = this.scrollTrackerRoots[key];
		if(tracker) {
			tracker.changeListeners.push(callback);
		}
		return () => {
			this.removeArrayElement(tracker.changeListeners, callback);
		};
	}

	addTopStacker(key: string, baseElem: Element, stackElem: HTMLElement, limiterSelector: string, limiterSkipCount: number, stackHeight: string|number, canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): () => void {
		return this.addStacker(key, baseElem, stackElem, limiterSelector, limiterSkipCount, 0, stackHeight, canUseFixed, trackOffset, callback, StackerLocation.TOP);
	}

	addBottomStacker(key: string, baseElem: Element, stackElem: HTMLElement, limiterSelector: string, limiterSkipCount: number, stackHeight: string|number, canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): () => void {
		return this.addStacker(key, baseElem, stackElem, limiterSelector, limiterSkipCount, 0, stackHeight, canUseFixed, trackOffset, callback, StackerLocation.BOTTOM);
	}

	addLeftStacker(key: string, baseElem: Element, stackElem: HTMLElement, limiterSelector: string, limiterSkipCount: number, stackWidth: string|number, canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): () => void {
		return this.addStacker(key, baseElem, stackElem, limiterSelector, limiterSkipCount, stackWidth, 0, canUseFixed, trackOffset, callback, StackerLocation.LEFT);
	}

	addRightStacker(key: string, baseElem: Element, stackElem: HTMLElement, limiterSelector: string, limiterSkipCount: number, stackWidth: string|number, canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): () => void {
		return this.addStacker(key, baseElem, stackElem, limiterSelector, limiterSkipCount, stackWidth, 0, canUseFixed, trackOffset, callback, StackerLocation.RIGHT);
	}

	private addStacker(key: string, baseElem: Element, stackElem: HTMLElement, limiterSelector: string, limiterSkipCount: number, stackWidth: string|number, stackHeight: string|number, canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback, stackerLocation: StackerLocation): () => void {
		let tracker: ScrollTrackerRoot = this.createTrackerRoot(key, null);
		let limitElem = domUtils.findParentMatchingSelector(baseElem, limiterSelector);
		while(limiterSkipCount > 0) {
			let tmp = domUtils.findParentMatchingSelector(limitElem.parentElement, limiterSelector);
			if(tmp) {
				limitElem = tmp;
			}
			limiterSkipCount -= 1;
		}
		let width = 0;
		if(typeof stackWidth === 'string') {
			let cssValue: string = domUtils.getStyleSheetValue(stackWidth, 'width');
			if(cssValue && (cssValue.substr(cssValue.length - 2) === 'px')) {
				width = parseInt(cssValue);
			} else {
				console.error('Stacker CSS width value is not in pixels.');
			}
		} else if(typeof stackWidth === 'number') {
			width = stackWidth;
		}
		let height = 0;
		if(typeof stackHeight === 'string') {
			let cssValue: string = domUtils.getStyleSheetValue(stackHeight, 'height');
			if(cssValue && (cssValue.substr(cssValue.length - 2) === 'px')) {
				height = parseInt(cssValue);
			} else {
				console.error('Stacker CSS height value is not in pixels.');
			}
		} else if(typeof stackHeight === 'number') {
			height = stackHeight;
		}
		let stacker: Stacker = {
			limiter: this.createLimiter(tracker, limitElem),
			baseElem: baseElem,
			baseLeft: 0,
			baseTop: 0,
			baseRight: 0,
			baseBottom: 0,
			stackElem: stackElem,
			stackWidth: width,
			stackHeight: height,
			stacked: false,
			canUseFixed: canUseFixed,
			trackOffset: trackOffset,
			offset: 0,
			callback: callback
		};
		if(tracker) {
			switch(stackerLocation) {
				case StackerLocation.TOP:
					tracker.topStackers.push(stacker);
					break;
				case StackerLocation.BOTTOM:
					tracker.bottomStackers.push(stacker);
					break;
				case StackerLocation.LEFT:
					tracker.leftStackers.push(stacker);
					break;
				case StackerLocation.RIGHT:
					tracker.rightStackers.push(stacker);
					break;
			}
		}
		return () => {
			this.dropLimiter(tracker, stacker.limiter);
			switch(stackerLocation) {
				case StackerLocation.TOP:
					this.removeArrayElement(tracker.topStackers, stacker);
					break;
				case StackerLocation.BOTTOM:
					this.removeArrayElement(tracker.bottomStackers, stacker);
					break;
				case StackerLocation.LEFT:
					this.removeArrayElement(tracker.leftStackers, stacker);
					break;
				case StackerLocation.RIGHT:
					this.removeArrayElement(tracker.rightStackers, stacker);
					break;
			}
		}
	}

	private createTrackerRoot(key: string, elem: any): ScrollTrackerRoot {
		let tracker: ScrollTrackerRoot = this.scrollTrackerRoots[key];
		if(tracker) {
			if(elem) {
				if(tracker.unregisterListener) {
					tracker.unregisterListener();
				}
				tracker.elem = elem;
			}
			return tracker;
		}
		tracker = {
			elem: elem,
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			canUseFixed: false,
			unregisterListener: null,
			changeListeners: [],
			limiters: [],
			topStackers: [],
			bottomStackers: [],
			leftStackers: [],
			rightStackers: [],
			anchorTrackers: []
		};
		this.scrollTrackerRoots[key] = tracker;

		return tracker;
	}

	private createLimiter(tracker: ScrollTrackerRoot, elem: Element): Limiter {
		let limiters: Limiter[] = tracker.limiters;
		for(let n = 0; n < limiters.length; n++) {
			if(limiters[n].elem == elem) {
				limiters[n].refCount += 1;
				return limiters[n];
			}
		}
		let limiter: Limiter = {
			elem: elem,
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			refCount: 1
		};
		tracker.limiters.unshift(limiter);

		return limiter;
	}

	private dropLimiter(tracker: ScrollTrackerRoot, limiter: Limiter) {
		limiter.refCount -= 1;
		if(limiter.refCount <= 0) {
			this.removeArrayElement(tracker.limiters, limiter);
		}
	}

	addAnchorTracker(key: string, elem: Element, anchorElem: Element, anchorClass: string, anchorClasses: AnchorClasses, callback: AnchorCallback): () => void {
		let tracker: ScrollTrackerRoot = this.createTrackerRoot(key, null);
		let anchorTracker: AnchorTracker = {
			elem: elem,
			anchorElem: anchorElem,
			defaultClass: anchorClass,
			currentClass: anchorClass,
			classes: anchorClasses,
			callback: callback
		};
		tracker.anchorTrackers.push(anchorTracker);
		return () => {
			this.removeArrayElement(tracker.anchorTrackers, anchorTracker);
		};
	}

	addOverflowTracker(elem: Element, overflowWidth: boolean, overflowHeight: boolean, callback: OverflowCallback): () => void {
		let tracker: OverflowTracker = {
			elem: elem,
			overflowWidth: overflowWidth,
			overflowHeight: overflowHeight,
			overflowed: false,
			width: 0,
			height: 0,
			callback: callback
		};
		this.overflowTrackers.push(tracker);
		this.updateOverflowTracker(tracker);
		return () => {
			this.removeArrayElement(this.overflowTrackers, tracker);
		};
	}

	private updateResize(hideNonFixed: boolean) {
		for(let key in this.scrollTrackerRoots) {
			if(!this.scrollTrackerRoots.hasOwnProperty(key)) {
				continue;
			}
			let tracker = this.scrollTrackerRoots[key];
			if(tracker.elem === window) {
				tracker.left = window.pageXOffset || document.documentElement.scrollLeft;
				tracker.top = window.pageYOffset || document.documentElement.scrollTop;
				tracker.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
				tracker.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			} else if(tracker.elem) {
				let elem = tracker.elem;
				tracker.left = elem.scrollLeft;
				tracker.top = elem.scrollTop;
				tracker.width = elem.offsetWidth;
				tracker.height = elem.offsetHeight;
			}
			let winLeft = tracker.left;
			let winTop = tracker.top;
			let winWidth = tracker.width;
			let winHeight = tracker.height;
			let canUseFixed = tracker.canUseFixed;
			let limiters: Limiter[] = tracker.limiters;
			let count = limiters.length;
			for(let n = 0; n < count; n++) {
				let limiter: Limiter = limiters[n];
				let rect = limiter.elem.getBoundingClientRect();
				limiter.left = winLeft + rect.left;
				limiter.top = winTop + rect.top;
				limiter.right = winLeft + rect.right;
				limiter.bottom = winTop + rect.bottom;
			}
			let offsetY = 0;
			let stackers: Stacker[] = tracker.topStackers;
			count = stackers.length;
			for(let n = 0; n < count; n++) {
				let stacker = stackers[n];
				let rect = stacker.baseElem.getBoundingClientRect();
				stacker.baseLeft = winLeft + rect.left;
				stacker.baseTop = winTop + rect.top;
				stacker.baseRight = winLeft + rect.right;
				stacker.baseBottom = winTop + rect.bottom;
				offsetY = offsetY + this.updateTopStacker(stacker, offsetY, winTop, winHeight, canUseFixed, hideNonFixed);
			}
			offsetY = 0;
			stackers = tracker.bottomStackers;
			count = stackers.length;
			for(let n = 0; n < count; n++) {
				let stacker = stackers[n];
				let rect = stacker.baseElem.getBoundingClientRect();
				stacker.baseLeft = winLeft + rect.left;
				stacker.baseTop = winTop + rect.top;
				stacker.baseRight = winLeft + rect.right;
				stacker.baseBottom = winTop + rect.bottom;
				offsetY = offsetY + this.updateBottomStacker(stacker, offsetY, winTop, winHeight, canUseFixed, hideNonFixed);
			}
			let offsetX = 0;
			stackers = tracker.leftStackers;
			count = stackers.length;
			for(let n = 0; n < count; n++) {
				let stacker = stackers[n];
				let rect = stacker.baseElem.getBoundingClientRect();
				stacker.baseLeft = winLeft + rect.left;
				stacker.baseTop = winTop + rect.top;
				stacker.baseRight = winLeft + rect.right;
				stacker.baseBottom = winTop + rect.bottom;
				offsetX = offsetX + this.updateLeftStacker(stacker, offsetX, winLeft, winWidth, canUseFixed, hideNonFixed);
			}
			offsetX = 0;
			stackers = tracker.rightStackers;
			count = stackers.length;
			for(let n = 0; n < count; n++) {
				let stacker = stackers[n];
				let rect = stacker.baseElem.getBoundingClientRect();
				stacker.baseLeft = winLeft + rect.left;
				stacker.baseTop = winTop + rect.top;
				stacker.baseRight = winLeft + rect.right;
				stacker.baseBottom = winTop + rect.bottom;
				offsetX = offsetX + this.updateRightStacker(stacker, offsetX, winLeft, winWidth, canUseFixed, hideNonFixed);
			}
			let winRight = winLeft + winWidth;
			let winBottom = winTop + winHeight;
			let anchorTrackers = tracker.anchorTrackers;
			count = anchorTrackers.length;
			for(let n = 0; n < count; n++) {
				this.updateAnchorTracker(anchorTrackers[n], winLeft, winTop, winRight, winBottom);
			}
		}
		let overflowTrackers = this.overflowTrackers;
		let count = overflowTrackers.length;
		for(let n = 0; n < count; n++) {
			this.updateOverflowTracker(overflowTrackers[n]);
		}
		if(this.scrollDoneTimerId) {
			clearTimeout(this.scrollDoneTimerId);
		}
		this.scrollDoneTimerId = setTimeout(() => {
			this.scrollDoneTimerId = null;
			for(let key in this.scrollTrackerRoots) {
				if(!this.scrollTrackerRoots.hasOwnProperty(key)) {
					continue;
				}
				let tracker = this.scrollTrackerRoots[key];
				this.revealScrollVerticalHidden(tracker);
			}
		}, 100);
	};

	private updateScroll(tracker: ScrollTrackerRoot) {
		let oldLeft = tracker.left;
		let oldTop = tracker.top;
		if(tracker.elem === window) {
			tracker.left = (window.pageXOffset || document.documentElement.scrollLeft);
			tracker.top = (window.pageYOffset || document.documentElement.scrollTop);
		} else {
			let elem = tracker.elem;
			tracker.left = elem.scrollLeft;
			tracker.top = elem.scrollTop;
		}
		let winLeft = tracker.left;
		let winTop = tracker.top;
		let winWidth = tracker.width;
		let winHeight = tracker.height;
		let canUseFixed = tracker.canUseFixed;
		let hideNonFixed = this.hideNonFixed;
		let listeners: ScrollChangeListener[] = tracker.changeListeners;
		let count = listeners.length;
		for(let n = 0; n < count; n++) {
			listeners[n].call(undefined, winLeft, winTop);
		}
		if(oldTop !== winTop) {
			let stackers: Stacker[] = tracker.topStackers;
			let count = stackers.length;
			let offsetY = 0;
			for(let n = 0; n < count; n++) {
				let stacker = stackers[n];
				offsetY = offsetY + this.updateTopStacker(stacker, offsetY, winTop, winHeight, canUseFixed, hideNonFixed);
			}
			stackers = tracker.bottomStackers;
			count = stackers.length;
			offsetY = 0;
			for(let n = 0; n < count; n++) {
				let stacker = stackers[n];
				offsetY = offsetY + this.updateBottomStacker(stacker, offsetY, winTop, winHeight, canUseFixed, hideNonFixed);
			}
		}
		if(oldLeft !== winLeft) {
			let stackers: Stacker[] = tracker.leftStackers;
			let count = stackers.length;
			let offsetX = 0;
			for(let n = 0; n < count; n++) {
				let stacker = stackers[n];
				offsetX = offsetX + this.updateLeftStacker(stacker, offsetX, winLeft, winWidth, canUseFixed, hideNonFixed);
			}
			stackers = tracker.rightStackers;
			count = stackers.length;
			offsetX = 0;
			for(let n = 0; n < count; n++) {
				let stacker = stackers[n];
				offsetX = offsetX + this.updateRightStacker(stacker, offsetX, winLeft, winWidth, canUseFixed, hideNonFixed);
			}
		}
		if((oldTop !== winTop) || (oldLeft !== winLeft)) {
			if(this.scrollDoneTimerId) {
				clearTimeout(this.scrollDoneTimerId);
			}
			this.scrollDoneTimerId = setTimeout(() => {
				this.scrollDoneTimerId = null;
				this.revealScrollVerticalHidden(tracker);
			}, 200);
		}
	}

	private revealScrollVerticalHidden(tracker: ScrollTrackerRoot) {
		let useFixed = tracker.canUseFixed;
		let stackers: Stacker[] = tracker.topStackers;
		let count = stackers.length;
		let offsetY = 0;
		for(let n = 0; n < count; n++) {
			let stacker = stackers[n];
			if((!useFixed || !stacker.canUseFixed) && stacker.stacked) {
				stacker.stackElem.style.display = '';
				stacker.callback.call(undefined, true, stacker.offset, false, false);
			}
		}
		stackers = tracker.bottomStackers;
		count = stackers.length;
		offsetY = 0;
		for(let n = 0; n < count; n++) {
			let stacker = stackers[n];
			if((!useFixed || !stacker.canUseFixed) && stacker.stacked) {
				stacker.stackElem.style.display = '';
				stacker.callback.call(undefined, true, stacker.offset, false, false);
			}
		}
	}

	private updateTopStacker(stacker: Stacker, offsetY: number, winTop: number, winHeight: number, useFixed: boolean, hideNonFixed: boolean): number {
		if((winTop + offsetY > stacker.limiter.top) && (winTop + offsetY < stacker.limiter.bottom - stacker.stackHeight)) {
			if((winTop + offsetY > stacker.baseTop) && (!useFixed || !stacker.canUseFixed || stacker.trackOffset || !stacker.stacked)) {
				let offset = (winTop + offsetY - stacker.baseTop);
				stacker.stacked = true;
				stacker.offset = offset;
				if(useFixed && stacker.canUseFixed) {
					stacker.stackElem.style.top = offsetY.toFixed(0) + 'px';
					stacker.callback.call(undefined, true, offset, true, false);
				} else {
					if(hideNonFixed) {
						stacker.stackElem.style.display = 'none';
					}
					stacker.stackElem.style.top = offset.toFixed(0) + 'px';
					stacker.callback.call(undefined, true, offset, false, hideNonFixed);
				}
			} else if((winTop + offsetY <= stacker.baseTop) && stacker.stacked) {
				stacker.stacked = false;
				stacker.offset = 0;
				stacker.stackElem.style.display = '';
				stacker.stackElem.style.top = null;
				stacker.callback.call(undefined, false, 0, false, false);
			}
		} else if(stacker.stacked) {
			stacker.stacked = false;
			stacker.offset = 0;
			stacker.stackElem.style.display = '';
			stacker.stackElem.style.top = null;
			stacker.callback.call(undefined, false, 0, false, false);
		}
		return (stacker.stacked ? stacker.stackHeight : 0);
	}

	private updateBottomStacker(stacker: Stacker, offsetY: number, winTop: number, winHeight: number, useFixed: boolean, hideNonFixed: boolean): number {
		if((winTop + winHeight - offsetY > stacker.limiter.top + stacker.stackHeight) && (winTop + winHeight + offsetY < stacker.limiter.bottom)) {
			if((winTop + winHeight - offsetY < stacker.baseBottom) && (!useFixed || !stacker.canUseFixed || stacker.trackOffset || !stacker.stacked)) {
				let offset = (stacker.baseBottom + offsetY - (winTop + winHeight));
				stacker.stacked = true;
				stacker.offset = offset;
				if(useFixed && stacker.canUseFixed) {
					stacker.stackElem.style.bottom = offsetY.toFixed(0) + 'px';
					stacker.callback.call(undefined, true, offset, true, false);
				} else {
					if(hideNonFixed) {
						stacker.stackElem.style.display = 'none';
					}
					stacker.stackElem.style.bottom = offset.toFixed(0) + 'px';
					stacker.callback.call(undefined, true, offset, false, hideNonFixed);
				}
			} else if((winTop + winHeight - offsetY >= stacker.baseBottom) && stacker.stacked) {
				stacker.stacked = false;
				stacker.offset = 0;
				stacker.stackElem.style.display = '';
				stacker.stackElem.style.bottom = '';
				stacker.callback.call(undefined, false, 0, false, false);
			}
		} else if(stacker.stacked) {
			stacker.stacked = false;
			stacker.offset = 0;
			stacker.stackElem.style.display = '';
			stacker.stackElem.style.bottom = '';
			stacker.callback.call(undefined, false, 0, false, false);
		}
		return (stacker.stacked ? stacker.stackHeight : 0);
	}

	private updateLeftStacker(stacker: Stacker, offsetX: number, winLeft: number, winWidth: number, useFixed: boolean, hideNonFixed: boolean): number {
		if((winLeft + offsetX > stacker.limiter.left) && (winLeft + offsetX < stacker.limiter.right - stacker.stackWidth)) {
			if((winLeft + offsetX > stacker.baseLeft) && (!useFixed || !stacker.canUseFixed || stacker.trackOffset || !stacker.stacked)) {
				let offset = (winLeft + offsetX - stacker.baseLeft);
				stacker.stacked = true;
				stacker.offset = offset;
				if(useFixed && stacker.canUseFixed) {
					stacker.stackElem.style.left = offsetX.toFixed(0) + 'px';
					stacker.callback.call(undefined, true, offset, true, false);
				} else {
					if(hideNonFixed) {
						stacker.stackElem.style.display = 'none';
					}
					stacker.stackElem.style.left = offset.toFixed(0) + 'px';
					stacker.callback.call(undefined, true, offset, false, hideNonFixed);
				}
			} else if((winLeft + offsetX <= stacker.baseLeft) && stacker.stacked) {
				stacker.stacked = false;
				stacker.offset = 0;
				stacker.stackElem.style.display = '';
				stacker.stackElem.style.left = null;
				stacker.callback.call(undefined, false, 0, false, false);
			}
		} else if(stacker.stacked) {
			stacker.stacked = false;
			stacker.offset = 0;
			stacker.stackElem.style.display = '';
			stacker.stackElem.style.left = null;
			stacker.callback.call(undefined, false, 0, false, false);
		}
		return (stacker.stacked ? stacker.stackWidth : 0);
	}

	private updateRightStacker(stacker: Stacker, offsetX: number, winLeft: number, winWidth: number, useFixed: boolean, hideNonFixed: boolean): number {
		if((winLeft + winWidth - offsetX > stacker.limiter.left + stacker.stackWidth) && (winLeft + winWidth + offsetX < stacker.limiter.right)) {
			if((winLeft + winWidth - offsetX < stacker.baseRight) && (!useFixed || !stacker.canUseFixed || stacker.trackOffset || !stacker.stacked)) {
				let offset = (stacker.baseRight + offsetX - (winLeft + winWidth));
				stacker.stacked = true;
				stacker.offset = offset;
				if(useFixed && stacker.canUseFixed) {
					stacker.stackElem.style.right = offsetX.toFixed(0) + 'px';
					stacker.callback.call(undefined, true, offset, true, false);
				} else {
					if(hideNonFixed) {
						stacker.stackElem.style.display = 'none';
					}
					stacker.stackElem.style.right = offset.toFixed(0) + 'px';
					stacker.callback.call(undefined, true, offset, false, hideNonFixed);
				}
			} else if((winLeft + winWidth - offsetX >= stacker.baseRight) && stacker.stacked) {
				stacker.stacked = false;
				stacker.offset = 0;
				stacker.stackElem.style.display = '';
				stacker.stackElem.style.right = '';
				stacker.callback.call(undefined, false, 0, false, false);
			}
		} else if(stacker.stacked) {
			stacker.stacked = false;
			stacker.offset = 0;
			stacker.stackElem.style.display = '';
			stacker.stackElem.style.right = '';
			stacker.callback.call(undefined, false, 0, false, false);
		}
		return (stacker.stacked ? stacker.stackWidth : 0);
	}

	private updateOverflowTracker(overflowTracker: OverflowTracker) {
		let elem = overflowTracker.elem;
		let width = 0;
		let height = 0;
		if(overflowTracker.overflowWidth) {
			width = elem.scrollWidth;
		}
		if(overflowTracker.overflowHeight) {
			height = elem.scrollHeight;
		}
		let overflowed = ((height > 0) && (height > elem.clientHeight)) || ((width > 0) && (width > elem.clientWidth));
		if(overflowed && !overflowTracker.overflowed) {
			overflowTracker.overflowed = true;
			overflowTracker.width = width;
			overflowTracker.height = height;
			overflowTracker.callback.call(undefined, true, width, height);
		} else if(!overflowed && overflowTracker.overflowed) {
			overflowTracker.overflowed = false;
			overflowTracker.callback.call(undefined, false, overflowTracker.width, overflowTracker.height);
		} else if((width != overflowTracker.width) || (height != overflowTracker.height)) {
			overflowTracker.width = width;
			overflowTracker.height = height;
			overflowTracker.callback.call(undefined, overflowTracker.overflowed, overflowTracker.width, overflowTracker.height);
		}
	}

	private updateAnchorTracker(anchorTracker: AnchorTracker, winLeft: number, winTop: number, winRight: number, winBottom: number) {
		let elemRect = anchorTracker.elem.getBoundingClientRect();
		let anchorRect = anchorTracker.anchorElem.getBoundingClientRect();
		let defaultClass = anchorTracker.defaultClass;
		let classes = anchorTracker.classes;
		let elemWidth = elemRect.right - elemRect.left + 1;
		let elemHeight = elemRect.bottom - elemRect.top + 1;
		let currentClass: string;
		if((defaultClass === classes.topLeft)
				|| (defaultClass === classes.topRight)
				|| (defaultClass === classes.bottomLeft)
				|| (defaultClass === classes.bottomRight)) {
			let topLeft = this.visibleArea(anchorRect.left, anchorRect.bottom, anchorRect.left + elemWidth, anchorRect.bottom + elemHeight, winLeft, winTop, winRight, winBottom);
			let topRight = this.visibleArea(anchorRect.right - elemWidth, anchorRect.bottom, anchorRect.right, anchorRect.bottom + elemHeight, winLeft, winTop, winRight, winBottom);
			let bottomLeft = this.visibleArea(anchorRect.left, anchorRect.top - elemHeight, anchorRect.left + elemWidth, anchorRect.top, winLeft, winTop, winRight, winBottom);
			let bottomRight = this.visibleArea(anchorRect.right - elemWidth, anchorRect.top - elemHeight, anchorRect.right, anchorRect.top, winLeft, winTop, winRight, winBottom);
			if((topLeft >= topRight) && (topLeft >= bottomLeft) && (topLeft >= bottomRight)) {
				currentClass = classes.topLeft;
			} else if((topRight >= topLeft) && (topRight >= bottomLeft) && (topRight >= bottomRight)) {
				currentClass = classes.topRight;
			} else if((bottomLeft >= topLeft) && (bottomLeft >= topRight) && (bottomLeft >= bottomRight)) {
				currentClass = classes.bottomLeft;
			} else {
				currentClass = classes.bottomRight;
			}
		} else {
			let leftTop = this.visibleArea(anchorRect.right, anchorRect.top, anchorRect.right + elemWidth, anchorRect.top + elemHeight, winLeft, winTop, winRight, winBottom);
			let leftBottom = this.visibleArea(anchorRect.right, anchorRect.bottom - elemHeight, anchorRect.right + elemWidth, anchorRect.bottom, winLeft, winTop, winRight, winBottom);
			let rightTop = this.visibleArea(anchorRect.left - elemWidth, anchorRect.top, anchorRect.left, anchorRect.top + elemHeight, winLeft, winTop, winRight, winBottom);
			let rightBottom = this.visibleArea(anchorRect.left - elemWidth, anchorRect.bottom - elemHeight, anchorRect.left, anchorRect.bottom, winLeft, winTop, winRight, winBottom);
			if((leftTop >= leftBottom) && (leftTop >= rightTop) && (leftTop >= rightBottom)) {
				currentClass = classes.leftTop;
			} else if((leftBottom >= leftTop) && (leftBottom >= rightTop) && (leftBottom >= rightBottom)) {
				currentClass = classes.leftBottom;
			} else if((rightTop >= leftTop) && (rightTop >= leftBottom) && (rightTop >= rightBottom)) {
				currentClass = classes.rightTop;
			} else {
				currentClass = classes.rightBottom;
			}
		}
		if(currentClass !== anchorTracker.currentClass) {
			anchorTracker.currentClass = currentClass;
			anchorTracker.callback.call(undefined, currentClass);
		}
	}

	private visibleArea(elemLeft: number, elemTop: number, elemRight: number, elemBottom: number, winLeft: number, winTop: number, winRight: number, winBottom: number) {
		let widthOverlap = Math.max(0, Math.min(elemRight, winRight) - Math.max(elemLeft, winLeft));
		let heightOverlap = Math.max(0, Math.min(elemBottom, winBottom) - Math.max(elemTop, winTop));
		return widthOverlap * heightOverlap;
	}

	private removeArrayElement(a: any[], elem: any) {
		let idx = a.indexOf(elem);
		if(idx >= 0) {
			a.splice(idx, 1);
		}
	}

}
