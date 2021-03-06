// Copyright (c) 2018 Göran Gustafsson. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

export class ScrollLimiter {
    private refCount: number;
    public readonly element: Element | undefined;

    public left: number = 0;
    public top: number = 0;
    public right: number = Infinity;
    public bottom: number = Infinity;

    constructor(element: Element | undefined) {
        this.element = element;
        this.refCount = 1;
    }

    public increaseRef(): void {
        this.refCount += 1;
    }

    public decreaseRef(): boolean {
        this.refCount -= 1;
        return this.refCount <= 0;
    }
}
