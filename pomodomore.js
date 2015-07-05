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
    shortbrks: 4,
    notificationSound: "glass.wav",
    notificationVolume: 1,
    themeColor: "teal"
};
var pomodomore_sounds=pomodomore_sounds||{
    "Glass": "glass.wav",
    "Show me love": "marimba.mp3"
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
var pomodomore_state=pomodomore_state||{
    remaining: 0,
    elapsed: 0,
    totalTime: 0,
    timeoutObject: undefined,
    shortBreaksCount: 0,
    state: pomodomore_globals.states.STOPPED,
    size: {
    }
};
var notifyAudio = new Audio(pomodomore_options.notificationSound);
notifyAudio.volume = pomodomore_options.notificationVolume;
var reset_pomodomore_state = pomodomore_state;
var reset_pomodomore_options = pomodomore_options;
var Pomodomore = {
    transitionHelper : function(){
        if(pomodomore_state.state===pomodomore_globals.states.STOPPED||pomodomore_state.state===pomodomore_globals.states.LONG_BREAK || pomodomore_state.state===pomodomore_globals.states.SHORT_BREAK){
            if(pomodomore_state.timeoutObject)
                clearTimeout(pomodomore_state.timeoutObject);
            pomodomore_state.state=pomodomore_globals.states.WORK;
            Pomodomore.notifyTransition();
            Pomodomore.initializeTimerState(pomodomore_options.work);
        }else if(pomodomore_state.state===pomodomore_globals.states.WORK){
            pomodomore_state.shortBreaksCount=(pomodomore_state.shortBreaksCount+1)%(pomodomore_options.shortbrks+1);
            if(pomodomore_state.shortBreaksCount===0){
                clearTimeout(pomodomore_state.timeoutObject);
                pomodomore_state.state=pomodomore_globals.states.LONG_BREAK;
                Pomodomore.notifyTransition();
                Pomodomore.initializeTimerState(pomodomore_options.longbrk);
            }else{
                clearTimeout(pomodomore_state.timeoutObject);
                pomodomore_state.state=pomodomore_globals.states.SHORT_BREAK;
                Pomodomore.notifyTransition();
                Pomodomore.initializeTimerState(pomodomore_options.shortbrk);           
            }
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
        timeUnit = timeUnit + ""
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
        pomodomore_state.elapsed++;
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
    initializeTimerState: function(pomtime){
        pomodomore_state.totalTime=pomtime.total;
        pomodomore_state.remaining=pomtime.total;
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
    getTotalTime : function(seconds, minutes, hours){
        return seconds + 60*minutes + 3600*hours;
    },
    saveDurationSettings: function(){
        pomodomore_options.work.hours = parseInt($("#work_hours").val());
        pomodomore_options.work.minutes = parseInt($("#work_minutes").val());
        pomodomore_options.work.seconds = parseInt($("#work_seconds").val());
        pomodomore_options.work.total = Pomodomore.getTotalTime(pomodomore_options.work.seconds,
                                                    pomodomore_options.work.minutes,
                                                    pomodomore_options.work.hours);
        pomodomore_options.shortbrk.hours = parseInt($("#shortbrk_hours").val());
        pomodomore_options.shortbrk.minutes = parseInt($("#shortbrk_minutes").val());
        pomodomore_options.shortbrk.seconds = parseInt($("#shortbrk_seconds").val());
        pomodomore_options.shortbrk.total = Pomodomore.getTotalTime(pomodomore_options.shortbrk.seconds,
                                                    pomodomore_options.shortbrk.minutes,
                                                    pomodomore_options.shortbrk.hours);
        pomodomore_options.longbrk.hours = parseInt($("#longbrk_hours").val());
        pomodomore_options.longbrk.minutes = parseInt($("#longbrk_minutes").val());
        pomodomore_options.longbrk.seconds = parseInt($("#longbrk_seconds").val());
        pomodomore_options.longbrk.total = Pomodomore.getTotalTime(pomodomore_options.longbrk.seconds,
                                                    pomodomore_options.longbrk.minutes,
                                                    pomodomore_options.longbrk.hours);
        pomodomore_options.shortbrks = parseInt($("#shortbrks").val());
    },
    saveThemeSettings: function(){
        var oldColor = pomodomore_options.themeColor;
        if(oldColor){
            $("body, a, i, select, input").removeClass(oldColor);
        }
        pomodomore_options.themeColor = $("#bg_color").find(":selected").attr("val");
        $("body, a, i, select, input").addClass(pomodomore_options.themeColor);
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
        Pomodomore.saveDurationSettings();
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
        $("#shortbrks").val(pomodomore_options.shortbrks);
    },
    populateThemeSettings: function(){
        $("#bg_color").find("option[val='"+pomodomore_options.themeColor+"']").attr("selected","selected");
    },
    populateAudioSettings: function(){
        $("#notification_options").find("option[val='"+pomodomore_options.notificationSound+"']").attr("selected","selected");
        $("#volume-slider").slider("value",pomodomore_options.notificationVolume);
        $("#volume").val(pomodomore_options.notificationVolume);
    },
    populateSettings: function(){ 
        chrome.storage.sync.get("options",function(items){
            if(items && items["options"]){
                pomodomore_options = items["options"];
                $("#progress").progressbar();
                Pomodomore.initializeTimerState(pomodomore_options.work);
            }
        });
        Pomodomore.populateDurationSettings();
        Pomodomore.populateThemeSettings();
        Pomodomore.populateAudioSettings();
    }
};
$(document).ready(
    function(){
        chrome.storage.sync.get("options",function(items){
            if(items && items["options"]){
                pomodomore_options = items["options"];
                $("#progress").progressbar();
                Pomodomore.initializeTimerState(pomodomore_options.work);
                $("body").hide();
                $("body, a, i, select, input").addClass(pomodomore_options.themeColor);
                $("body").show();
            }
        });   
        chrome.app.window.current().innerBounds.setMinimumSize(170,110);
        chrome.app.window.current().innerBounds.setSize(170,110);    
        $("#pausePomodoro").parent().hide(); 
        /*$("#notification_audio").on("click",function(){
            $("#notification_audio_file").trigger("click");
        });
        $("#notification_audio_file").on("change",function(event){
            $("#notification_audio").val($("#notification_audio_file").val());
        });*/
        $.each(Object.keys(pomodomore_sounds),function(index,object){
            var option='<option val="'+pomodomore_sounds[object]+'">'+object+'</option>';
            $("#notification_options").append(option);
        });
        $.each(Object.keys(pomodomore_colors),function(index,object){
            var option='<option val="'+pomodomore_colors[object]+'" class="'+pomodomore_colors[object]+'">'+object+'</option>';
            $("#bg_color").append(option);
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
            pomodomore_state.state=pomodomore_globals.states.PAUSED;
            clearTimeout(pomodomore_state.timeoutObject);
        });
        $("#closePomodoro").click(function(){
            chrome.app.window.current().close();
        });
        $("#refreshPomodoro").click(function(){
            pomodomore_state.state=pomodomore_globals.states.STOPPED;
            $("#pausePomodoro").parent().hide();
            $("#startPomodoro").parent().show();
            Pomodomore.initializeTimerState(pomodomore_options.work);
            $("#progress").hide();
        });
        $("#settingsPomodoro").click(function(){
            $("#pomodoro-timer").hide();
            chrome.app.window.current().innerBounds.setMinimumSize(320,210);
            chrome.app.window.current().innerBounds.setSize(320,210);
            Pomodomore.populateSettings();
            $("#settings").show();
        });
        $("#exitSettings").click(function(){
            $("#settings").hide();
            chrome.app.window.current().innerBounds.setMinimumSize(180,120);
            chrome.app.window.current().innerBounds.setSize(180,120);
            chrome.storage.sync.get("options",function(items){
                if(items && items["options"]){
                    var old_options = pomodomore_options;
                    pomodomore_options = items["options"];
                    if(old_options.work!==pomodomore_options.work
                        || old_options.shortbrk!==pomodomore_options.shortbrk
                        || old_options.longbrk!==pomodomore_options.longbrk
                        || old_options.shortbrks!==pomodomore_options.shortbrks){
                        Pomodomore.initializeTimerState(pomodomore_options.work);
                    }
                }
            });
            notifyAudio.pause();
            notifyAudio.currentTime=0;
            $("#pomodoro-timer").show();
        });
        $("#show-duration-settings").click(function(){
            $("#settings > div").hide();
            notifyAudio.pause();
            notifyAudio.currentTime=0;
            $("#duration-settings").show();
        });
        $("#show-appearance-settings").click(function(){
            $("#settings > div").hide();
            notifyAudio.pause();
            notifyAudio.currentTime=0;
            $("#appearance-settings").show();
        });
        $("#show-audio-settings").click(function(){
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
                }
            }
        });
        $("#settings").on("change", "input, select", function(){
            Pomodomore.saveSettings();
        });
    }
);


