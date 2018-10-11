// Copyright (c) 2018 Göran Gustafsson. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

export type ScrollChangeListener = (x: number, y: number) => void;

export type StackerCallback = (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean, lastStacked: boolean) => void;

export interface StackerControl {
    unregister: () => void;
    enable: () => void;
    disable: () => void;
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

export type AnchorCallback = (anchorClass: string) => void;

export interface AnchorControl {
    unregister: () => void;
    enable: () => void;
    disable: () => void;
}

export type OverflowCallback = (overflowed: boolean, width: number, height: number) => void;

export interface OverflowControl {
    unregister: () => void;
    enable: () => void;
    disable: () => void;
}

export type ScrollToCallback = (left: number, top: number) => void;
