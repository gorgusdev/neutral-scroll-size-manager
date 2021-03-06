// Copyright (c) 2018 Göran Gustafsson. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { ScrollStacker } from './scroll-stacker';

export class ScrollStackerRight extends ScrollStacker {

    public update(
        offsetPos: number,
        winPos: number,
        winSize: number,
        useFixed: boolean,
        hideNonFixed: boolean,
        restack: boolean,
        resize: boolean,
        winLeft: number,
        winTop: number
    ): number {
        if(!this.enabled) {
            if(this.stacked) {
                this.changed = true;
                this.stacked = false;
                this.offset = 0;
                this.fixedOffset = 0;
                this.useFixed = false;
                this.hidden = false;
                this.lastStacked = false;
            }
        } else {
            if(resize) {
                const rect = this.baseElement.getBoundingClientRect();
                this.baseLeft = winPos + rect.left - winLeft;
                this.baseTop = rect.top - winTop;
                this.baseRight = winPos + rect.right - winLeft;
                this.baseBottom = rect.bottom - winTop;
            }
            if((winPos + winSize - offsetPos > this.limiter.left + this.stackWidth) && (winPos + winSize - offsetPos < this.limiter.right)) {
                if((winPos + winSize - offsetPos < this.baseRight) && (!useFixed || !this.canUseFixed || this.trackOffset || !this.stacked || restack)) {
                    const offset = this.baseRight - ((winPos + winSize) - offsetPos);
                    this.changed = true;
                    this.stacked = true;
                    this.offset = offset;
                    this.fixedOffset = offsetPos;
                    if(useFixed && this.canUseFixed) {
                        this.useFixed = true;
                        this.hidden = false;
                    } else {
                        this.useFixed = false;
                        this.hidden = hideNonFixed;
                    }
                } else if((winPos + winSize - offsetPos >= this.baseRight) && this.stacked) {
                    this.changed = true;
                    this.stacked = false;
                    this.offset = 0;
                    this.fixedOffset = 0;
                    this.useFixed = false;
                    this.hidden = false;
                    this.lastStacked = false;
                }
            } else if(this.stacked) {
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
    }

    public apply(): void {
        if(this.changed) {
            this.changed = false;
            if(this.stacked) {
                if(this.useFixed) {
                    this.stackElement.style.right = this.fixedOffset.toFixed(0) + 'px';
                } else {
                    this.stackElement.style.right = this.offset.toFixed(0) + 'px';
                }
            } else {
                this.stackElement.style.right = '';
            }
            this.callback(this.stacked, this.offset, this.useFixed, this.hidden, this.lastStacked);
        }
    }

    public simulate(offsetPos: number, winPos: number, winSize: number): number {
        if((winPos + winSize - offsetPos > this.limiter.left + this.stackWidth) && (winPos + winSize - offsetPos < this.limiter.right)) {
            if(winPos + winSize - offsetPos < this.baseRight) {
                return this.stackHeight;
            }
        }
        return 0;
    }
}
