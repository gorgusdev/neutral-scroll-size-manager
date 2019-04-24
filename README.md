# Neutral Scroll Size Manager

This is a framework neutral scroll and resize tracker/manager for client-size web applications.

## Installation

```
npm install neutral-scroll-size-manager --save
```


## Interface

The manager module is written in TypeScript and the normal way to use the manager is to use the
singleton instance of the manager that is the default export of the module. The manager interface
has the following methods:

### Start Resize Tracking

```javascript
startResizeTracking(): void
```

Use this method to start tracking the resizing of the browser window.

### Stop Resize Tracking

```javascript
stopResizeTracking(): void
```

Use this method to stop tracking the resizing of the browser window.

### Check Resize From State Change

```javascript
checkResizeFromStateChange(): void
```

Call this method to notify the manager of the possibility of a resize change due to a change in
the application state.

### Hide Non Fixed While Scrolling

```javascript
hideNonFixedWhileScrolling(hide: boolean): void
```

Call this method to enable or disable hiding non-fixed elements while scrolling.

### Add Scroll Tracker

```javascript
addScrollTracker(key: string, elem: Window | HTMLElement,
	fixedTopOffset?: string | number, fixedRightOffset?: string | number,
	fixedBottomOffset?: string | number, fixedLeftOffset?: string | number): void
```
- **key** A key used to refer to the scroll tracker.

- **elem** An element that will produce scroll events.

Add a scroll tracker connected to an element by calling this method. A scroll event handler
will be added to the `elem` argument.

### Remove Tracker

```javascript
removeTracker(key: string): void
```
- **key** A key used to refer to the scroll tracker.

Call this method to remove a scroll tracker added by the `addScrollTracker` method.

### Add Scroll Change Listener

```javascript
addScrollChangeListener(key: string, callback: ScrollChangeListener): () => void
```
- **key** A key used to refer to the scroll tracker.

- **callback** A callback function called when the scroll position changes.

Use this method to add a scroll position callback to a scroll tracker. This is equivalent
to adding a scroll event listener on the element of the scroll tracker.

The method will return a function to remove the change listener.

```javascript
interface ScrollChangeListener {
	(x: number, y: number): void;
}
```


### Add Resize Change Listener

```javascript
addResizeChangeListener(callback: ResizeChangeListener): () => void
```
- **callback** A callback function called on resize changes.

Use this method to add a resize change callback. The callback will be called
when the browser window changes size or when the `checkResizeFromStateChange`
method is called.

The method will return a function to remove the change listener.

```javascript
interface ResizeChangeListener {
	(): void;
}
```


### Add Top / Bottom / Left / Right Stacker

```javascript
addTopStacker(key: string, baseElement: Element, stackElement: HTMLElement, 
	limiterSelector: string, limiterSkipCount: number, stackHeight: string | number, 
	canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): StackerControl

addBottomStacker(key: string, baseElement: Element, stackElement: HTMLElement, 
	limiterSelector: string, limiterSkipCount: number, stackHeight: string|number, 
	canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): StackerControl

addLeftStacker(key: string, baseElement: Element, stackElement: HTMLElement, 
	limiterSelector: string, limiterSkipCount: number, stackWidth: string|number, 
	canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): StackerControl

addRightStacker(key: string, baseElement: Element, stackElement: HTMLElement, 
	limiterSelector: string, limiterSkipCount: number, stackWidth: string|number, 
	canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): StackerControl
```
- **key** A key used to refer to the scroll tracker.

- **baseElement** An element used to check if stacking should occur.

- **stackElement** An element that will stacked.

- **limiterSelector** A selector string used to find the parent limiter element.

- **limiterSkipCount** A number of matching limiter elements to skip.

- **stackWidth** A number or string representing the width of the stack element.

- **stackHeight** A number or string representing the height of the stack element.

- **canUseFixed** A flag to indicate if `position: fixed` can be used to stack.

- **trackOffset** A flag to indicate if the callback should be called while stacked.

- **callback** A callback function called to change stacking.

Call these methods to add stackers to a scroll tracker. A stacker will check if the `baseElem` element is above, below,
to the left or to the right of the respective edge of the scroll tracker bounding box. Additionally the `baseElem` bounding
box must fit inside the visible part of a limiter element. If these checks returns true the `stackElem` is considered stacked.

The limiter element is found by walking up the list of `baseElem` parent elements and checking to see which one matches the
`limiterSelector` argument string. A number of matched limiter elements equal to the `limiterSkipCount` argument are ignored
before a limiter element is selected. If the limiter selector is false (by being the empty string) no limiter element will
be searched for and no check against a limiter element will be performed.

