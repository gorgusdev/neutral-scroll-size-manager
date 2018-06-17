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
var fourthCtrl = manager.addTopStacker('ROOT', document.getElementById('fourth-container'), fourthStack, '', 0, '#fourth-container', true, false, function(stacked, offset, useFixed, hidden, lastStacked) {
    if(stacked) {
        fourthStack.className = 'stacked';
    } else {
        fourthStack.className = '';
    }
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
