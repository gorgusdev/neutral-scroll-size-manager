
// Polyfill the matches method on DOM elements.
// Code from https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
if (!Element.prototype.matches) {
	Element.prototype.matches =
		(<any>Element.prototype).matchesSelector ||
		(<any>Element.prototype).mozMatchesSelector ||
		Element.prototype.msMatchesSelector ||
		(<any>Element.prototype).oMatchesSelector ||
		Element.prototype.webkitMatchesSelector ||
		function(s) {
			const matches = (this.document || this.ownerDocument).querySelectorAll(s);
			let i = matches.length;
			while (--i >= 0 && matches.item(i) !== this) {
				// Empty loop body
			}
			return i > -1;
		};
}

// Detect support for passive event listeners.
// Code from Modernizr
let registerEventOptions: boolean|{passive: boolean} = false;
try {
	const opts = Object.defineProperty({}, 'passive', {
		get: function() {
			registerEventOptions = { passive: true };
		}
	});
	(<any>window).addEventListener('dummy', null, opts);
} catch(e) {
	// Catch and ignore any exceptions in detection code.
}

export function registerEventListener(element: any, event: string, callback: (event: Event) => void): () => void {
	if(element.addEventListener) {
		element.addEventListener(event, callback, registerEventOptions);
		return function unregisterEvent() {
			element.removeEventListener(event, callback, registerEventOptions);
		};
	} else if(element.attachEvent) {
		element.attachEvent('on' + event, callback);
		return function unregisterEvent() {
			element.detachEvent('on' + event, callback);
		};
	} else {
		return function() {
			// Dummy unregister function.
		};
	}
}

export function findParentMatchingSelector(element: Element, selector: string): Element | null {
	let parent: HTMLElement | null = <HTMLElement>element;
	if(parent) {
		do {
			if(parent.matches(selector)) {
				return parent;
			}
			parent = parent.parentElement;
		} while(parent != null);
	}

	return null;
}

export function getStyleSheetValue(ruleSelector: string, propName: string): any {
	for(let sheetIdx = 0; sheetIdx < document.styleSheets.length; sheetIdx++) {
		const sheet: CSSStyleSheet = <CSSStyleSheet>document.styleSheets.item(sheetIdx);
		if(sheet) {
			let rules: CSSRuleList;
			if(sheet.cssRules) {
				rules = sheet.cssRules;
			} else {
				rules = sheet.rules;
			}
			for(let ruleIdx = 0; ruleIdx < rules.length; ruleIdx++) {
				const rule: CSSStyleRule = <CSSStyleRule>rules.item(ruleIdx);
				if(rule.selectorText && ((rule.selectorText === ruleSelector) || (rule.selectorText.split(',').indexOf(ruleSelector) >= 0))) {
					return (<any>rule.style)[propName];
				}
			}
		}
	}
	return undefined;
}