A stacked element will have an inline style applied to set the `top` / `bottom` / `left` / `right` position.

After any changes to inline styles the `callback` function will be called to notify the application that `stackElem` is now
stacked. It's up to the application to apply any styles to actually make the element stack according to the position set by
the manager.

While the `stackElem` is considered stacked the `callback` will be called to report how far outside the edge the `baseElem`
has been scrolled if `trackOffset` is true or the element can't be stacked with `position: fixed`. Otherwise the `callback`
won't be called until the stacked status changes.

When the `stackElem` is no longer considered stacked the `top` / `bottom` / `left` / `right` inline style will be removed and
the `callback` will be called to notify the application.

Each stacked element along a scroll tracker edge moves that edge a distance equal to the `stackWidth` / `stackHeight` for any
other stacked elements after it.

To remove a stacker use the unregister function in the StackerControl object returned by these methods.

```javascript
interface StackerCallback {
	(stacked: boolean, offset: number, useFixed: boolean, hidden: boolean, lastStacked: boolean): void;
}
```
- **stacked** A flag to indicate if the element should be stacked or not.

- **offset** A number representing the offset of the element outside the edge.

- **useFixed** A flag to indicate if the element should use `position: fixed` to stack.

- **hidden** A flag to indicate if the element should be hidden while scrolling occurs.

- **lastStacked** A flag to indicate if the element is the last in it's stack.

```javascript
interface StackerControl {
    unregister: () => void;
    enable: () => void;
    disable: () => void;
}
```
- **unregister** A method to remove the element from stacking.

- **enable** A method to enable stacking.

- **disable** A method to disable stacking.


### Add Anchor Tracker

```javascript
addAnchorTracker(key: string, baseElement: Element, anchoredElement: Element,
	anchorClass: string, anchorClasses: AnchorClasses, callback: AnchorCallback
): AnchorControl
```
- **key** A key used to refer to the scroll tracker.

- **baseElement** An element that the `anchoredElement` is anchored to.

- **anchoredElement** An element that is anchored to the `baseElement`.

- **anchorClass** A CSS class name that indicate where `anchoredElement` is anchored.

- **anchorClasses** A map of alternative CSS class names to indicate anchor points.

- **callback** A callback function called to change anchor point.

Use this method to add an anchor tracker to a scroll tracker. When a resize occurs the anchor trackers will be checked to see
if any anchor points should be changed. An anchor tracker is checked by looking at the current anchor class of an `anchoredElement`.
There are 8 different anchor classes provided by the `anchorClasses` argument. Each one indicates how `anchoredElement`
is anchored to `baseElement`:

- **topLeft**: `anchoredElement` extends below `baseElement` with its top edge along `baseElement`'s bottom edge and with both left edges aligned.
- **topRight**: `anchoredElement` extends below `baseElement` with its top edge along `baseElement`'s bottom edge and with both right edges aligned.
- **bottomLeft**: `anchoredElement` extends above `baseElement` with its bottom edge along `baseElement`'s top edge and with both left edges aligned.
- **bottomRight**: `anchoredElement` extends above `baseElement` with its bottom edge along `baseElement`'s top edge and with both right edges aligned.
- **leftTop**: `anchoredElement` extends to the right of `baseElement` with its left edge along `baseElement`'s right edge and with both top edges aligned.
- **leftBottom**: `anchoredElement` extends the right of `baseElement` with its left edge along `baseElement`'s right edge and with both bottom edges aligned.
- **rightTop**: `anchoredElement` extends to the left of `baseElement` with its right edge along `baseElement`'s left edge and with both top edges aligned.
- **rightBottom**: `anchoredElement` extends to the left of `baseElement` with its right edge along `baseElement`'s left edge and with both bottom edges aligned.

Based on these positions the visible area of `anchoredElement` inside the scroll tracker bounding box is calculated for each valid class.
Valid classes are determined by grouping the classes into two groups and only looking at classes in the same group as the group that
the current class is in. The first group contains: `topLeft`, `topRight`, `bottomLeft` and `bottomRight`. The second group are the
remaining four classes: `leftTop`, `leftBottom`, `rightTop` and `rightBottom`.

The anchor class with the largest visible area is selected as the best anchor class. If no anchor class is strictly better than the others the
value of `anchorclass` is used. If the selected anchor class isn't the current anchor class the `callback` function is called to notify the
application. It's up to the application to make any style changes to match the anchor class.

To remove an anchor tracker use the unregister function in the AnchorControl object returned from this method.

