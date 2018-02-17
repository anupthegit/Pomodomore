var pomodomore_options=pomodomore_options||{
    work: {
        hours: 0,
        minutes: 25,
        seconds: 0,
        total: 1500
    },
    shortbrk: {
        hours: 0,
        minutes: 5,
        seconds: 0,
        total: 300
    },
    longbrk: {
        hours: 0,
        minutes: 15,
        seconds: 0,
        total: 900
    },
    shortbreaks: 4,
    notificationSound: "glass.wav",
    notificationVolume: 1,
    previousVolume: 1,
    muted: undefined,
    themeColor: {
        "STOPPED": "teal",
        "SHORT_BREAK": "light-green",
        "LONG_BREAK": "green",
        "WORK": "indigo"
    },
    minimal: undefined
};
var pomodomore_task_list=new TaskList();
var string_load_config=string_load_config||{
    title:{
        "#settingsPomodoro": "settingstext",
        "#startPomodoro": "starttimertext",
        "#refreshPomodoro": "stoptimertext",
        "#pausePomodoro": "pausetimertext",
        "#minimizePomodoro": "minimizebuttontext",
        "#mutePomodoro": "mutebuttontext",
        "#unmutePomodoro": "unmutebuttontext",
        "#minimalPomodoro": "tinymodebuttontext",
        "#closePomodoro": "closebuttontext",
        "#show-duration-settings": "durationsettingstext",
        "#show-appearance-settings": "themesettingstext",
        "#show-audio-settings": "audiosettingstext",
        "#shortbreaks": "shortbreakstooltip",
        "input[id$='hours']": "timeunithours",
        "input[id$='minutes']": "timeunitminutes",
        "input[id$='seconds']": "timeunitseconds",
        "#factoryReset": "factoryresetbuttontext",
        "#exitSettings": "homebuttontext"
    },
    html:{
        "#durationSettingsHeading": "durationsettingstext",
        "#themeSettingsHeading": "themesettingstext",
        "#audioSettingsHeading": "audiosettingstext",
        "#pomodoroDurationLabel": "pomodorodurationlabel",
        "#shortBreakDurationLabel": "shortbreakdurationlabel",
        "#longBreakDurationLabel": "longbreakdurationlabel",
        "#numShortBreaksLabel": "shortbreakslabel",
        "#themeColorLabel": "themecolorlabel",
        "#notificationSoundLabel": "notificationsoundlabel",
        "#notificationVolumeLabel": "notificationvolumelabel"
    },
    sounds:{
        "Chaotic": "sounddisplaynamechaotic",
        "Clink": "sounddisplaynameclink",
        "Clock Tower": "sounddisplaynameclocktower",
        "Fun!!": "sounddisplaynamefun",
        "Gutsy": "sounddisplaynamegutsy",
        "Happy :)": "sounddisplaynamehappy",
        "Katana Bell": "sounddisplaynamekatanabell",
        "Meadow": "sounddisplaynamemeadow",
        "Mystery": "sounddisplaynamemystery",
        "River": "sounddisplaynameriver"
    },
    messages:{
        WORK: {
            title: "worknotificationtitle",
            messageContent: "worknotificationmessage"
        },
        SHORT_BREAK: {
            title: "shortbreaknotificationtitle",
            messageContent: "shortbreaknotificationmessage"
        },
        LONG_BREAK: {
            title: "longbreaknotificationtitle",
            messageContent: "longbreaknotificationmessage"
        }
    }
};
var pomodomore_sounds=pomodomore_sounds||{
    "Chaotic": "chaotic.mp3",
    "Clink": "glass.wav",
    "Clock Tower": "clock_tower.mp3",
    "Fun!!": "funn.mp3",
    "Gutsy": "gutsy.mp3",
    "Happy :)": "happie.mp3",
    "Katana Bell": "katanabell.mp3",
    "Meadow": "meadow.mp3",
    "Mystery": "mystery.mp3",
    "River": "river.mp3"
};
var pomodomore_colors=pomodomore_colors||{
    "Red":"red",
    "Pink":"pink",
    "Purple":"purple",
    "Deep purple":"deep-purple",
    "Indigo":"indigo",
    "Blue":"blue",
    "Light blue":"light-blue",
    "Cyan":"cyan",
    "Teal":"teal",
    "Green":"green",
    "Light green":"light-green",
    "Lime":"lime",
    "Yellow":"yellow",
    "Amber":"amber",
    "Orange":"orange",
    "Deep orange":"deep-orange",
    "Brown":"brown",
    "Blue grey":"blue-grey",
    "Grey":"grey",
    "Black":"black",
    "White":"white"
};
var pomodomore_globals=pomodomore_globals||{
    states: {
        STOPPED: "STOPPED",
        WORK: "WORK",
        SHORT_BREAK: "SHORT_BREAK",
        LONG_BREAK: "LONG_BREAK",
        PAUSED: "PAUSED"
    },
    messages: {
        WORK: {
            title: "Pomodoro session",
            messageContent: "Get started!!"
        },
        SHORT_BREAK: {
            title: "Short break",
            messageContent: "Good going. Time to relax, but be back soon!"
        },
        LONG_BREAK: {
            title: "Long break",
            messageContent: "Great work! Viola!! Now time for a long break!"
        }
    }
};
//var undefinedTask=new Task();
var pomodomore_state=pomodomore_state||{
    remaining: 0,
    elapsed: 0,
    totalTime: 0,
    timeoutObject: undefined,
    shortBreaksCount: 0,
    state: pomodomore_globals.states.STOPPED,
    oldState: undefined,
    currentTask: undefined
};
var pomodomore_stats=pomodomore_stats||{
};
var pomodomore_tasks=pomodomore_tasks||{
};
var validValues=true;
var durationsChanged=false;
var validationRules=validationRules||{
    "hours":function(data,id){
        return Pomodomore.commonValidator(data,0,99,id);
    },
    "minutes":function(data,id){
        return Pomodomore.commonValidator(data,0,59,id);
    },
    "seconds":function(data,id){
        return Pomodomore.commonValidator(data,0,59,id);
    },
    "total":function(data,id){
        return Pomodomore.commonValidator(data,1,Number.MAX_SAFE_INTEGER,id);
    }
};
var notifyAudio;
var backup_pomodomore_state,
    backup_pomodomore_options,
    previous_pomodomore_options;
