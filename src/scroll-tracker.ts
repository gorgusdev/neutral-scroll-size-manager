import * as domUtils from './dom-utils';
import { ScrollLimiter } from './scroll-limiter';
import { ScrollStacker } from './scroll-stacker';
import { ScrollStackerTop } from './scroll-stacker-top';
import { ScrollStackerBottom } from './scroll-stacker-bottom';
import { ScrollStackerLeft } from './scroll-stacker-left';
import { ScrollStackerRight } from './scroll-stacker-right';
import { ScrollChangeListener, ScrollToCallback } from './scroll-size-manager-types';
import { AnchorClasses, AnchorCallback, AnchorControl, StackerCallback, StackerControl } from './scroll-size-manager-types';
import { AnchorTracker } from './anchor-tracker';

export enum StackerLocation {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT
}

export class ScrollTracker {
    private globalLeft: number = 0;
    private globalTop: number = 0;
    private left: number = 0;
    private top: number = 0;
    private width: number = 0;
    private height: number = 0;
    private fixedTop: number = 0;
    private fixedRight: number = 0;
    private fixedBottom: number = 0;
    private fixedLeft: number = 0;
    private stackedTop: number = 0;
    private stackedRight: number = 0;
    private stackedBottom: number = 0;
    private stackedLeft: number = 0;
    private canUseFixed: boolean = false;
    private unregisterListener?: () => void = undefined;
    private changeListeners: ScrollChangeListener[] = [];
    private limiters: ScrollLimiter[] = [];
    private topStackers: ScrollStackerTop[] = [];
    private bottomStackers: ScrollStackerBottom[] = [];
    private leftStackers: ScrollStackerLeft[] = [];
    private rightStackers: ScrollStackerRight[] = [];
    private anchorTrackers: AnchorTracker[] = [];
    private hasHiddenStackers: boolean = false;
    public element?: Window | HTMLElement = undefined;
    public horizScrolled: boolean = true;
    public vertScrolled: boolean = true;
    public restack: boolean = true;

    public register(element: Window | HTMLElement, listener: (event: Event) => void) {
        this.element = element;
        this.unregisterListener = domUtils.registerEventListener(this.element, 'scroll', listener);
        this.canUseFixed = this.element === window;
    }

    public unregister() {
        if(this.unregisterListener) {
            this.unregisterListener();
            this.unregisterListener = undefined;
        }
    }

    public addScrollChangeListener(callback: ScrollChangeListener): () => void {
        this.changeListeners.push(callback);
        return () => {
            const index = this.changeListeners.indexOf(callback);
            if(index >= 0) {
                this.changeListeners.splice(index, 1);
            }
        };
    }

    public addAnchorTracker(
        baseElement: Element,
        anchoredElement: Element,
        anchorClass: string,
        anchorClasses: AnchorClasses,
        callback: AnchorCallback
    ): AnchorControl {
        const anchorTracker = new AnchorTracker(baseElement, anchoredElement, anchorClass, anchorClasses, callback);
        this.anchorTrackers.push(anchorTracker);
        return {
            unregister: () => {
                const index = this.anchorTrackers.indexOf(anchorTracker);
                if(index >= 0) {
                    this.anchorTrackers.splice(index, 1);
                }
            },
            enable: anchorTracker.enable,
            disable: anchorTracker.disable
        };
    }

