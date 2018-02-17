var PoMessages={};
PoMessages.SELF_ID = 'hficppmoghghfokbapbmbjbcenolcpep';
PoMessages.whiteListedApps = PoMessages.whiteListedApps||{
    'ceahklmnbjmcejkmhbdfeeogapacffhi':'1',
    'hficppmoghghfokbapbmbjbcenolcpep':'1'
};
PoMessages.messageListener = function(message,sender,sendResponse){
    if(typeof PoMessages.whiteListedApps[sender.id] === "undefined")
        return;
    if(sender.id === PoMessages.SELF_ID){
        if(message['type']==='getVar' && message['intendedReceiver']===chrome.app.window.current().id)
            sendResponse(window[message['var']]);
    }
};