// Copyright (c) 2018 Göran Gustafsson. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { AnchorClasses, AnchorCallback } from './scroll-size-manager-types';

export class AnchorTracker {
    private readonly baseElement: Element;
    private readonly anchoredElement: Element;
    private readonly defaultClass: string;
    private readonly classes: AnchorClasses;
    private readonly callback: AnchorCallback;
    private changed: boolean = false;
    private currentClass: string;
    private enabled: boolean = true;

    constructor(baseElement: Element, anchoredElement: Element, anchorClass: string, anchorClasses: AnchorClasses, callback: AnchorCallback) {
        this.baseElement = baseElement;
        this.anchoredElement = anchoredElement;
        this.defaultClass = anchorClass;
        this.currentClass = anchorClass;
        this.classes = anchorClasses;
        this.callback = callback;
    }

    public enable = (): void => {
        this.enabled = true;
    }

    public disable = (): void => {
        this.enabled = false;
    }

    public update(winTop: number, winRight: number, winBottom: number, winLeft: number): void {
        let currentClass: string;
        if(this.enabled) {
            const baseRect = this.baseElement.getBoundingClientRect();
            const anchoredRect = this.anchoredElement.getBoundingClientRect();
            const defaultClass = this.defaultClass;
            const classes = this.classes;
            const elemWidth = anchoredRect.right - anchoredRect.left;
            const elemHeight = anchoredRect.bottom - anchoredRect.top;
            if((defaultClass === classes.topLeft)
                    || (defaultClass === classes.topRight)
                    || (defaultClass === classes.bottomLeft)
                    || (defaultClass === classes.bottomRight)) {
                currentClass = this.calculateVertClass(baseRect, elemWidth, elemHeight, winTop, winRight, winBottom, winLeft);
            } else {
                currentClass = this.calculateHorizClass(baseRect, elemWidth, elemHeight, winTop, winRight, winBottom, winLeft);
            }
        } else {
            currentClass = this.defaultClass;
        }
        if(currentClass !== this.currentClass) {
            this.changed = true;
            this.currentClass = currentClass;
        }
    }

    public apply(): void {
        if(this.changed) {
            this.changed = false;
            this.callback(this.currentClass);
        }
    }

    private calculateHorizClass(
        baseRect: ClientRect | DOMRect,
        elemWidth: number,
        elemHeight: number,
        winTop: number,
        winRight: number,
        winBottom: number,
        winLeft: number
    ): string {
        const leftTop = this.visibleArea(
            baseRect.right,
            baseRect.top,
            baseRect.right + elemWidth,
            baseRect.top + elemHeight,
            winLeft,
            winTop,
            winRight,
            winBottom
        );
        const leftBottom = this.visibleArea(
            baseRect.right,
            baseRect.bottom - elemHeight,
            baseRect.right + elemWidth,
            baseRect.bottom,
            winLeft,
            winTop,
            winRight,
            winBottom
        );
        const rightTop = this.visibleArea(
            baseRect.left - elemWidth,
            baseRect.top,
            baseRect.left,
            baseRect.top + elemHeight,
            winLeft,
            winTop,
            winRight,
            winBottom
        );
        const rightBottom = this.visibleArea(
            baseRect.left - elemWidth,
            baseRect.bottom - elemHeight,
            baseRect.left,
            baseRect.bottom,
            winLeft,
            winTop,
            winRight,
            winBottom
        );
        const defaultClass = this.defaultClass;
        const classes = this.classes;
        if(defaultClass === classes.leftTop) {
            if((leftTop >= rightTop) && (leftTop >= leftBottom) && (leftTop >= rightBottom)) {
                return classes.leftTop;
            } else if((leftBottom >= leftTop) && (leftBottom >= rightTop) && (leftBottom >= rightBottom)) {
                return classes.leftBottom;
            } else if((rightTop >= leftTop) && (rightTop >= leftBottom) && (rightTop >= rightBottom)) {
                return classes.rightTop;
            } else {
                return classes.rightBottom;
            }
        } else if(defaultClass === classes.rightTop) {
            if((rightTop >= leftTop) && (rightTop >= leftBottom) && (rightTop >= rightBottom)) {
                return classes.rightTop;
            } else if((rightBottom >= leftTop) && (rightBottom >= rightTop) && (rightBottom >= leftBottom)) {
                return classes.rightBottom;
            } else if((leftTop >= rightTop) && (leftTop >= leftBottom) && (leftTop >= rightBottom)) {
                return classes.leftTop;
            } else {
                return classes.leftBottom;
            }
        } else if(defaultClass === classes.leftBottom) {
            if((leftBottom >= leftTop) && (leftBottom >= rightTop) && (leftBottom >= rightBottom)) {
                return classes.leftBottom;
            } else if((leftTop >= rightTop) && (leftTop >= leftBottom) && (leftTop >= rightBottom)) {
                return classes.leftTop;
            } else if((rightBottom >= leftTop) && (rightBottom >= rightTop) && (rightBottom >= leftBottom)) {
                return classes.rightBottom;
            } else {
                return classes.rightTop;
            }
        } else {
            if((rightBottom >= leftTop) && (rightBottom >= rightTop) && (rightBottom >= leftBottom)) {
                return classes.rightBottom;
            } else if((rightTop >= leftTop) && (rightTop >= leftBottom) && (rightTop >= rightBottom)) {
                return classes.rightTop;
            } else if((leftBottom >= leftTop) && (leftBottom >= rightTop) && (leftBottom >= rightBottom)) {
                return classes.leftBottom;
            } else {
                return classes.leftTop;
            }
        }
    }