    public addScrollStacker(
        baseElement: Element,
        stackElement: HTMLElement,
        limiterSelector: string,
        limiterSkipCount: number,
        stackWidth: string|number,
        stackHeight: string|number,
        canUseFixed: boolean,
        trackOffset: boolean,
        callback: StackerCallback,
        stackerLocation: StackerLocation
    ): StackerControl {
        this.updateScrolled();
        const winLeft = this.left;
        const winTop = this.top;
        let limitElem: Element | null = null;
        if(limiterSelector) {
            limitElem = domUtils.findParentMatchingSelector(baseElement, limiterSelector);
            let count = 0;
            while(limitElem && limitElem.parentElement && (count < limiterSkipCount)) {
                const tmp = domUtils.findParentMatchingSelector(limitElem.parentElement, limiterSelector);
                if(tmp) {
                    limitElem = tmp;
                }
                count += 1;
            }
            if(!limitElem) {
                throw new Error('Missing limiter element with selector "' + limiterSelector + '" skipped ' + limiterSkipCount + ' times');
            }
        }
        const limiter = this.createLimiter(limitElem);

        switch(stackerLocation) {
            case StackerLocation.TOP:
                return this.addStackerToList(new ScrollStackerTop(
                    winLeft,
                    winTop,
                    limiter,
                    baseElement,
                    stackElement,
                    stackWidth,
                    stackHeight,
                    canUseFixed,
                    trackOffset,
                    callback
                ), this.topStackers, this.sortStackerVertAscending);
            case StackerLocation.BOTTOM:
                return this.addStackerToList(new ScrollStackerBottom(
                    winLeft,
                    winTop,
                    limiter,
                    baseElement,
                    stackElement,
                    stackWidth,
                    stackHeight,
                    canUseFixed,
                    trackOffset,
                    callback
                ), this.bottomStackers, this.sortStackerVertDescending);
            case StackerLocation.LEFT:
                return this.addStackerToList(new ScrollStackerLeft(
                    winLeft,
                    winTop,
                    limiter,
                    baseElement,
                    stackElement,
                    stackWidth,
                    stackHeight,
                    canUseFixed,
                    trackOffset,
                    callback
                ), this.leftStackers, this.sortStackerHorizAscending);
            case StackerLocation.RIGHT:
                return this.addStackerToList(new ScrollStackerRight(
                    winLeft,
                    winTop,
                    limiter,
                    baseElement,
                    stackElement,
                    stackWidth,
                    stackHeight,
                    canUseFixed,
                    trackOffset,
                    callback
                ), this.rightStackers, this.sortStackerHorizDescending);
        }
    }

    private sortStackerHorizAscending(s1: ScrollStacker, s2: ScrollStacker): number {
        if(s1.baseLeft < s2.baseLeft) {
            return -1;
        } else if(s1.baseLeft > s2.baseLeft) {
            return 1;
        }
        return 0;
    }

    private sortStackerHorizDescending(s1: ScrollStacker, s2: ScrollStacker): number {
        if(s1.baseLeft > s2.baseLeft) {
            return -1;
        } else if(s1.baseLeft < s2.baseLeft) {
            return 1;
        }
        return 0;
    }

    private sortStackerVertAscending(s1: ScrollStacker, s2: ScrollStacker): number {
        if(s1.baseTop < s2.baseTop) {
            return -1;
        } else if(s1.baseTop > s2.baseTop) {
            return 1;
        }
        return 0;
    }

    private sortStackerVertDescending(s1: ScrollStacker, s2: ScrollStacker): number {
        if(s1.baseTop > s2.baseTop) {
            return -1;
        } else if(s1.baseTop < s2.baseTop) {
            return 1;
        }
        return 0;
    }

    public addStackerToList<T extends ScrollStacker>(stacker: T, stackers: T[], compareFn: (a: T, b: T) => number): StackerControl {
        stackers.push(stacker);
        stackers.sort(compareFn);
        this.restack = true;
        return {
            unregister: () => {
                this.destroyLimiter(stacker.limiter);
                const index = stackers.indexOf(stacker);
                if(index >= 0) {
                    stackers.splice(index, 1);
                }
                stacker.unregister();
                this.restack = true;
            },
            enable: () => {
                stacker.enable();
                this.restack = true;
            },
            disable: () => {
                stacker.disable();
                this.restack = true;
            }
        };
    }

    public setFixedOffsets(top: number, right: number, bottom: number, left: number): void {
        this.fixedTop = top;
        this.fixedRight = right;
        this.fixedBottom = bottom;
        this.fixedLeft = left;
    }

    public updateScrolled() {
        const oldLeft = this.left;
        const oldTop = this.top;
        if(this.element === window) {
            this.left = (window.pageXOffset || document.documentElement.scrollLeft);
            this.top = (window.pageYOffset || document.documentElement.scrollTop);
        } else if(this.element) {
            this.left = (<HTMLElement>this.element).scrollLeft;
            this.top = (<HTMLElement>this.element).scrollTop;
            const rect = (<HTMLElement>this.element).getBoundingClientRect();
            this.globalLeft = rect.left;
            this.globalTop = rect.top;
        }
        this.horizScrolled = (oldLeft !== this.left);
        this.vertScrolled = (oldTop !== this.top);
    }

