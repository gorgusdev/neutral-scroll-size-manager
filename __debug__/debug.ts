import scrollManager from '../src/index';

scrollManager.startResizeTracking();
scrollManager.addScrollTracker('root', window);
let topContainer = document.getElementById('top-container');
let topStack = document.getElementById('top-stack');
if(topContainer && topStack) {
	scrollManager.addTopStacker('root', topContainer, topStack, '', 0, 40, true, false, (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean) => {
		if(!topStack) {
			return;
		}
		if(stacked) {
			topStack.className = 'stacked';
		} else {
			topStack.className = '';
		}
	});
}
let bitContainer = document.getElementById('bit-container');
let bitStack = document.getElementById('bit-stack');
if(bitContainer && bitStack) {
	scrollManager.addTopStacker('root', bitContainer, bitStack, '#bit-limit', 0, 20, true, false, (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean) => {
		if(!bitStack) {
			return;
		}
		if(stacked) {
			bitStack.className = 'stacked';
		} else {
			bitStack.className = '';
		}
	});
}
let midContainer = document.getElementById('mid-container');
let midStack = document.getElementById('mid-stack');
if(midContainer && midStack) {
	scrollManager.addTopStacker('root', midContainer, midStack, '#root', 0, 30, true, false, (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean) => {
		if(!midStack) {
			return;
		}
		if(stacked) {
			midStack.className = 'stacked';
		} else {
			midStack.className = '';
		}
	});
}
let botContainer = document.getElementById('bot-container');
let botStack = document.getElementById('bot-stack');
if(botContainer && botStack) {
	scrollManager.addBottomStacker('root', botContainer, botStack, '#root', 0, 50, true, false, (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean) => {
		if(!botStack) {
			return;
		}
		if(stacked) {
			botStack.className = 'stacked';
		} else {
			botStack.className = '';
		}
	});
}
let anchorClasses = {
	bottomLeft: 'bottom-left',
	bottomRight: 'bottom-right',
	topLeft: 'top-left',
	topRight: 'top-right',
	leftBottom: 'left-bottom',
	rightBottom: 'right-bottom',
	leftTop: 'left-top',
	rightTop: 'right-top'
};
let anchor = document.getElementById('anchor');
let anchored = document.getElementById('anchored');
if(anchor && anchored) {
	scrollManager.addAnchorTracker('root', anchored, anchor, 'top-left', anchorClasses, (anchorClass: string) => {
		if(!anchored) {
			return;
		}
		anchored.className = anchorClass;
	});
}

let anchor2 = document.getElementById('anchor2');
let anchored2 = document.getElementById('anchored2');
if(anchor2 && anchored2) {
	scrollManager.addAnchorTracker('root', anchored2, anchor2, 'bottom-right', anchorClasses, (anchorClass: string) => {
		if(!anchored2) {
			return;
		}
		anchored2.className = anchorClass;
	});
}

scrollManager.addScrollTracker('scroller', document.getElementById('scroller'));
let anchor3 = document.getElementById('anchor3');
let anchored3 = document.getElementById('anchored3');
if(anchor3 && anchored3) {
	scrollManager.addAnchorTracker('scroller', anchored3, anchor3, 'bottom-left', anchorClasses, (anchorClass: string) => {
		if(!anchored3) {
			return;
		}
		anchored3.className = anchorClass;
	});
}

let overflowable = document.getElementById('overflowable');
let overflowing = document.getElementById('overflowing');
if(overflowable && overflowing) {
	scrollManager.addOverflowTracker(overflowable, overflowing, false, true, (overflowed: boolean, width: number, height: number) => {
		if(!overflowable) {
			return;
		}
		if(overflowed) {
			overflowable.className = 'overflowed';
		} else {
			overflowable.className = '';
		}
	});
}

let buttons = document.querySelectorAll('button');
for(let n = 0; n < buttons.length; n++) {
	let button = buttons.item(n);
	button.addEventListener('click', () => {
		if(!overflowable) {
			return;
		}
		if(overflowable.className === 'expanded') {
			overflowable.className = '';
		} else {
			overflowable.className = 'expanded';
		}
	});
}

let focusOn1Button = document.getElementById('focusOn1Button');
let focusOn3Button = document.getElementById('focusOn3Button');
let focusOn5Button = document.getElementById('focusOn5Button');
let focusOn1 = document.getElementById('focusOn1');
if(focusOn1Button && focusOn1) {
	focusOn1Button.addEventListener('click', () => {
		if(!focusOn1) {
			return;
		}
		scrollManager.scrollTop('root', focusOn1);
	});
}
if(focusOn3Button && focusOn1) {
	focusOn3Button.addEventListener('click', () => {
		if(!focusOn1) {
			return;
		}
		scrollManager.scrollBottom('root', focusOn1);
	});
}
if(focusOn5Button && focusOn1) {
	focusOn5Button.addEventListener('click', () => {
		if(!focusOn1) {
			return;
		}
		scrollManager.scrollIntoView('root', focusOn1, 10);
	});
}

let focusOn2Button = document.getElementById('focusOn2Button');
let focusOn6Button = document.getElementById('focusOn6Button');
let focusOn2 = document.getElementById('focusOn2');
if(focusOn2Button && focusOn2) {
	focusOn2Button.addEventListener('click', () => {
		if(!focusOn2) {
			return;
		}
		scrollManager.scrollTop('scroller', focusOn2);
	});
}
if(focusOn6Button && focusOn2) {
	focusOn6Button.addEventListener('click', () => {
		if(!focusOn2) {
			return;
		}
		scrollManager.scrollIntoView('scroller', focusOn2);
	});
}

let focusOn4Button = document.getElementById('focusOn4Button');
let focusOn3 = document.getElementById('focusOn3');
if(focusOn4Button && focusOn3) {
	focusOn4Button.addEventListener('click', () => {
		if(!focusOn3) {
			return;
		}
		scrollManager.scrollBottom('scroller', focusOn3);
	});
}
