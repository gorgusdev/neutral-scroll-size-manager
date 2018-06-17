import { OverflowCallback } from './scroll-size-manager-types';

export class OverflowTracker {
    private readonly containerElement: Element;
    private readonly element: HTMLElement;
    private readonly overflowWidth: boolean;
    private readonly overflowHeight: boolean;
    private readonly callback: OverflowCallback;
    private changed: boolean = false;
    private overflowed: boolean = false;
    private width: number = 0;
    private height: number = 0;
    private enabled: boolean = true;

    constructor(containerElement: Element, element: HTMLElement, overflowWidth: boolean, overflowHeight: boolean, callback: OverflowCallback) {
        this.containerElement = containerElement;
        this.element = element;
        this.overflowWidth = overflowWidth;
        this.overflowHeight = overflowHeight;
        this.callback = callback;
    }

    public enable = (): void => {
        this.enabled = true;
    }

    public disable = (): void => {
        this.enabled = false;
    }

    public update(): void {
        if(this.enabled) {
            const containerElement = this.containerElement;
            let containerWidth = 0;
            let containerHeight = 0;
            if(this.overflowWidth) {
                containerWidth = containerElement.clientWidth;
            }
            if(this.overflowHeight) {
                containerHeight = containerElement.clientHeight;
            }
            const element = this.element;
            const width = element.offsetWidth;
            const height = element.offsetHeight;
            const overflowed = ((containerHeight > 0) && (height > containerHeight)) || ((containerWidth > 0) && (width > containerWidth));
            if(overflowed && !this.overflowed) {
                this.changed = true;
                this.overflowed = true;
                this.width = width;
                this.height = height;
            } else if(!overflowed && this.overflowed) {
                this.changed = true;
                this.overflowed = false;
                this.width = width;
                this.height = height;
            } else if(((containerWidth > 0) && (width !== this.width))
                    || ((containerHeight > 0) && (height !== this.height))) {
                this.changed = true;
                this.width = width;
                this.height = height;
            }
        } else {
            if(this.overflowed) {
                this.changed = false;
                this.overflowed = false;
                this.width = 0;
                this.height = 0;
            }
        }
    }

    public apply(): void {
        if(this.changed) {
            this.changed = false;
            this.callback(this.overflowed, this.width, this.height);
        }
    }

}