    public updateResized() {
        if(this.element === window) {
            this.left = window.pageXOffset || document.documentElement.scrollLeft;
            this.top = window.pageYOffset || document.documentElement.scrollTop;
            this.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        } else if(this.element) {
            this.left = (<HTMLElement>this.element).scrollLeft;
            this.top = (<HTMLElement>this.element).scrollTop;
            this.width = (<HTMLElement>this.element).offsetWidth;
            this.height = (<HTMLElement>this.element).offsetHeight;
            const rect = (<HTMLElement>this.element).getBoundingClientRect();
            this.globalLeft = rect.left;
            this.globalTop = rect.top;
        }
    }

    public createLimiter(element: Element | null): ScrollLimiter {
        for(const limiter of this.limiters) {
            if(limiter.element === element) {
                limiter.increaseRef();
                return limiter;
            }
        }
        const result = new ScrollLimiter(element || undefined);
        this.limiters.unshift(result);
        return result;
    }

    public destroyLimiter(limiter: ScrollLimiter): void {
        if(limiter.decreaseRef()) {
            const index = this.limiters.indexOf(limiter);
            if(index >= 0) {
                this.limiters.splice(index, 1);
            }
        }
    }

    public updateResize(hideNonFixed: boolean): boolean {
        this.updateResized();
        const globalLeft = this.globalLeft;
        const globalTop = this.globalTop;
        const winLeft = this.left;
        const winTop = this.top;
        const winWidth = this.width;
        const winHeight = this.height;
        const canUseFixed = this.canUseFixed;
        const restack = this.restack;
        this.hasHiddenStackers = false;
        for(const limiter of this.limiters) {
            if(!limiter.element) {
                continue;
            }
            const rect = limiter.element.getBoundingClientRect();
            limiter.left = winLeft + rect.left - globalLeft;
            limiter.top = winTop + rect.top - globalTop;
            limiter.right = winLeft + rect.right - globalLeft;
            limiter.bottom = winTop + rect.bottom - globalTop;
        }
        this.stackedTop = this.updateStackers(
            this.topStackers,
            this.fixedTop,
            winTop,
            winHeight,
            canUseFixed,
            hideNonFixed,
            restack,
            true,
            globalLeft,
            globalTop
        );
        this.stackedBottom = this.updateStackers(
            this.bottomStackers,
            this.fixedBottom,
            winTop,
            winHeight,
            canUseFixed,
            hideNonFixed,
            restack,
            true,
            globalLeft,
            globalTop
        );
        this.stackedLeft = this.updateStackers(
            this.leftStackers,
            this.fixedLeft,
            winLeft,
            winWidth,
            canUseFixed,
            hideNonFixed,
            restack,
            true,
            globalLeft,
            globalTop
        );
        this.stackedRight = this.updateStackers(
            this.rightStackers,
            this.fixedRight,
            winLeft,
            winWidth,
            canUseFixed,
            hideNonFixed,
            restack,
            true,
            globalLeft,
            globalTop
        );

        this.updateAnchors(winWidth, winHeight);
        this.restack = false;
        return this.hasHiddenStackers;
    }

    public applyResize(): void {
        for(const stacker of this.topStackers) {
            stacker.apply();
        }
        for(const stacker of this.bottomStackers) {
            stacker.apply();
        }
        for(const stacker of this.leftStackers) {
            stacker.apply();
        }
        for(const stacker of this.rightStackers) {
            stacker.apply();
        }
        for(const anchor of this.anchorTrackers) {
            anchor.apply();
        }
    }

