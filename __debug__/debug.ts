import scrollManager from '../src/index';

scrollManager.startResizeTracking();
scrollManager.addScrollTracker('root', window);
var topContainer = document.getElementById('top-container');
var topStack = document.getElementById('top-stack');
scrollManager.addTopStacker('root', topContainer, topStack, '#root', 0, 40, true, false, (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean) => {
	if(stacked) {
		topStack.className = 'stacked';
	} else {
		topStack.className = '';
	}
});
var bitContainer = document.getElementById('bit-container');
var bitStack = document.getElementById('bit-stack');
scrollManager.addTopStacker('root', bitContainer, bitStack, '#bit-limit', 0, 20, true, false, (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean) => {
	if(stacked) {
		bitStack.className = 'stacked';
	} else {
		bitStack.className = '';
	}
});
var midContainer = document.getElementById('mid-container');
var midStack = document.getElementById('mid-stack');
scrollManager.addTopStacker('root', midContainer, midStack, '#root', 0, 30, true, false, (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean) => {
	if(stacked) {
		midStack.className = 'stacked';
	} else {
		midStack.className = '';
	}
});
var botContainer = document.getElementById('bot-container');
var botStack = document.getElementById('bot-stack');
scrollManager.addBottomStacker('root', botContainer, botStack, '#root', 0, 50, true, false, (stacked: boolean, offset: number, useFixed: boolean, hidden: boolean) => {
	if(stacked) {
		botStack.className = 'stacked';
	} else {
		botStack.className = '';
	}
});
var anchorClasses = {
	bottomLeft: 'bottom-left',
	bottomRight: 'bottom-right',
	topLeft: 'top-left',
	topRight: 'top-right',
	leftBottom: 'left-bottom',
	rightBottom: 'right-bottom',
	leftTop: 'left-top',
	rightTop: 'right-top'
};
var anchor = document.getElementById('anchor');
var anchored = document.getElementById('anchored');
scrollManager.addAnchorTracker('root', anchored, anchor, 'top-left', anchorClasses, (anchorClass: string) => {
	anchored.className = anchorClass;
});

var anchor2 = document.getElementById('anchor2');
var anchored2 = document.getElementById('anchored2');
scrollManager.addAnchorTracker('root', anchored2, anchor2, 'bottom-right', anchorClasses, (anchorClass: string) => {
	anchored2.className = anchorClass;
});

scrollManager.addScrollTracker('scroller', document.getElementById('scroller'));
var anchor3 = document.getElementById('anchor3');
var anchored3 = document.getElementById('anchored3');
scrollManager.addAnchorTracker('scroller', anchored3, anchor3, 'bottom-left', anchorClasses, (anchorClass: string) => {
	anchored3.className = anchorClass;
});

var overflowable = document.getElementById('overflowable');
var overflowing = document.getElementById('overflowing');
scrollManager.addOverflowTracker(overflowable, false, true, (overflowed: boolean, width: number, height: number) => {
	if(overflowed) {
		overflowing.className = 'overflowed';
	} else {
		overflowing.className = '';
	}
});
var buttons = document.querySelectorAll('button');
for(var n = 0; n < buttons.length; n++) {
	var button = buttons.item(n);
	button.addEventListener('click', () => {
		if(overflowable.className === 'expanded') {
			overflowable.className = '';
		} else {
			overflowable.className = 'expanded';
		}
	});
}