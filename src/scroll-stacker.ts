import { ScrollLimiter } from './scroll-limiter';
import { StackerCallback } from './scroll-size-manager-types';
import * as domUtils from './dom-utils';

export abstract class ScrollStacker {
    protected readonly baseElement: Element;
    protected baseRight: number;
    protected baseBottom: number;
    protected readonly stackElement: HTMLElement;
    protected stackWidth: number;
    protected stackHeight: number;
    protected canUseFixed: boolean;
    protected trackOffset: boolean;

    protected readonly callback: StackerCallback;
    protected offset: number;
    protected fixedOffset: number;
    protected useFixed: boolean;

    public readonly limiter: ScrollLimiter;
    public baseTop: number;
    public baseLeft: number;
    public stacked: boolean;
    public lastStacked: boolean;
    public hidden: boolean;
    public changed: boolean;
    public enabled: boolean = true;

    constructor(
        winLeft: number,
        winTop: number,
        limiter: ScrollLimiter,
        baseElement: Element,
        stackElement: HTMLElement,
        stackWidth: number | string,
        stackHeight: number | string,
        canUseFixed: boolean,
        trackOffset: boolean,
        callback: StackerCallback,
    ) {
        const rect = baseElement.getBoundingClientRect();
        this.limiter = limiter;
        this.baseElement = baseElement;
        this.baseLeft = winLeft + rect.left;
        this.baseTop = winTop + rect.top;
        this.baseRight = winLeft + rect.right;
        this.baseBottom = winTop + rect.bottom;
        this.stackElement = stackElement;
        this.stackWidth = domUtils.getValueOrCSSProp(stackWidth, 'width');
        this.stackHeight = domUtils.getValueOrCSSProp(stackHeight, 'height');
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

    public unregister(): void {
        this.callback(false, 0, false, false, false);
    }

    public enable(): void {
        this.enabled = true;
    }

    public disable(): void {
        this.enabled = false;
    }

    public abstract update(
        offsetPos: number,
        winPos: number,
        winSize: number,
        useFixed: boolean,
        hideNonFixed: boolean,
        restack: boolean,
        resize: boolean,
        winLeft: number,
        winTop: number
    ): number;

    public abstract apply(): void;

    public abstract simulate(offsetPos: number, winPos: number, winSize: number): number;
}