    public updateScroll(hideNonFixed: boolean): boolean {
        this.updateScrolled();
        const globalLeft = this.globalLeft;
        const globalTop = this.globalTop;
        const winLeft = this.left;
        const winTop = this.top;
        const winWidth = this.width;
        const winHeight = this.height;
        const canUseFixed = this.canUseFixed;
        const restack = this.restack;
        this.hasHiddenStackers = false;
        if(this.vertScrolled || restack) {
            this.stackedTop = this.updateStackers(
                this.topStackers,
                this.fixedTop,
                winTop,
                winHeight,
                canUseFixed,
                hideNonFixed,
                restack,
                false,
                globalLeft,
                globalTop
            );
            this.stackedBottom = this.updateStackers(
                this.bottomStackers,
                this.fixedBottom,
                winTop,
                winHeight,
                canUseFixed,
                hideNonFixed,
                restack,
                false,
                globalLeft,
                globalTop
            );
        }
        if(this.horizScrolled || restack) {
            this.stackedLeft = this.updateStackers(
                this.leftStackers,
                this.fixedLeft,
                winLeft,
                winWidth,
                canUseFixed,
                hideNonFixed,
                restack,
                false,
                globalLeft,
                globalTop
            );
            this.stackedRight = this.updateStackers(
                this.rightStackers,
                this.fixedRight,
                winLeft,
                winWidth,
                canUseFixed,
                hideNonFixed,
                restack,
                false,
                globalLeft,
                globalTop
            );
        }
        if(this.vertScrolled || this.horizScrolled) {
            this.updateAnchors(winWidth, winHeight);
        }
        this.restack = false;
        this.horizScrolled = false;
        this.vertScrolled = false;
        return this.hasHiddenStackers;
    }

    public applyScroll(): void {
        const winLeft = this.left;
        const winTop = this.top;
        const listeners = this.changeListeners.slice();
        const count = listeners.length;
        for(let n = 0; n < count; n++) {
            listeners[n].call(undefined, winLeft, winTop);
        }
        for(const stacker of this.topStackers) {
            stacker.apply();
        }
        for(const stacker of this.bottomStackers) {
            stacker.apply();
        }
        for(const stacker of this.leftStackers) {
            stacker.apply();
        }
        for(const stacker of this.rightStackers) {
            stacker.apply();
        }
        for(const anchor of this.anchorTrackers) {
            anchor.apply();
        }
    }

    public revealHidden(): void {
        this.revealHiddenStackers(this.topStackers);
        this.revealHiddenStackers(this.bottomStackers);
        this.revealHiddenStackers(this.leftStackers);
        this.revealHiddenStackers(this.rightStackers);
    }

    private updateStackers(
        stackers: ScrollStacker[],
        fixedOffset: number,
        winPos: number,
        winSize: number,
        canUseFixed: boolean,
        hideNonFixed: boolean,
        restack: boolean,
        resize: boolean,
        winLeft: number,
        winTop: number
    ): number {
        let offset = fixedOffset;
        let previous: ScrollStacker | undefined;
        let hasHiddenStackers = this.hasHiddenStackers;
        for(const stacker of stackers) {
            offset = offset + stacker.update(offset, winPos, winSize, canUseFixed, hideNonFixed, restack, resize, winLeft, winTop);
            hasHiddenStackers = hasHiddenStackers || stacker.hidden;
            if(previous && previous.lastStacked && stacker.stacked) {
                previous.lastStacked = false;
                previous.changed = true;
            }
            if(stacker.stacked) {
                previous = stacker;
            }
        }
        if(previous && previous.stacked && !previous.lastStacked) {
            previous.lastStacked = true;
            previous.changed = true;
        } else if(previous && !previous.stacked && previous.lastStacked) {
            previous.lastStacked = false;
            previous.changed = true;
        }
        this.hasHiddenStackers = hasHiddenStackers;
        return offset;
    }

    private revealHiddenStackers(stackers: ScrollStacker[]) {
        for(const stacker of stackers) {
            if(stacker.hidden) {
                stacker.hidden = false;
                stacker.changed = true;
            }
        }
    }

