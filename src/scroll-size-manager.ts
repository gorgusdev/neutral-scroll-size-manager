// Copyright (c) 2018 Göran Gustafsson. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { ScrollTrackerRegistry } from './scroll-tracker-registry';
import { StackerLocation } from './scroll-tracker';
import { OverflowTracker } from './overflow-tracker';
import { AnchorClasses, AnchorCallback, AnchorControl } from './scroll-size-manager-types';
import { ScrollChangeListener, ResizeChangeListener, StackerCallback, StackerControl, ScrollToCallback } from './scroll-size-manager-types';
import { OverflowCallback, OverflowControl } from './scroll-size-manager-types';
import * as domUtils from './dom-utils';

const REVEAL_COUNTER_START = 10;

export class ScrollSizeManager {
    private trackerRegistry: ScrollTrackerRegistry = new ScrollTrackerRegistry();
    private overflowTrackers: OverflowTracker[] = [];
    private resizeChangeListeners: ResizeChangeListener[] = [];
    private unregisterResizeListener?: () => void = undefined;
    private hideNonFixedEnabled: boolean = false;
    private updateRequested: boolean = false;
    private resized: boolean = false;
    private hideNonFixedUpdate: boolean = false;
    private revealCounter: number = 0;

    public startResizeTracking(): void {
        this.unregisterResizeListener = domUtils.registerEventListener(window, 'resize', () => {
            this.updateResized(true);
        });
    }

    public stopResizeTracking(): void {
        if(this.unregisterResizeListener) {
            this.unregisterResizeListener();
            this.unregisterResizeListener = undefined;
        }
    }

    public checkResizeFromStateChange() {
        this.updateResized(false);
    }

    public hideNonFixedWhileScrolling(hide: boolean): void {
        this.hideNonFixedEnabled = hide;
    }

    private updateResized(hideNonFixed: boolean): void {
        this.resized = true;
        if(hideNonFixed) {
            this.hideNonFixedUpdate = true;
        }
        this.requestUpdate();
    }

    public addScrollTracker(
        key: string,
        element: Window | HTMLElement,
        fixedTopOffset?: string | number,
        fixedRightOffset?: string | number,
        fixedBottomOffset?: string | number,
        fixedLeftOffset?: string | number
    ): void {
        const tracker = this.trackerRegistry.createTracker(key);
        tracker.register(element, (event: Event) => {
            const target = event.target || event.srcElement;
            if((target === tracker.element) || ((!target || (target === document)) && (tracker.element === window))) {
                this.hideNonFixedUpdate = true;
                this.requestUpdate();
            }
        });
        tracker.setFixedOffsets(
            domUtils.getValueOrCSSProp(fixedTopOffset, 'height'),
            domUtils.getValueOrCSSProp(fixedRightOffset, 'width'),
            domUtils.getValueOrCSSProp(fixedBottomOffset, 'height'),
            domUtils.getValueOrCSSProp(fixedLeftOffset, 'width')
        );
        tracker.restack = true;
        this.updateResized(false);
    }

    public removeTracker(key: string) {
        this.trackerRegistry.destroyTracker(key);
    }

    public addScrollChangeListener(key: string, callback: ScrollChangeListener): () => void {
        return this.trackerRegistry.addScrollChangeListener(key, callback);
    }

    public addResizeChangeListener(callback: ResizeChangeListener): () => void {
        this.resizeChangeListeners.push(callback);
        return () => {
            const index = this.resizeChangeListeners.indexOf(callback);
            if(index >= 0) {
                this.resizeChangeListeners.splice(index, 1);
            }
        };
    }

    public addAnchorTracker(
        key: string,
        baseElement: Element,
        anchoredElement: Element,
        anchorClass: string,
        anchorClasses: AnchorClasses,
        callback: AnchorCallback
    ): AnchorControl {
        return this.trackerRegistry.addAnchorTracker(key, baseElement, anchoredElement, anchorClass, anchorClasses, callback);
    }

    public addOverflowTracker(
        containerElement: Element,
        element: HTMLElement,
        overflowWidth: boolean,
        overflowHeight: boolean,
        callback: OverflowCallback
    ): OverflowControl {
        const overflowTracker = new OverflowTracker(containerElement, element, overflowWidth, overflowHeight, callback);
        this.overflowTrackers.push(overflowTracker);
        return {
            unregister: () => {
                const index = this.overflowTrackers.indexOf(overflowTracker);
                if(index >= 0) {
                    this.overflowTrackers.splice(index, 1);
                }
            },
            enable: overflowTracker.enable,
            disable: overflowTracker.disable
        };
    }

    public addTopStacker(
        key: string,
        baseElement: Element,
        stackElement: HTMLElement,
        limiterSelector: string,
        limiterSkipCount: number,
        stackHeight: string|number,
        canUseFixed: boolean,
        trackOffset: boolean,
        callback: StackerCallback
    ): StackerControl {
        this.requestUpdate();
        return this.wrapStackerControl(this.trackerRegistry.addScrollStacker(
            key,
            baseElement,
            stackElement,
            limiterSelector,
            limiterSkipCount,
            0,
            stackHeight,
            canUseFixed,
            trackOffset,
            callback,
            StackerLocation.TOP
        ));
    }

