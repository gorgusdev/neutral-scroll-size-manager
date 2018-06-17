import { ScrollTracker, StackerLocation } from './scroll-tracker';
import { ScrollChangeListener, ScrollToCallback } from './scroll-size-manager-types';
import { AnchorClasses, AnchorCallback, AnchorControl, StackerCallback, StackerControl } from './scroll-size-manager-types';

interface ScrollTrackerMap {
    [key: string]: ScrollTracker;
}

export class ScrollTrackerRegistry {
    private trackerMap: ScrollTrackerMap = {};

    public createTracker(key: string): ScrollTracker {
        let tracker = this.trackerMap[key];
        if(!tracker) {
            tracker = new ScrollTracker();
            this.trackerMap[key] = tracker;
        }

        return tracker;
    }

    public destroyTracker(key: string): void {
        const tracker = this.trackerMap[key];
        if(tracker) {
            tracker.unregister();
            delete this.trackerMap[key];
        }
    }

    public addScrollChangeListener(key: string, callback: ScrollChangeListener): () => void {
        const tracker = this.trackerMap[key];
        if(!tracker) {
            throw new Error('Tracker key not found for addScrollChangeListener: ' + key);
        }
        return tracker.addScrollChangeListener(callback);
    }

    public addAnchorTracker(
        key: string,
        baseElement: Element,
        anchoredElement: Element,
        anchorClass: string,
        anchorClasses: AnchorClasses,
        callback: AnchorCallback
    ): AnchorControl {
        const tracker = this.trackerMap[key];
        if(!tracker) {
            throw new Error('Tracker key not found for addAnchorTracker: ' + key);
        }
        return tracker.addAnchorTracker(baseElement, anchoredElement, anchorClass, anchorClasses, callback);
    }

    public addScrollStacker(
        key: string,
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
        const tracker = this.trackerMap[key];
        if(!tracker) {
            throw new Error('Tracker key not found for addScrollStacker: ' + key);
        }
        return tracker.addScrollStacker(
            baseElement,
            stackElement,
            limiterSelector,
            limiterSkipCount,
            stackWidth,
            stackHeight,
            canUseFixed,
            trackOffset,
            callback,
            stackerLocation
        );
    }

    public updateResize(hideNonFixed: boolean): boolean {
        let hasHiddenStackers = false;
        const trackerMap = this.trackerMap;
        for(const key in trackerMap) {
            if(!trackerMap.hasOwnProperty(key)) {
                continue;
            }
            hasHiddenStackers = hasHiddenStackers || trackerMap[key].updateResize(hideNonFixed);
        }
        return hasHiddenStackers;
    }

    public applyResize(): void {
        const trackerMap = this.trackerMap;
        for(const key in trackerMap) {
            if(!trackerMap.hasOwnProperty(key)) {
                continue;
            }
            trackerMap[key].applyResize();
        }
    }

    public updateScroll(hideNonFixed: boolean): boolean {
        let hasHiddenStackers = false;
        const trackerMap = this.trackerMap;
        for(const key in trackerMap) {
            if(!trackerMap.hasOwnProperty(key)) {
                continue;
            }
            hasHiddenStackers = hasHiddenStackers || trackerMap[key].updateScroll(hideNonFixed);
        }
        return hasHiddenStackers;
    }

    public applyScroll(): void {
        const trackerMap = this.trackerMap;
        for(const key in trackerMap) {
            if(!trackerMap.hasOwnProperty(key)) {
                continue;
            }
            trackerMap[key].applyScroll();
        }
    }

    public revealHidden(): void {
        const trackerMap = this.trackerMap;
        for(const key in trackerMap) {
            if(!trackerMap.hasOwnProperty(key)) {
                continue;
            }
            trackerMap[key].revealHidden();
        }
    }

    public scrollTop(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        const tracker = this.trackerMap[key];
        if(!tracker) {
            throw new Error('Tracker key not found for scrollTop: ' + key);
        }
        tracker.scrollTop(coordOrElemOrSelector, offset, callback);
    }

    public scrollBottom(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        const tracker = this.trackerMap[key];
        if(!tracker) {
            throw new Error('Tracker key not found for scrollBottom: ' + key);
        }
        tracker.scrollBottom(coordOrElemOrSelector, offset, callback);
    }

    public scrollLeft(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        const tracker = this.trackerMap[key];
        if(!tracker) {
            throw new Error('Tracker key not found for scrollLeft: ' + key);
        }
        tracker.scrollLeft(coordOrElemOrSelector, offset, callback);
    }

    public scrollRight(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback) {
        const tracker = this.trackerMap[key];
        if(!tracker) {
            throw new Error('Tracker key not found for scrollRight: ' + key);
        }
        tracker.scrollRight(coordOrElemOrSelector, offset, callback);
    }

    public scrollIntoView(key: string, elemOrSelector: Element | string, offset?: number, callback?: ScrollToCallback) {
        const tracker = this.trackerMap[key];
        if(!tracker) {
            throw new Error('Tracker key not found for scrollIntoView: ' + key);
        }
        tracker.scrollIntoView(elemOrSelector, offset, callback);
    }
}