    private calculateVertClass(
        baseRect: ClientRect | DOMRect,
        elemWidth: number,
        elemHeight: number,
        winTop: number,
        winRight: number,
        winBottom: number,
        winLeft: number
    ): string {
        const topLeft = this.visibleArea(
            baseRect.left,
            baseRect.bottom,
            baseRect.left + elemWidth,
            baseRect.bottom + elemHeight,
            winLeft,
            winTop,
            winRight,
            winBottom
        );
        const topRight = this.visibleArea(
            baseRect.right - elemWidth,
            baseRect.bottom,
            baseRect.right,
            baseRect.bottom + elemHeight,
            winLeft,
            winTop,
            winRight,
            winBottom
        );
        const bottomLeft = this.visibleArea(
            baseRect.left,
            baseRect.top - elemHeight,
            baseRect.left + elemWidth,
            baseRect.top,
            winLeft,
            winTop,
            winRight,
            winBottom
        );
        const bottomRight = this.visibleArea(
            baseRect.right - elemWidth,
            baseRect.top - elemHeight,
            baseRect.right,
            baseRect.top,
            winLeft,
            winTop,
            winRight,
            winBottom
        );
        const defaultClass = this.defaultClass;
        const classes = this.classes;
        if(defaultClass === classes.topLeft) {
            if((topLeft >= topRight) && (topLeft >= bottomLeft) && (topLeft >= bottomRight)) {
                return classes.topLeft;
            } else if((bottomLeft >= topLeft) && (bottomLeft >= topRight) && (bottomLeft >= bottomRight)) {
                return classes.bottomLeft;
            } else if((topRight >= topLeft) && (topRight >= bottomLeft) && (topRight >= bottomRight)) {
                return classes.topRight;
            } else {
                return classes.bottomRight;
            }
        } else if(defaultClass === classes.topRight) {
            if((topRight >= topLeft) && (topRight >= bottomLeft) && (topRight >= bottomRight)) {
                return classes.topRight;
            } else if((bottomRight >= topLeft) && (bottomRight >= topRight) && (bottomRight >= bottomLeft)) {
                return classes.bottomRight;
            } else if((topLeft >= topRight) && (topLeft >= bottomLeft) && (topLeft >= bottomRight)) {
                return classes.topLeft;
            } else {
                return classes.bottomLeft;
            }
        } else if(defaultClass === classes.bottomLeft) {
            if((bottomLeft >= topLeft) && (bottomLeft >= topRight) && (bottomLeft >= bottomRight)) {
                return classes.bottomLeft;
            } else if((topLeft >= topRight) && (topLeft >= bottomLeft) && (topLeft >= bottomRight)) {
                return classes.topLeft;
            } else if((bottomRight >= topLeft) && (bottomRight >= topRight) && (bottomRight >= bottomLeft)) {
                return classes.bottomRight;
            } else {
                return classes.topRight;
            }
        } else {
            if((bottomRight >= topLeft) && (bottomRight >= topRight) && (bottomRight >= bottomLeft)) {
                return classes.bottomRight;
            } else if((topRight >= topLeft) && (topRight >= bottomLeft) && (topRight >= bottomRight)) {
                return classes.topRight;
            } else if((bottomLeft >= topLeft) && (bottomLeft >= topRight) && (bottomLeft >= bottomRight)) {
                return classes.bottomLeft;
            } else {
                return classes.topLeft;
            }
        }
    }

    private visibleArea(
        elemLeft: number,
        elemTop: number,
        elemRight: number,
        elemBottom: number,
        winLeft: number,
        winTop: number,
        winRight: number,
        winBottom: number
    ) {
        const widthOverlap = Math.max(0, Math.min(elemRight, winRight) - Math.max(elemLeft, winLeft));
        const heightOverlap = Math.max(0, Math.min(elemBottom, winBottom) - Math.max(elemTop, winTop));
        return widthOverlap * heightOverlap;
    }
}