    public addBottomStacker(
        key: string,
        baseElement: Element,
        stackElement: HTMLElement,
        limiterSelector: string,
        limiterSkipCount: number,
        stackHeight: string|number,
        canUseFixed: boolean,
        trackOffset: boolean,
        callback: StackerCallback
    ): StackerControl {
        this.requestUpdate();
        return this.wrapStackerControl(this.trackerRegistry.addScrollStacker(
            key,
            baseElement,
            stackElement,
            limiterSelector,
            limiterSkipCount,
            0,
            stackHeight,
            canUseFixed,
            trackOffset,
            callback,
            StackerLocation.BOTTOM
        ));
    }

    public addLeftStacker(
        key: string,
        baseElement: Element,
        stackElement: HTMLElement,
        limiterSelector: string,
        limiterSkipCount: number,
        stackWidth: string|number,
        canUseFixed: boolean,
        trackOffset: boolean,
        callback: StackerCallback
    ): StackerControl {
        this.requestUpdate();
        return this.wrapStackerControl(this.trackerRegistry.addScrollStacker(
            key,
            baseElement,
            stackElement,
            limiterSelector,
            limiterSkipCount,
            stackWidth,
            0,
            canUseFixed,
            trackOffset,
            callback,
            StackerLocation.LEFT
        ));
    }

    public addRightStacker(
        key: string,
        baseElement: Element,
        stackElement: HTMLElement,
        limiterSelector: string,
        limiterSkipCount: number,
        stackWidth: string|number,
        canUseFixed: boolean,
        trackOffset: boolean,
        callback: StackerCallback
    ): StackerControl {
        this.requestUpdate();
        return this.wrapStackerControl(this.trackerRegistry.addScrollStacker(
            key,
            baseElement,
            stackElement,
            limiterSelector,
            limiterSkipCount,
            stackWidth,
            0,
            canUseFixed,
            trackOffset,
            callback,
            StackerLocation.RIGHT
        ));
    }

    private wrapStackerControl(control: StackerControl): StackerControl {
        return {
            unregister: () => {
                control.unregister();
                this.resized = true;
                this.requestUpdate();
            },
            enable: () => {
                control.enable();
                this.resized = true;
                this.requestUpdate();
            },
            disable: () => {
                control.disable();
                this.resized = true;
                this.requestUpdate();
            }
        };
    }

    private requestUpdate() {
        if(!this.updateRequested) {
            this.updateRequested = true;
            requestAnimationFrame(this.onUpdate);
        }
    }

    private onUpdate = (): void => {
        this.updateRequested = false;
        if(this.revealCounter > 0) {
            this.revealCounter = this.revealCounter - 1;
        }
        if(this.resized) {
            const listeners = this.resizeChangeListeners.slice();
            const count = listeners.length;
            for(let n = 0; n < count; n++) {
                listeners[n].call(undefined);
            }
            if(this.trackerRegistry.updateResize(this.hideNonFixedEnabled && this.hideNonFixedUpdate)) {
                this.revealCounter = REVEAL_COUNTER_START;
            }
            for(const overflowTracker of this.overflowTrackers) {
                overflowTracker.update();
            }
            if(this.revealCounter === 0) {
                this.revealCounter = -1;
                this.trackerRegistry.revealHidden();
            } else if(this.revealCounter > 0) {
                this.requestUpdate();
            }
            this.trackerRegistry.applyResize();
            for(const overflowTracker of this.overflowTrackers) {
                overflowTracker.apply();
            }
        } else {
            if(this.trackerRegistry.updateScroll(this.hideNonFixedEnabled && this.hideNonFixedUpdate)) {
                this.revealCounter = REVEAL_COUNTER_START;
            }
            if(this.revealCounter === 0) {
                this.revealCounter = -1;
                this.trackerRegistry.revealHidden();
            } else if(this.revealCounter > 0) {
                this.requestUpdate();
            }
            this.trackerRegistry.applyScroll();
        }
        this.resized = false;
        this.hideNonFixedUpdate = false;
    }

    public scrollTop(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        this.trackerRegistry.scrollTop(key, coordOrElemOrSelector, offset, callback);
    }

    public scrollBottom(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        this.trackerRegistry.scrollBottom(key, coordOrElemOrSelector, offset, callback);
    }

    public scrollLeft(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        this.trackerRegistry.scrollLeft(key, coordOrElemOrSelector, offset, callback);
    }

    public scrollRight(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        this.trackerRegistry.scrollRight(key, coordOrElemOrSelector, offset, callback);
    }

    public scrollIntoView(key: string, elemOrSelector: Element | string, offset?: number, callback?: ScrollToCallback) {
        this.trackerRegistry.scrollIntoView(key, elemOrSelector, offset, callback);
    }
}
