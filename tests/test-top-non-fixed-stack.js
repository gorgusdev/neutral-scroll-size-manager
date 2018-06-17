var manager = new Neutral.ScrollSizeManager();
manager.startResizeTracking();
manager.hideNonFixedWhileScrolling((navigator.userAgent.indexOf('MSIE') >= 0) || (navigator.userAgent.indexOf('Edge') >= 0));
manager.addScrollTracker('ROOT', document.getElementById('scroll-view'), 0, 0, 0, 0);
var firstStack = document.getElementById('first-stack');
manager.addTopStacker('ROOT', document.getElementById('first-container'), firstStack, '', 0, '#first-container', false, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    var className = '';
    if(hidden) {
        className = className + ' hidden';
    }
    if(stacked) {
        className = className + ' stacked';
    }
    firstStack.className = className;
    firstStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var secondStack = document.getElementById('second-stack');
manager.addTopStacker('ROOT', document.getElementById('second-container'), secondStack, '#second-limit', 0, '#second-container', false, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    var className = '';
    if(hidden) {
        className = className + ' hidden';
    }
    if(stacked) {
        className = className + ' stacked';
    }
    secondStack.className = className;
    secondStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var thirdStack = document.getElementById('third-stack');
var thirdCtrl = manager.addTopStacker('ROOT', document.getElementById('third-container'), thirdStack, '', 0, '#third-container', false, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    var className = '';
    if(hidden) {
        className = className + ' hidden';
    }
    if(stacked) {
        className = className + ' stacked';
    }
    thirdStack.className = className;
    thirdStack.setAttribute('data-last-stacked', '' + lastStacked);
});
var fourthStack = document.getElementById('fourth-stack');
var fourthCtrl = manager.addTopStacker('ROOT', document.getElementById('fourth-container'), fourthStack, '', 0, '#fourth-container', false, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    var className = '';
    if(hidden) {
        className = className + ' hidden';
    }
    if(stacked) {
        className = className + ' stacked';
    }
    fourthStack.className = className;
    fourthStack.setAttribute('data-last-stacked', '' + lastStacked);
});

var enabled = true;
var enableDisableButton = document.getElementById('ctrl-enable-disable');
enableDisableButton.addEventListener('click', function() {
    enabled = !enabled;
    if(enabled) {
        thirdCtrl.enable();
    } else {
        thirdCtrl.disable();
    }
});

var add = true;
var addRemoveButton = document.getElementById('ctrl-add-remove');
addRemoveButton.addEventListener('click', function() {
    add = !add;
    if(add) {
        thirdCtrl = manager.addTopStacker('ROOT', document.getElementById('third-container'), thirdStack, '', 0, '#third-container', true, false, function(stacked, offset, useFixed, hidden, lastStacked) {
            if(stacked) {
                thirdStack.className = 'stacked';
            } else {
                thirdStack.className = '';
            }
            thirdStack.setAttribute('data-last-stacked', '' + lastStacked);
        });
    } else {
        thirdCtrl.unregister();
    }
});
