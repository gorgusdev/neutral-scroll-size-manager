var manager = new Neutral.ScrollSizeManager();
manager.startResizeTracking();
manager.addScrollTracker('ROOT', window, 0, 0, 0, 0);
var firstStack = document.getElementById('first-stack');
manager.addTopStacker('ROOT', document.getElementById('first-container'), firstStack, '', 0, '#first-container', true, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        firstStack.className = 'stacked';
    } else {
        firstStack.className = '';
    }
    firstStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var secondStack = document.getElementById('second-stack');
manager.addTopStacker('ROOT', document.getElementById('second-container'), secondStack, '#second-limit', 0, '#second-container', true, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        secondStack.className = 'stacked';
    } else {
        secondStack.className = '';
    }
    secondStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var thirdStack = document.getElementById('third-stack');
var thirdCtrl = manager.addTopStacker('ROOT', document.getElementById('third-container'), thirdStack, '', 0, '#third-container', true, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        thirdStack.className = 'stacked';
    } else {
        thirdStack.className = '';
    }
    thirdStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var fourthStack = document.getElementById('fourth-stack');
var fourthCtrl = manager.addBottomStacker('ROOT', document.getElementById('fourth-container'), fourthStack, '', 0, '#fourth-container', true, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        fourthStack.className = 'stacked';
    } else {
        fourthStack.className = '';
    }
    fourthStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var fifthStack = document.getElementById('fifth-stack');
var fifthCtrl = manager.addBottomStacker('ROOT', document.getElementById('fifth-container'), fifthStack, '', 0, '#fifth-container', true, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        fifthStack.className = 'stacked';
    } else {
        fifthStack.className = '';
    }
    fifthStack.setAttribute('data-last-stacked', '' + lastStacked);
});

var scrollToTarget1 = document.getElementById('scroll-to-target1');
var scrollTo1 = document.getElementById('scroll-to1');
scrollTo1.addEventListener('click', function() {
    manager.scrollIntoView('ROOT', scrollToTarget1, 15);
});

var scrollToTarget2 = document.getElementById('scroll-to-target2');
var scrollTo2 = document.getElementById('scroll-to2');
scrollTo2.addEventListener('click', function() {
    manager.scrollIntoView('ROOT', scrollToTarget2, 15);
});
