var manager = new Neutral.ScrollSizeManager();
manager.startResizeTracking();
manager.addScrollTracker('ROOT', window, 0, 0, 0, 0);
var anchored = document.getElementById('anchor-pane');
manager.addAnchorTracker('ROOT', document.getElementById('anchor-container'), anchored, 'top-left', {
    topLeft: 'top-left',
    topRight: 'top-right',
    bottomLeft: 'bottom-left',
    bottomRight: 'bottom-right',
    leftTop: '',
    rightTop: '',
    leftBottom: '',
    rightBottom: ''
}, function(anchorClass) {
    anchored.className = anchorClass;
});