    private updateAnchors(winWidth: number, winHeight: number) {
        const anchorTrackers = this.anchorTrackers;
        if(anchorTrackers.length > 0) {
            let boxLeft: number;
            let boxTop: number;
            let boxRight: number;
            let boxBottom: number;
            const element = this.element;
            if(element) {
                if(domUtils.isWindow(element)) {
                    boxLeft = this.stackedLeft;
                    boxTop = this.stackedTop;
                    boxRight = winWidth - this.stackedRight;
                    boxBottom = winHeight - this.stackedBottom;
                } else {
                    const boxRect = element.getBoundingClientRect();
                    boxLeft = boxRect.left + this.stackedLeft;
                    boxTop = boxRect.top + this.stackedTop;
                    boxRight = boxRect.right - this.stackedRight;
                    boxBottom = boxRect.bottom - this.stackedBottom;
                }
                for(const anchorTracker of anchorTrackers) {
                    anchorTracker.update(boxTop, boxRight, boxBottom, boxLeft);
                }
            }
        }
    }

    public scrollTop(coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback): void {
        let targetTop = this.calcScrollTargetPos(coordOrElemOrSelector, -(offset || 0), (rect) => rect.top);

        let boxTop: number;
        let boxHeight: number;
        const element = this.element;
        if(!element) {
            return;
        }
        let left: number;
        let top: number;
        if(domUtils.isWindow(element)) {
            boxTop = 0;
            boxHeight = this.height;
            left = window.pageXOffset || document.documentElement.scrollLeft;
            top = window.pageYOffset || document.documentElement.scrollTop;
        } else {
            const boxRect = element.getBoundingClientRect();
            boxTop = boxRect.top;
            boxHeight = boxRect.bottom - boxRect.top;
            left = element.scrollLeft;
            top = element.scrollTop;
        }
        targetTop += (top - boxTop);

        targetTop -= this.simulateStackers(this.topStackers, this.fixedTop, targetTop, boxHeight);

        if(domUtils.isWindow(element)) {
            if(callback) {
                callback(left, targetTop);
            } else {
                element.scrollTo(left, targetTop);
            }
        } else {
            if(callback) {
                callback(element.scrollLeft, targetTop);
            } else {
                element.scrollTop = targetTop;
            }
        }
    }

    public scrollBottom(coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback): void {
        let targetBottom = this.calcScrollTargetPos(coordOrElemOrSelector, (offset || 0), (rect) => rect.bottom);

        let boxTop: number;
        let boxHeight: number;
        const element = this.element;
        if(!element) {
            return;
        }
        let left: number;
        let top: number;
        if(domUtils.isWindow(element)) {
            boxTop = 0;
            boxHeight = this.height;
            left = window.pageXOffset || document.documentElement.scrollLeft;
            top = window.pageYOffset || document.documentElement.scrollTop;
        } else {
            const boxRect = element.getBoundingClientRect();
            boxTop = boxRect.top;
            boxHeight = boxRect.bottom - boxRect.top;
            left = element.scrollLeft;
            top = element.scrollTop;
        }
        targetBottom += (top - boxHeight - boxTop);

        targetBottom += this.simulateStackers(this.bottomStackers, this.fixedBottom, targetBottom, boxHeight);

        if(domUtils.isWindow(element)) {
            if(callback) {
                callback(left, targetBottom);
            } else {
                element.scrollTo(left, targetBottom);
            }
        } else {
            if(callback) {
                callback(element.scrollLeft, targetBottom);
            } else {
                element.scrollTop = targetBottom;
            }
        }
    }

    public scrollLeft(coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        let targetLeft = this.calcScrollTargetPos(coordOrElemOrSelector, -(offset || 0), (rect) => rect.left);

        let boxLeft: number;
        let boxWidth: number;
        const element = this.element;
        if(!element) {
            return;
        }
        let left: number;
        let top: number;
        if(domUtils.isWindow(element)) {
            boxLeft = 0;
            boxWidth = this.width;
            left = window.pageXOffset || document.documentElement.scrollLeft;
            top = window.pageYOffset || document.documentElement.scrollTop;
        } else {
            const boxRect = element.getBoundingClientRect();
            boxLeft = boxRect.left;
            boxWidth = boxRect.right - boxRect.left;
            left = element.scrollLeft;
            top = element.scrollTop;
        }
        targetLeft += (left - boxLeft);

        targetLeft -= this.simulateStackers(this.leftStackers, this.fixedLeft, targetLeft, boxWidth);

        if(domUtils.isWindow(element)) {
            if(callback) {
                callback(targetLeft, top);
            } else {
                element.scrollTo(targetLeft, top);
            }
        } else {
            if(callback) {
                callback(targetLeft, element.scrollTop);
            } else {
                element.scrollLeft = targetLeft;
            }
        }
    }

