var manager = new Neutral.ScrollSizeManager();
manager.startResizeTracking();
manager.hideNonFixedWhileScrolling((navigator.userAgent.indexOf('MSIE') >= 0) || (navigator.userAgent.indexOf('Edge') >= 0));
manager.addScrollTracker('ROOT', document.getElementById('scroll-view'), 0, 0, 0, 0);
var firstStack = document.getElementById('first-stack');
manager.addBottomStacker('ROOT', document.getElementById('first-container'), firstStack, '', 0, '#first-container', false, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        firstStack.className = 'stacked';
    } else {
        firstStack.className = '';
    }
    firstStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var secondStack = document.getElementById('second-stack');
manager.addBottomStacker('ROOT', document.getElementById('second-container'), secondStack, '#second-limit', 0, '#second-container', false, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        secondStack.className = 'stacked';
    } else {
        secondStack.className = '';
    }
    secondStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var thirdStack = document.getElementById('third-stack');
manager.addBottomStacker('ROOT', document.getElementById('third-container'), thirdStack, '', 0, '#third-container', false, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        thirdStack.className = 'stacked';
    } else {
        thirdStack.className = '';
    }
    thirdStack.setAttribute('data-last-stacked', '' + lastStacked);
});