var factoryReset = false;
var Pomodomore = {
    transitionHelper : function(){
        if(pomodomore_state.state===pomodomore_globals.states.STOPPED||pomodomore_state.state===pomodomore_globals.states.LONG_BREAK || pomodomore_state.state===pomodomore_globals.states.SHORT_BREAK){
            if(pomodomore_state.timeoutObject)
                clearTimeout(pomodomore_state.timeoutObject);
            var oldColor = pomodomore_options.themeColor[pomodomore_state.state];
            var color = pomodomore_options.themeColor[pomodomore_globals.states.WORK];
            Pomodomore.applyCurrentTheme(oldColor, color);
            pomodomore_state.state=pomodomore_globals.states.WORK;
            Pomodomore.notifyTransition();
            if(pomodomore_state.remaining===0)
            	Pomodomore.initializeTimerState(pomodomore_options.work);
        }else if(pomodomore_state.state===pomodomore_globals.states.WORK){
            pomodomore_state.shortBreaksCount=(pomodomore_state.shortBreaksCount+1)%(pomodomore_options.shortbreaks+1);
            if(pomodomore_state.shortBreaksCount===0){
                clearTimeout(pomodomore_state.timeoutObject);
                var oldColor = pomodomore_options.themeColor[pomodomore_state.state];
                var color = pomodomore_options.themeColor[pomodomore_globals.states.LONG_BREAK];
                Pomodomore.applyCurrentTheme(oldColor, color);
                pomodomore_state.state=pomodomore_globals.states.LONG_BREAK;
                Pomodomore.notifyTransition();
                if(pomodomore_state.remaining===0)
                	Pomodomore.initializeTimerState(pomodomore_options.longbrk);
            }else{
                clearTimeout(pomodomore_state.timeoutObject);
                var oldColor = pomodomore_options.themeColor[pomodomore_state.state];
                var color = pomodomore_options.themeColor[pomodomore_globals.states.SHORT_BREAK];
                Pomodomore.applyCurrentTheme(oldColor, color);
                pomodomore_state.state=pomodomore_globals.states.SHORT_BREAK;
                Pomodomore.notifyTransition();
                if(pomodomore_state.remaining===0)
                	Pomodomore.initializeTimerState(pomodomore_options.shortbrk);           
            }
        }else if(pomodomore_state.state===pomodomore_globals.states.PAUSED){
        	pomodomore_state.state=pomodomore_state.oldState;
        }
    },
    incrementHelper : function(){
        if(arguments.length===0)
            return;
        var args = Array.prototype.slice.call(arguments);
        var id=args[0];
        args.shift();
        var modulus=args[0];
        args.shift();
        var timeUnit = parseInt($("#"+id).text());
        timeUnit=(modulus+timeUnit-1)%modulus;
        if(timeUnit===(modulus-1)){
            Pomodomore.incrementHelper.apply(this,args);
        }
        $("#"+id).text(Pomodomore.getTimeUnitDisplay(timeUnit));
    },
    getTimeUnitDisplay : function(timeUnit){
        timeUnit = timeUnit + "";
        pad = "00";
        return pad.substring(0,pad.length-timeUnit.length)+timeUnit;
    },
    runTimer : function(){    
        if(pomodomore_state.state===pomodomore_globals.states.STOPPED)
            return;
        if(pomodomore_state.remaining===0){
            Pomodomore.transitionHelper();
        }
        Pomodomore.incrementHelper("seconds",60,"minutes",60,"hours",24);
        $("#progress").progressbar("value",100*pomodomore_state.elapsed/pomodomore_state.totalTime);
        pomodomore_state.remaining--;
        pomodomore_state.elapsed=parseInt((new Date()-pomodomore_state.startTime)/1000);
        clearTimeout(pomodomore_state.timeoutObject);
        pomodomore_state.timeoutObject = setTimeout(Pomodomore.runTimer, 1000);
    },
    notifyTransition: function(){
        chrome.notifications.create("pomodomoreNotification",{
            type: "basic",
            iconUrl: "icon.png",
            title: pomodomore_globals.messages[pomodomore_state.state].title,
            message: pomodomore_globals.messages[pomodomore_state.state].messageContent
        });
        notifyAudio.play();
        setTimeout(function(){chrome.notifications.clear("pomodomoreNotification");},3000);
    },
    applyCurrentTheme: function(oldColor, color){
        $("body").hide();
        $("body, a, i, select, input").removeClass(oldColor);
        $("body, a, i, select, input").addClass(color);
        $("body").show();
    },
    initializeTimerState: function(pomtime){
        pomodomore_state.totalTime=pomtime.total;
        pomodomore_state.remaining=pomtime.total;
        pomodomore_state.startTime=new Date();
        pomodomore_state.elapsed=0;
        $("#hours").text(Pomodomore.getTimeUnitDisplay(pomtime.hours));
        $("#minutes").text(Pomodomore.getTimeUnitDisplay(pomtime.minutes));
        $("#seconds").text(Pomodomore.getTimeUnitDisplay(pomtime.seconds));
    },
    initializeProgress: function(){
        $("#progress").show();
        $("#progress").progressbar("value",0);
    },
    initializeTimer : function(pomtime){
        Pomodomore.runTimer("seconds",60,"minutes",60,"hours",24);
    },
    getTotalTime : function(hours, minutes, seconds){
        return seconds + 60*minutes + 3600*hours;
    },
    commonValidator: function(data, lBound, hBound, id){
        if(data===""){
            $("#"+id).val("0");
            return 0;
        }
        var dInt = parseInt(data);   
        var splitId=id.split("_");
        if(typeof splitId[1]==="undefined"){
            if(id==="shortbreaks")
                original=pomodomore_options[id];
            else
                original=pomodomore_options[id]["total"];
        }else{
            original=pomodomore_options[splitId[0]][splitId[1]];
        }
        if(Number.isNaN(dInt)||dInt!=data||dInt>hBound||dInt<lBound){
            if(typeof splitId[1]==="undefined"){
                $("input[id*='"+id+"']").addClass("invalid");
            }else{
                $("#"+id).addClass("invalid");
            }
            validValues=false;
            $("#show-appearance-settings").addClass("w3-disabled");
            $("#show-audio-settings").addClass("w3-disabled");
            $("#exitSettings").addClass("w3-disabled");
            return original;
        }
        else{
            $("#"+id).removeClass("invalid");
            if(dInt!==original)
                durationsChanged=true;
            return dInt;
        }
    },
    validateAndParse:  function(id){
        var $selector=$("#"+id);
        if(id==="shortbreaks")
            return Pomodomore.commonValidator($selector.val(),0,99,"shortbreaks");
        var splitId=id.split("_");
        var idType=splitId[0];
        var idTimeUnit=splitId[1];
        if(idTimeUnit==="total"){
            var total=Pomodomore.getTotalTime(pomodomore_options[idType]["hours"],
                                            pomodomore_options[idType]["minutes"],
                                            pomodomore_options[idType]["seconds"]);
            return validationRules["total"](total,idType);
        }
        return validationRules[idTimeUnit]($selector.val(),id);        
    },
    saveDurationSettings: function(){
        pomodomore_options.work.hours = Pomodomore.validateAndParse("work_hours");
        pomodomore_options.work.minutes = Pomodomore.validateAndParse("work_minutes");
        pomodomore_options.work.seconds = Pomodomore.validateAndParse("work_seconds");
        pomodomore_options.work.total = Pomodomore.validateAndParse("work_total");
        pomodomore_options.shortbrk.hours = Pomodomore.validateAndParse("shortbrk_hours");
        pomodomore_options.shortbrk.minutes = Pomodomore.validateAndParse("shortbrk_minutes");
        pomodomore_options.shortbrk.seconds = Pomodomore.validateAndParse("shortbrk_seconds");
        pomodomore_options.shortbrk.total = Pomodomore.validateAndParse("shortbrk_total");
        pomodomore_options.longbrk.hours = Pomodomore.validateAndParse("longbrk_hours");
        pomodomore_options.longbrk.minutes = Pomodomore.validateAndParse("longbrk_minutes");
        pomodomore_options.longbrk.seconds = Pomodomore.validateAndParse("longbrk_seconds");
        pomodomore_options.longbrk.total = Pomodomore.validateAndParse("longbrk_total");
        pomodomore_options.shortbreaks = Pomodomore.validateAndParse("shortbreaks");
        return validValues;
    },
    saveThemeSettings: function(){
        var oldColor;
        if(pomodomore_state.state!==pomodomore_globals.states.PAUSED)
            oldColor = pomodomore_options.themeColor[pomodomore_state.state];
        else
            oldColor = pomodomore_options.themeColor[pomodomore_state.oldState];
        if(oldColor)
            $("body, a, i, select, input").removeClass(oldColor);
        $.each(Object.keys(pomodomore_options.themeColor),function(index, key){
            pomodomore_options.themeColor[key] = $("#" + key.toLowerCase() + "_color").find(":selected").attr("val");
        });
        var color;
        if(pomodomore_state.state!==pomodomore_globals.states.PAUSED)
            color = pomodomore_options.themeColor[pomodomore_state.state];
        else
            color = pomodomore_options.themeColor[pomodomore_state.oldState];
        $("body, a, i, select, input").addClass(color);
    },
    saveAudioSettings: function(){
        pomodomore_options.notificationSound = $("#notification_options").find(":selected").attr("val");
        pomodomore_options.notificationVolume = parseFloat($("#volume").val());
        notifyAudio = new Audio(pomodomore_options.notificationSound);
        notifyAudio.volume = pomodomore_options.notificationVolume;
    },
    saveSettings: function(){
        notifyAudio.pause();
        notifyAudio.currentTime=0;
        validValues=true;
        if(!Pomodomore.saveDurationSettings()){
            var oldColor;
            if(pomodomore_state.state!==pomodomore_globals.states.PAUSED)
                oldColor = pomodomore_options.themeColor[pomodomore_state.state];
            else
                oldColor = pomodomore_options.themeColor[pomodomore_state.oldState];
            if(oldColor)
                $("body, a, i, select, input").removeClass(oldColor);
            $("body").hide();
            $("body, a, i, select, input").addClass("grey-l4");
            $("body").show();
            return;
        }else{
            $("body").hide();
            var color;
            if(pomodomore_state.state!==pomodomore_globals.states.PAUSED)
                color = pomodomore_options.themeColor[pomodomore_state.state];
            else
                color = pomodomore_options.themeColor[pomodomore_state.oldState];
            $("body, a, i, select, input").addClass(color);
            $("body").show(); 
            $("#show-appearance-settings").removeClass("w3-disabled");
            $("#show-audio-settings").removeClass("w3-disabled");
            $("#exitSettings").removeClass("w3-disabled");           
        }
        if(durationsChanged){
            $("#refreshPomodoro").click();        
        }
        Pomodomore.saveThemeSettings();
        Pomodomore.saveAudioSettings();
        chrome.storage.sync.set({"options":pomodomore_options}, function(){
            chrome.notifications.create("pomodomoreNotification",{
                type: "basic",
                iconUrl: "icon.png",
                title: "Saved",
                message: "Your settings have been successfuly saved"
            });
            notifyAudio.play();
            setTimeout(function(){chrome.notifications.clear("pomodomoreNotification");},3000);
        });
    },
    populateDurationSettings: function(){
        $("#work_hours").val(pomodomore_options.work.hours);
        $("#work_minutes").val(pomodomore_options.work.minutes);
        $("#work_seconds").val(pomodomore_options.work.seconds);
        $("#shortbrk_hours").val(pomodomore_options.shortbrk.hours);
        $("#shortbrk_minutes").val(pomodomore_options.shortbrk.minutes);
        $("#shortbrk_seconds").val(pomodomore_options.shortbrk.seconds);
        $("#longbrk_hours").val(pomodomore_options.longbrk.hours);
        $("#longbrk_minutes").val(pomodomore_options.longbrk.minutes);
        $("#longbrk_seconds").val(pomodomore_options.longbrk.seconds);
        $("#shortbreaks").val(pomodomore_options.shortbreaks);
    },
    populateThemeSettings: function(){
        var prevColor;
        if(pomodomore_state.state!==pomodomore_globals.states.PAUSED){
            if(previous_pomodomore_options)
                prevColor = previous_pomodomore_options.themeColor[pomodomore_state.state];
        }else{
            if(previous_pomodomore_options)
                prevColor = previous_pomodomore_options.themeColor[pomodomore_state.oldState];
        }
        $.each(Object.keys(pomodomore_options.themeColor),function(index, key){
          $("#" + key.toLowerCase()+"_color").find("option[val='"+pomodomore_options.themeColor[key]+"']").attr("selected","selected");
        });
        $("body").hide();
        if(previous_pomodomore_options)
            $("body, a, i, select, input").removeClass(prevColor);
        $("body, a, i, select, input").addClass(pomodomore_options.themeColor[pomodomore_state.state]);
        $("body").show(); 
    },
    populateAudioSettings: function(){
        $("#notification_options").find("option[val='"+pomodomore_options.notificationSound+"']").attr("selected","selected");
        $("#volume-slider").slider("value",pomodomore_options.notificationVolume);
        $("#volume").val(pomodomore_options.notificationVolume);
        notifyAudio = new Audio(pomodomore_options.notificationSound);
        notifyAudio.volume = pomodomore_options.notificationVolume;
    },
    populateSettings: function(){ 
        chrome.storage.sync.get("options",function(items){
            if(items && items["options"]){
                var old_options = previous_pomodomore_options || pomodomore_options;
                pomodomore_options = items["options"];
                if(!Pomodomore.deepCompare(old_options.work,pomodomore_options.work)
                    || !Pomodomore.deepCompare(old_options.shortbrk,pomodomore_options.shortbrk)
                    || !Pomodomore.deepCompare(old_options.longbrk,pomodomore_options.longbrk)
                    || old_options.shortbreaks!==pomodomore_options.shortbreaks
                    || factoryReset){
                    Pomodomore.initializeTimerState(pomodomore_options.work);
                    $("#refreshPomodoro").click();
                    factoryReset = false;
                }
            }
            Pomodomore.populateDurationSettings();
            Pomodomore.populateThemeSettings();
            Pomodomore.populateAudioSettings();
        });
    },
    initializeStrings: function(callback){
        $.each(Object.keys(string_load_config['title']),function(index, key){
            $(key).attr("title",chrome.i18n.getMessage(string_load_config['title'][key]));
        });
        $.each(Object.keys(string_load_config['html']),function(index, key){
            $(key).html(chrome.i18n.getMessage(string_load_config['html'][key]));
        });
        $.each(Object.keys(string_load_config['sounds']),function(index, key){
            var displayName = chrome.i18n.getMessage(string_load_config['sounds'][key]);
            pomodomore_sounds[displayName]=pomodomore_sounds[key];
            if(displayName!==key)
                delete pomodomore_sounds[key];
            var option='<option val="'+pomodomore_sounds[displayName]+'">'+displayName+'</option>';
            $("#notification_options").append(option);
        });
        $.each(Object.keys(string_load_config['messages']),function(index, key){
            pomodomore_globals['messages'][key]['title'] = chrome.i18n.getMessage(string_load_config['messages'][key]['title']);
            pomodomore_globals['messages'][key]['messageContent'] = chrome.i18n.getMessage(string_load_config['messages'][key]['messageContent']);
        });
    },
    initializePomodoro: function(){
        $("#progress").progressbar();
        Pomodomore.initializeTimerState(pomodomore_options.work);
        $("body").hide();
        var color;
        if(pomodomore_state.state!==pomodomore_globals.states.PAUSED)
            color = pomodomore_options.themeColor[pomodomore_state.state];
        else
            color = pomodomore_options.themeColor[pomodomore_state.oldState];
        $("body, a, i, select, input").addClass(color);
        $("body").show();
        Pomodomore.populateThemeSettings();
        Pomodomore.initializeStrings();
        notifyAudio = new Audio(pomodomore_options.notificationSound);
        notifyAudio.volume = pomodomore_options.notificationVolume;
        if(pomodomore_options.muted){
            $("#mutePomodoro").parent().hide();
            $("#unmutePomodoro").parent().show();
        }
        pomodomore_options.minimal=!pomodomore_options.minimal;
        $("#minimalPomodoro").click();
        chrome.app.window.current().innerBounds.setPosition(screen.availWidth-180,screen.availHeight-130);
    },
    deepCompare: function(obj1, obj2){
        var keys1=Object.keys(obj1);
        var keys2=Object.keys(obj2);
        if(keys1.length!==keys2.length)
            return false;
        for(i=0;i<keys1.length;i++){
            var key=keys1[i];
            var type1=typeof obj1[key];
            var type2=typeof obj2[key];
            if(type1!==type2)
                return false;
            else if(type1!=="object"){
                if(obj1[key]!==obj2[key])
                    return false;
            }else{
                if(Pomodomore.deepCompare(obj1[key],obj2[key])===false)
                    return false;
            }
        }
        return true;
    }
};
$(document).ready(
    function(){
        backup_pomodomore_state = $.extend({},pomodomore_state);
        chrome.storage.sync.get("options",function(items){
            backup_pomodomore_options = $.extend({},pomodomore_options);
            if(items && items["options"]){
                var opts = items["options"];
                $.each(Object.keys(opts),function(index, key){
                    pomodomore_options[key] = opts[key];
                });
            }
            Pomodomore.initializePomodoro();
            $.each(Object.keys(pomodomore_colors),function(index,object){
                var option='<option val="'+pomodomore_colors[object]+'" class="'+pomodomore_colors[object]+'">'+object+'</option>';
                $(".colorDropdown").append(option);
            });
        });
        $("#startPomodoro").click(function(){
            if(pomodomore_state.state===pomodomore_globals.states.STOPPED || pomodomore_state.state===pomodomore_globals.states.PAUSED){
                $("#startPomodoro").parent().hide();
                $("#pausePomodoro").parent().show();
                Pomodomore.initializeProgress();
                Pomodomore.transitionHelper();
                Pomodomore.initializeTimer();
            }
        });
        $("#pausePomodoro").click(function(){
            $("#pausePomodoro").parent().hide();
            $("#startPomodoro").parent().show();
            pomodomore_state.oldState=pomodomore_state.state;
            pomodomore_state.state=pomodomore_globals.states.PAUSED;
            clearTimeout(pomodomore_state.timeoutObject);
        });
        $("#minimizePomodoro").click(function(){
            chrome.app.window.current().minimize();
        });
        $("#closePomodoro").click(function(){
            chrome.app.window.current().close();
        });
        $("#refreshPomodoro").click(function(){
            var oldColor = pomodomore_options.themeColor[pomodomore_state.state];
            var color = pomodomore_options.themeColor[pomodomore_globals.states.STOPPED];
            Pomodomore.applyCurrentTheme(oldColor, color);
            pomodomore_state.state=pomodomore_globals.states.STOPPED;
            $("#pausePomodoro").parent().hide();
            $("#startPomodoro").parent().show();
            pomodomore_state = $.extend({}, backup_pomodomore_state);
            Pomodomore.initializeTimerState(pomodomore_options.work);
            $("#progress").hide();
        });
        $("#settingsPomodoro").click(function(){
            $("#pomodoro-timer").hide();
            chrome.app.window.current().innerBounds.setMinimumSize(480,260);
            chrome.app.window.current().innerBounds.setSize(480,260);
            var left=chrome.app.window.current().innerBounds.left;
            var top=chrome.app.window.current().innerBounds.top;
            if(left+480>screen.availWidth){
                left=screen.availWidth-480;
                chrome.app.window.current().innerBounds.setPosition(left,top);
            }
            if(top+260>screen.availHeight)
                chrome.app.window.current().innerBounds.setPosition(left,screen.availHeight-260);
            Pomodomore.populateSettings();
            $("#settings").show();
            //chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
              // Use the token.
            //});   
        });
        $("#exitSettings").click(function(){
            if($("#exitSettings").hasClass("w3-disabled"))
                return;
            $("#settings").hide();
            var left=chrome.app.window.current().innerBounds.left;
            var top=chrome.app.window.current().innerBounds.top;
            if(left+480===screen.availWidth)
                left=left+300;
            if(top+260===screen.availHeight)
                top=top+130;
            chrome.app.window.current().innerBounds.setPosition(left,top);
            chrome.app.window.current().innerBounds.setMinimumSize(180,130);
            chrome.app.window.current().innerBounds.setSize(180,130);
            chrome.storage.sync.get("options",function(items){
                if(items && items["options"]){
                    var old_options = pomodomore_options;
                    pomodomore_options = items["options"];
                    if(!Pomodomore.deepCompare(old_options.work,pomodomore_options.work)
                        || !Pomodomore.deepCompare(old_options.shortbrk,pomodomore_options.shortbrk)
                        || !Pomodomore.deepCompare(old_options.longbrk,pomodomore_options.longbrk)
                        || old_options.shortbreaks!==pomodomore_options.shortbreaks){
                        Pomodomore.initializeTimerState(pomodomore_options.work);
                    }
                }
            });
            notifyAudio.pause();
            notifyAudio.currentTime=0;
            $("#pomodoro-timer").show();
        });
        $("#factoryReset").click(function(){
            previous_pomodomore_options=$.extend({},pomodomore_options);
            pomodomore_options=$.extend({},backup_pomodomore_options);
            chrome.storage.sync.set({"options":pomodomore_options}, function(){
                chrome.notifications.create("pomodomoreNotification",{
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "Saved",
                    message: "Restored factory settings"
                });
                chrome.storage.sync.get("options",function(items){
                    if(items && items["options"]){
                        pomodomore_options = items["options"];
                    }
                    factoryReset = true;
                    Pomodomore.populateSettings();
                    $("#show-appearance-settings").removeClass("w3-disabled");
                    $("#show-audio-settings").removeClass("w3-disabled");
                    $("#exitSettings").removeClass("w3-disabled"); 
                    $("input").removeClass("invalid");
                    notifyAudio = new Audio(pomodomore_options.notificationSound);
                    notifyAudio.volume = pomodomore_options.notificationVolume;
                    notifyAudio.play();
                    setTimeout(function(){chrome.notifications.clear("pomodomoreNotification");},3000);
                    $("#unmutePomodoro").parent().hide();
                    $("#mutePomodoro").parent().show();
                });
            });
        });
        $("#show-duration-settings").click(function(){
            $("#settings > div").hide();
            notifyAudio.pause();
            notifyAudio.currentTime=0;
            $("#duration-settings").show();
        });
        $("#show-appearance-settings").click(function(){
            if($("#show-appearance-settings").hasClass("w3-disabled"))
                return;
            $("#settings > div").hide();
            notifyAudio.pause();
            notifyAudio.currentTime=0;
            $("#appearance-settings").show();
        });
        $("#show-audio-settings").click(function(){
            if($("#show-audio-settings").hasClass("w3-disabled"))
                return;
            $("#settings > div").hide();
            $("#audio-settings").show();
        });
        $("#volume-slider").slider({
            range: "min",
            max: 1,
            step: 0.01,
            value: pomodomore_options.notificationVolume,
            change: function(event, ui){
                $("#volume").val(ui.value);
                if(pomodomore_options.notificationVolume!==parseFloat($("#volume").val())){
                    $("#volume").change();
                    if(pomodomore_options.muted && parseFloat($("#volume").val())>0){
                        $("#unmutePomodoro").parent().hide();
                        $("#mutePomodoro").parent().show();              
                    }
                    if(!pomodomore_options.muted && $("#volume").val()==='0'){
                        pomodomore_options.previousVolume = 1;
                        pomodomore_options.muted = true;
                        $("#unmutePomodoro").parent().show();
                        $("#mutePomodoro").parent().hide();
                    }
                }
            }
        });
        $("#settings").on("change", "input, select", function(){
            Pomodomore.saveSettings();
        });
        $("#mutePomodoro").click(function(){
            pomodomore_options.previousVolume = pomodomore_options.notificationVolume;
            pomodomore_options.notificationVolume = 0;
            pomodomore_options.muted = true;
            chrome.storage.sync.set({"options":pomodomore_options},function(){
                chrome.notifications.create("pomodomoreNotification",{
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "Muted",
                    message: "Notifications have been muted"
                });
                setTimeout(function(){chrome.notifications.clear("pomodomoreNotification");},3000);
                Pomodomore.populateAudioSettings();
                $("#mutePomodoro").parent().hide();
                $("#unmutePomodoro").parent().show();
            });
        });
        $("#unmutePomodoro").click(function(){
            pomodomore_options.notificationVolume = pomodomore_options.previousVolume;
            pomodomore_options.muted = false;
            chrome.storage.sync.set({"options":pomodomore_options},function(){
                chrome.notifications.create("pomodomoreNotification",{
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "Unmuted",
                    message: "Notifications have been unmuted"
                });
                Pomodomore.populateAudioSettings();
                notifyAudio.play();
                setTimeout(function(){chrome.notifications.clear("pomodomoreNotification");},3000);
                $("#unmutePomodoro").parent().hide();
                $("#mutePomodoro").parent().show();
            });
        });
        $("#minimalPomodoro").click(function(){
            if(!pomodomore_options.minimal){
                $("#buttons").hide();
                $("#header").hide();
                $("#settings").hide();
                $("#pomodoro-timer").show();
                if(pomodomore_state.state===pomodomore_globals.states.PAUSED 
                    || pomodomore_state.state===pomodomore_globals.states.STOPPED){
                    $("#minimalPausePomodoro").parent().hide();
                    $("#minimalStartPomodoro").parent().show();
                }else{
                    $("#minimalStartPomodoro").parent().hide();
                    $("#minimalPausePomodoro").parent().show();
                }
                $("#minimalRefreshPomodoro").parent().show();
                $(".timer").addClass("timersmall");
                pomodomore_options.minimal = true;
                var minWidth = 180;
                if($("#hours").text()==="00"){
                    $('#hours').hide();
                    $('.middle > :nth-child(2).timer').hide();
                    minWidth = minWidth - 42;
                }
                chrome.app.window.current().innerBounds.setMinimumSize(minWidth,30);
                chrome.app.window.current().innerBounds.setSize(minWidth,30);
                chrome.storage.sync.set({"options":pomodomore_options});
            }else{
                $("#buttons").show();
                $("#header").show();
                $("#settings").hide();
                $("#pomodoro-timer").show();                
                if(pomodomore_state.state===pomodomore_globals.states.PAUSED 
                    || pomodomore_state.state===pomodomore_globals.states.STOPPED){
                    $("#pausePomodoro").parent().hide();
                    $("#startPomodoro").parent().show();
                }else{
                    $("#startPomodoro").parent().hide();
                    $("#pausePomodoro").parent().show();
                }
                $('.timer').show();
                $("#minimalStartPomodoro").parent().hide();
                $("#minimalPausePomodoro").parent().hide();
                $("#minimalRefreshPomodoro").parent().hide();
                $(".timer").removeClass("timersmall");
                pomodomore_options.minimal = false;
                var left=chrome.app.window.current().innerBounds.left;
                var top=chrome.app.window.current().innerBounds.top;
                if(left+180>screen.availWidth)
                    left=screen.availWidth-180;
                if(top+130>screen.availHeight)
                    top=screen.availHeight-130;
                chrome.app.window.current().innerBounds.setPosition(left,top);
                chrome.app.window.current().innerBounds.setMinimumSize(180,130);
                chrome.app.window.current().innerBounds.setSize(180,130);
                chrome.storage.sync.set({"options":pomodomore_options});
            }
        });
        $("body").keydown(function(event){
            if(event.which===77)
                $("#minimalPomodoro").click();
            else if(event.which===80){
                if(pomodomore_options.minimal){
                    if(pomodomore_state.state===pomodomore_globals.states.STOPPED
                        ||pomodomore_state.state===pomodomore_globals.states.PAUSED)
                        $("#minimalStartPomodoro").click();
                    else
                        $("#minimalPausePomodoro").click();
                }
                else{
                    if(pomodomore_state.state===pomodomore_globals.states.STOPPED
                        ||pomodomore_state.state===pomodomore_globals.states.PAUSED)
                        $("#startPomodoro").click();
                    else
                        $("#pausePomodoro").click();
                }
            }else if(event.which===83){
                if(pomodomore_options.minimal)
                    $("#minimalRefreshPomodoro").click();
                else
                    $("#refreshPomodoro").click();
            }
        });
        $("#minimalStartPomodoro").click(function(){
            if(pomodomore_state.state===pomodomore_globals.states.STOPPED || pomodomore_state.state===pomodomore_globals.states.PAUSED){
                $("#minimalStartPomodoro").parent().hide();
                $("#minimalPausePomodoro").parent().show();
                Pomodomore.initializeProgress();
                Pomodomore.transitionHelper();
                Pomodomore.initializeTimer();
            }
        });
        $("#minimalPausePomodoro").click(function(){
            $("#minimalPausePomodoro").parent().hide();
            $("#minimalStartPomodoro").parent().show();
            pomodomore_state.oldState=pomodomore_state.state;
            pomodomore_state.state=pomodomore_globals.states.PAUSED;
            clearTimeout(pomodomore_state.timeoutObject);
        });
        $("#minimalRefreshPomodoro").click(function(){
            var oldColor = pomodomore_options.themeColor[pomodomore_state.state];
            var color = pomodomore_options.themeColor[pomodomore_globals.states.STOPPED];
            Pomodomore.applyCurrentTheme(oldColor, color);
            pomodomore_state.state=pomodomore_globals.states.STOPPED;
            $("#minimalPausePomodoro").parent().hide();
            $("#minimalStartPomodoro").parent().show();
            pomodomore_state = $.extend({}, backup_pomodomore_state);
            Pomodomore.initializeTimerState(pomodomore_options.work);
            $("#progress").hide();
        });
        $("#tasksPomodoro").click(function(){
            chrome.app.window.create('tasks.html', {
                id: "TaskWindow",
                minWidth: 720,
                minHeight: 450,
                alwaysOnTop: true
            });
        });
    }
);