```javascript
interface AnchorCallback {
	(anchorClass: string): void;
}

interface AnchorClasses {
	topLeft: string;
	topRight: string;
	bottomLeft: string;
	bottomRight: string;
	leftTop: string;
	leftBottom: string;
	rightTop: string;
	rightBottom: string;
}
```

```javascript
interface AnchorControl {
    unregister: () => void;
    enable: () => void;
    disable: () => void;
}
```
- **unregister** A method to remove the anchor tracker.

- **enable** A method to enable the anchor tracker.

- **disable** A method to disable the anchor tracker.


### Add Overflow Tracker

```javascript
addOverflowTracker(containerElement: Element, element: HTMLElement,
	overflowWidth: boolean, overflowHeight: boolean, callback: OverflowCallback
): OverflowControl
```
- **containerElement** An element to track overflow in.

- **element** An element whose size is compared to `containerElement` to determine overflow.

- **overflowWidth** A flag to indicate if the width can overflow.

- **overflowHeight** A flag to indicate if the height can overflow.

- **callback** A callback function called when `element` overflows.

Call this method to add an overflow tracker to the manager. The overflow tracker will monitor `containerElement` and
`element` to see if `element`'s width and/or height is larger than `containerElement`'s client width and/or height. Width
is checked only if `overflowWidth` is true and height is checked only if `overflowHeight` is true.

If the size of `element` is overflowing `containerElement` the `callback` function will be called to notify the application of the 
unrestricted size.

If the size stops overflowing, the `callback` function will be called once again to notify the application.

To remove an overflow tracker from the manager use the unregister function in the OverflowControl object returned from this method.

```javascript
interface OverflowCallback {
	(overflowed: boolean, width: number, height: number): void;
}
```
- **overflow** A flag to indicate that an overflow has occurred.

- **width** A number representing the full overflow width.

- **height** A number representing the full overflow height.

```javascript
interface OverflowControl {
    unregister: () => void;
    enable: () => void;
    disable: () => void;
}
```
- **unregister** A method to remove the overflow tracker.

- **enable** A method to enable the overflow tracker.

- **disable** A method to disable the overflow tracker.


### Scroll Top / Bottom / Left / Right

```javascript
scrollLeft(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback)

scrollTop(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback)

scrollRight(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback)

scrollBottom(key: string, coordOrElemOrSelector: Element | string | number, offset?: number, callback?: ScrollToCallback)
```
- **key** A key used to refer to the scroll tracker.

- **coordOrElemOrSelector** Target to scroll to as a coordinate number, element or selector.

- **offset** An optional offset from det target set by `coordOrElemOrSelector`.

- **callback** A callback to perform the scrolling. Default scrolling will be used if not provided.

Use one of these methods to position a scroll tracker at a target location. The target
`coordOrElemOrSelector` can be a numeric coordinate in the scroll tracker, a DOM element or
a selector string that matches a DOM element. If a DOM element or selector is used then the
scroll tracker will be position such that the left, top, right or bottom edge of the element
is next to the corresponding edge of the scroll tracker. For example using the `scrollLeft`
method on a scroll tracker connected to the window with an element as argument, will position
the element's top edge against the window's top edge.

Any stacked elements along an edge will be accounted for when positioning the scroll tracker.

If the `offset` parameter is provided then the target location will be shifted away from the
scroll tracker edge the offset amount of pixels.

If the `callback` parameter is provided no actual scrolling will be done by the scroll size manager.

### Scroll Into View

```javascript
scrollIntoView(key: string, elemOrSelector: Element | string, offset?: number, callback?: ScrollToCallback)
```
- **key** A key used to refer to the scroll tracker.

- **elemOrSelector** Target to scroll into view as an element or selector.

- **offset** An optional offset from det target set by `elemOrSelector`.

- **callback** A callback to perform the scrolling. Default scrolling will be used if not provided.

Use this method to position a scroll tracker such that a DOM element becomes visible. If any
edge of the element is outside the visible part of the scroll tracker container then the
corresponding scroll method will be called to bring that edge to the edge of the container.
If both opposing edges (left / right, top / bottom) of the element is outside the visible
part of the container then the left and/or top edges will be scrolled into view.

The `elemOrSelector` can be a DOM element or a selector string matching a DOM element in the
document.

Any stacked elements along an edge will be accounted for when positioning the scroll tracker.

If the `offset` parameter is provided then that many pixels will be added around the element
when positioning the scroll tracker.

If the `callback` parameter is provided no actual scrolling will be done by the scroll size manager.


- - -

> I don't know if it's good, but it's definitely not evil, so I guess it's neutral.
