var createBackgroundPageWindow = function(){
  chrome.app.window.create('pomodomore.html', {
    id: "App",
    minWidth: 150,
    minHeight: null,
    alwaysOnTop: true,
    frame: "none"
  });
};
chrome.runtime.onInstalled.addListener(function(data) {
    createBackgroundPageWindow();
});
chrome.app.runtime.onLaunched.addListener(function(data) {
    createBackgroundPageWindow();
});
