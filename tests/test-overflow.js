var manager = new Neutral.ScrollSizeManager();
manager.startResizeTracking();
manager.addScrollTracker('ROOT', window, 0, 0, 0, 0);
var container1 = document.getElementById('overflow-container1');
var overflowed1 = document.getElementById('overflow-content1');
manager.addOverflowTracker(container1, overflowed1, false, true, function(overflowing, width, height) {
    if(overflowing) {
        container1.className = 'overflowing';
    } else {
        container1.className = '';
    }
});

var container2 = document.getElementById('overflow-container2');
var overflowed2 = document.getElementById('overflow-content2');
manager.addOverflowTracker(container2, overflowed2, true, false, function(overflowing, width, height) {
    if(overflowing) {
        container2.className = 'overflowing';
    } else {
        container2.className = '';
    }
});

var sidebar1 = document.getElementById('sidebar1');
var sidebar2 = document.getElementById('sidebar2');
var wide = false;
var toggleButton = document.getElementById('toggle-button');
toggleButton.addEventListener('click', function() {
    wide = !wide;
    if(wide) {
        sidebar1.className = 'text-block wide';
        sidebar2.className = 'text-block wide';
    } else {
        sidebar1.className = 'text-block';
        sidebar2.className = 'text-block';
    }
    manager.checkResizeFromStateChange();
});
