import { ScrollStacker } from './scroll-stacker';

export class ScrollStackerTop extends ScrollStacker {

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
                this.baseLeft = rect.left - winLeft;
                this.baseTop = winPos + rect.top - winTop;
                this.baseRight = rect.right - winLeft;
                this.baseBottom = winPos + rect.bottom - winTop;
            }
            if((winPos + offsetPos > this.limiter.top) && (winPos + offsetPos < this.limiter.bottom - this.stackHeight)) {
                if((winPos + offsetPos > this.baseTop) && (!useFixed || !this.canUseFixed || this.trackOffset || !this.stacked || restack)) {
                    const offset = winPos + offsetPos - this.baseTop;
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
                } else if((winPos + offsetPos <= this.baseTop) && this.stacked) {
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
        return (this.stacked ? this.stackHeight : 0);
    }

    public apply(): void {
        if(this.changed) {
            this.changed = false;
            if(this.stacked) {
                if(this.useFixed) {
                    this.stackElement.style.top = this.fixedOffset.toFixed(0) + 'px';
                } else {
                    this.stackElement.style.top = this.offset.toFixed(0) + 'px';
                }
            } else {
                this.stackElement.style.top = '';
            }
            this.callback(this.stacked, this.offset, this.useFixed, this.hidden, this.lastStacked);
        }
    }

    public simulate(offsetPos: number, winPos: number, winSize: number): number {
        if((winPos + offsetPos > this.limiter.top) && (winPos + offsetPos < this.limiter.bottom - this.stackHeight)) {
            if(winPos + offsetPos > this.baseTop) {
                return this.stackHeight;
            }
        }
        return 0;
    }
}