    public scrollRight(coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        let targetRight = this.calcScrollTargetPos(coordOrElemOrSelector, (offset || 0), (rect) => rect.right);

        let boxLeft: number;
        let boxWidth: number;
        const element = this.element;
        if(!element) {
            return;
        }
        let left: number;
        let top: number;
        if(domUtils.isWindow(element)) {
            boxLeft = 0;
            boxWidth = this.width;
            left = window.pageXOffset || document.documentElement.scrollLeft;
            top = window.pageYOffset || document.documentElement.scrollTop;
        } else {
            const boxRect = element.getBoundingClientRect();
            boxLeft = boxRect.left;
            boxWidth = boxRect.right - boxRect.left;
            left = element.scrollLeft;
            top = element.scrollTop;
        }
        targetRight += (left - boxWidth - boxLeft);

        targetRight += this.simulateStackers(this.rightStackers, this.fixedRight, targetRight, boxWidth);

        if(domUtils.isWindow(element)) {
            if(callback) {
                callback(targetRight, top);
            } else {
                element.scrollTo(targetRight, top);
            }
        } else {
            if(callback) {
                callback(targetRight, element.scrollTop);
            } else {
                element.scrollLeft = targetRight;
            }
        }
    }

    public scrollIntoView(elemOrSelector: Element | string, offset?: number, callback?: ScrollToCallback) {
        let targetElement: Element | null = null;
        if(typeof elemOrSelector === 'string') {
            targetElement = document.querySelector(elemOrSelector);
        } else {
            targetElement = elemOrSelector;
        }
        if(!targetElement) {
            return;
        }

        let boxTop: number;
        let boxLeft: number;
        let boxHeight: number;
        let boxWidth: number;
        const element = this.element;
        if(!element) {
            return;
        }
        if(domUtils.isWindow(element)) {
            boxTop = 0;
            boxLeft = 0;
            boxHeight = this.height;
            boxWidth = this.width;
        } else {
            const boxRect = element.getBoundingClientRect();
            boxTop = boxRect.top;
            boxLeft = boxRect.left;
            boxHeight = boxRect.bottom - boxRect.top;
            boxWidth = boxRect.right - boxRect.left;
        }

        const rect = targetElement.getBoundingClientRect();
        const elemTop = rect.top - boxTop;
        const elemLeft = rect.left - boxLeft;
        const elemHeight = rect.bottom - rect.top;
        const elemWidth = rect.right - rect.left;
        offset = offset || 0;
        if(elemTop - offset < this.stackedTop) {
            this.scrollTop(targetElement, offset, callback);
        } else if(elemTop + elemHeight + offset > boxHeight - this.stackedBottom) {
            this.scrollBottom(targetElement, offset, callback);
        }
        if(elemLeft - offset < this.stackedLeft) {
            this.scrollLeft(targetElement, offset, callback);
        } else if(elemLeft + elemWidth + offset > boxWidth - this.stackedRight) {
            this.scrollRight(targetElement, offset, callback);
        }
    }

    private calcScrollTargetPos(
        coordOrElemOrSelector: Element | string | number,
        offset: number,
        getRectProp: (rect: ClientRect | DOMRect) => number
    ): number {
        let targetPos = offset;

        if(typeof coordOrElemOrSelector === 'number') {
            targetPos += coordOrElemOrSelector;
        } else {
            let targetElement: Element | null = null;
            if(typeof coordOrElemOrSelector === 'string') {
                targetElement = document.querySelector(coordOrElemOrSelector);
            } else {
                targetElement = coordOrElemOrSelector;
            }
            if(targetElement) {
                targetPos += getRectProp(targetElement.getBoundingClientRect());
            }
        }
        return targetPos;
    }

    private simulateStackers(
        stackers: ScrollStacker[],
        fixedOffset: number,
        winPos: number,
        winSize: number,
    ): number {
        let offset = fixedOffset;
        for(const stacker of stackers) {
            offset = offset + stacker.simulate(offset, winPos, winSize);
        }
        return offset;
    }

}
