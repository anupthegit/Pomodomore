$(document).ready(function(){
    var taskWindow = chrome.app.window.get('TaskWindow').contentWindow;
    var selectedTask = taskWindow.selectedTask;
    var addedTaskType = taskWindow.addedTaskType;
    if(selectedTask!==null && addedTaskType!='subtask'){
        var selector = $("#task .w3-input");
        var len = selector.length;
        for(var i=0;i<len;i++){
            var elem = selector[i];
            $(elem).val(selectedTask[elem.id]);
        }
    }
    var defaultValues = {
        'duedate': Infinity
    };
    $("#cancel").click(function(){
        chrome.app.window.current().close();
    });
    $("#submit").click(function(){
        var taskUi = taskWindow.taskUi;
        var selector = $("#task .w3-input");
        var len = selector.length;
        var options = (selectedTask!==null && addedTaskType!='subtask')?$.extend({},selectedTask):{};
        for(var i=0;i<len;i++){
            var elem = selector[i];
            if(elem.required && elem.value===""){
                break;
            }else if(elem.value!=="")
                options[elem.id] = elem.value;
            else
                options[elem.id] = defaultValues[elem.id];
        }
        var type=(addedTaskType==='subtask')?'subtask_added':(selectedTask!==null)?'task_edited':'task_added';
        taskUi.redrawUI({'type':type,'taskVal':options});
        chrome.app.window.current().close();
    });
});