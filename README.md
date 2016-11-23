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
startResizeTracking()
```

Use this method to start tracking the resizing of the browser window.

### Stop Resize Tracking

```javascript
stopResizeTracking()
```

Use this method to stop tracking the resizing of the browser window.

### Check Resize From State Change

```javascript
checkResizeFromStateChange()
```

Call this method to notify the manager of the possibility of a resize change due to a change in
the application state.

### Add Scroll Tracker

```javascript
addScrollTracker(key: string, elem: any)
```
- **key** A key used to refer to the scroll tracker.

- **elem** An element that will produce scroll events.

Add a scroll tracker connected to an element by calling this method. A scroll event handler
will be added to the `elem` argument.

### Remove Tracker

```javascript
removeTracker(key: string)
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


### Add Top / Bottom / Left / Right Stacker

```javascript
addTopStacker(key: string, baseElem: Element, stackElem: HTMLElement, 
	limiterSelector: string, limiterSkipCount: number, stackHeight: string|number, 
	canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): () => void

addBottomStacker(key: string, baseElem: Element, stackElem: HTMLElement, 
	limiterSelector: string, limiterSkipCount: number, stackHeight: string|number, 
	canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): () => void

addLeftStacker(key: string, baseElem: Element, stackElem: HTMLElement, 
	limiterSelector: string, limiterSkipCount: number, stackWidth: string|number, 
	canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): () => void

addRightStacker(key: string, baseElem: Element, stackElem: HTMLElement, 
	limiterSelector: string, limiterSkipCount: number, stackWidth: string|number, 
	canUseFixed: boolean, trackOffset: boolean, callback: StackerCallback): () => void
```
- **key** A key used to refer to the scroll tracker.

- **baseElem** An element used to check if stacking should occur.

- **stackElem** An element that will stacked.

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

A stacked element will have an inline style applied to set the `top` / `bottom` / `left` / `right` position. The inline
`display` style can also be set to `none` if the `canUseFixed` argument is false or  the scroll tracker is not tracking
`window` scrolling and the `hideNonFixed` manager field is true. This is to hide stacked elements while scrolling to
prevent a jumpy / lagging update of the elements position. The inline `display` style will removed when scrolling stops.

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

To remove a stacker use the function returned by these methods.

```javascript
interface StackerCallback {
	(stacked: boolean, offset: number, useFixed: boolean, hidden: boolean): void;
}
```
- **stacked** A flag to indicate if the element should be stacked or not.

- **offset** A number representing the offset of the element outside the edge.

- **useFixed** A flag to indicate if the element should use `position: fixed` to stack.

- **hidden** A flag to indicate if the element is currently hidden while scrolling occurs.


### Add Anchor Tracker

```javascript
addAnchorTracker(key: string, elem: Element, anchorElem: Element, anchorClass: string, anchorClasses: AnchorClasses, callback: AnchorCallback): () => void
```
- **key** A key used to refer to the scroll tracker.

- **elem** An element that is anchored to the `anchorElem`.

- **anchorElem** An element that the `elem` is anchored to.

- **anchorClass** A CSS class name that indicate where `elem` is anchored.

- **anchorClasses** A map of alternative CSS class names to indicate anchor points.

- **callback** A callback function called to change anchor point.

Use this method to add an anchor tracker to a scroll tracker. When a resize occurs the anchor trackers will be checked to see
if any anchor points should be changed. An anchor tracker is checked by looking at the current anchor class of an `elem`. There
are 8 different anchor classes provided by the `anchorClasses` argument. Each one indicates how `elem` is anchored to `anchorElem`:

- **topLeft**: `elem` extends below `anchorElem` with its top edge along `anchorElem`'s bottom edge and with both left edges aligned.
- **topRight**: `elem` extends below `anchorElem` with its top edge along `anchorElem`'s bottom edge and with both right edges aligned.
- **bottomLeft**: `elem` extends above `anchorElem` with its bottom edge along `anchorElem`'s top edge and with both left edges aligned.
- **bottomRight**: `elem` extends above `anchorElem` with its bottom edge along `anchorElem`'s top edge and with both right edges aligned.
- **leftTop**: `elem` extends to the right of `anchorElem` with its left edge along `anchorElem`'s right edge and with both top edges aligned.
- **leftBottom**: `elem` extends the right of `anchorElem` with its left edge along `anchorElem`'s right edge and with both bottom edges aligned.
- **rightTop**: `elem` extends to the left of `anchorElem` with its right edge along `anchorElem`'s left edge and with both top edges aligned.
- **rightBottom**: `elem` extends to the left of `anchorElem` with its right edge along `anchorElem`'s left edge and with both bottom edges aligned.

Based on these positions the visible area of `elem` inside the scroll tracker bounding box is calculated for each valid class.
Valid classes are determined by grouping the classes into two groups and only looking at classes in the same group as the group that
the current class is in. The first group contains: `topLeft`, `topRight`, `bottomLeft` and `bottomRight`. The second group are the
remaining four classes: `leftTop`, `leftBottom`, `rightTop` and `rightBottom`.

The anchor class with the largest visible area is selected as the best anchor class. If no anchor class is strictly better than the others the
value of `anchorclass` is used. If the selected anchor class isn't the current anchor class the `callback` function is called to notify the
application. It's up to the application to make any style changes to match the anchor class.

To remove an anchor tracker use the function returned from this method.

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


### Add Overflow Tracker

```javascript
addOverflowTracker(containerElem: Element, elem: HTMLElement, overflowWidth: boolean, overflowHeight: boolean, callback: OverflowCallback): () => void
```
- **containerElem** An element to track overflow in.

- **elem** An element whose size is compared to `containerElem` to determine overflow.

- **overflowWidth** A flag to indicate if the width can overflow.

- **overflowHeight** A flag to indicate if the height can overflow.

- **callback** A callback function called when `elem` overflows.

Call this method to add an overflow tracker to the manager. The overflow tracker will monitor `containerElem` and
`elem` to see if `elem`'s width and/or height is larger than `containerElem`'s client width and/or height. Width
is checked only if `overflowWidth` is true and height is checked only if `overflowHeight` is true.

If the size of `elem` is overflowing `containerElem` the `callback` function will be called to notify the application of the 
unrestricted size.

If the size stops overflowing, the `callback` function will be called once again to notify the application.

To remove an overflow tracker from the manager use function returned from this method.

```javascript
interface OverflowCallback {
	(overflowed: boolean, width: number, height: number): void;
}
```
- **overflow** A flag to indicate that an overflow has occurred.

- **width** A number representing the full overflow width.

- **height** A number representing the full overflow height.


### Scroll Top / Bottom / Left / Right

```javascript
scrollLeft(key: string, coordOrElemOrSelector: Element | string | number, offset?: number)

scrollTop(key: string, coordOrElemOrSelector: Element | string | number, offset?: number)

scrollRight(key: string, coordOrElemOrSelector: Element | string | number, offset?: number)

scrollBottom(key: string, coordOrElemOrSelector: Element | string | number, offset?: number)
```
- **key** A key used to refer to the scroll tracker.

- **coordOrElemOrSelector** Target to scroll to as a coordinate number, element or selector.

- **offset** An optional offset from det target set by `coordOrElemOrSelector`.

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


### Scroll Into View

```javascript
scrollIntoView(key: string, elemOrSelector: Element | string, offset?: number)
```
- **key** A key used to refer to the scroll tracker.

- **elemOrSelector** Target to scroll into view as an element or selector.

- **offset** An optional offset from det target set by `elemOrSelector`.

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


- - -

> I don't know if it's good, but it's definitely not evil, so I guess it's neutral.
