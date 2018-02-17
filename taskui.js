var pomodomoreTaskList;
var MainWindow = chrome.app.window.get('MainWindow').contentWindow;
var taskUi = taskUi || new TaskUI();
var dragSrcEl = null;
var selectedTask = null;
var addedTaskType = null;
var dragStartY;

var taskTemplate = '<div id="##id##" draggable="true" class="w3-card-2">'+
                   '<span title="##description##" class="taskname">' +
                   '<a class="w3-btn togglesubtasksbutton hidden"><i title="Expand sub-tasks" class="material-icons" style="color: grey;">arrow_drop_down</i></a>' +
                   '<a class="w3-btn togglesubtasksbutton hidden"><i title="Collapse sub-tasks" class="material-icons" style="color: grey;">arrow_drop_up</i></a>' +
                   '<a class="w3-btn addsubtaskbutton"><i title="Add sub-task" class="material-icons" style="color: blue;">add</i></a>' +
                   '##name##</span>' +
                   '<span class="taskestimate">##estimate##</span>' +
                   '<span class="taskduedate">##duedate##</span>' +
                   '<span class="taskbuttonsbar">' + 
                   '<a class="w3-btn taskbutton"><i title="Start task" class="material-icons" style="color:mediumseagreen;">' +
                   'play_arrow</i></a>' +
                   '<a class="w3-btn taskbutton"><i title="Priority" class="material-icons" style="color: crimson;">flag</i></a>' +
                   '<a class="w3-btn taskbutton"><i title="Delete task" class="material-icons" style="color: darkgrey;">delete</i></a>' +
                   '<a class="w3-btn taskbutton"><i title="Edit" class="material-icons" style="color: orange;">create</i></a>' +
                   '</span><div class="subtasks" draggable="true"></div></div>';

TaskUI.prototype.handleDragOver = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.originalEvent.dataTransfer.dropEffect = 'move';
    return false;
};

TaskUI.prototype.handleDragEnter = function(e) {
    if(dragStartY < e.originalEvent.y){
        this.classList.add('dropfromabove');
    }else if(dragStartY > e.originalEvent.y){
        this.classList.add('dropfrombelow');
    }
};

TaskUI.prototype.handleDragLeave  = function(e) {
    this.classList.remove('dropfromabove');
    this.classList.remove('dropfrombelow');
};

TaskUI.prototype.handleDragStart = function(e) {
    e.originalEvent.dataTransfer.effectAllowed = 'move';
    e.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
    dragSrcEl = this;
    this.style.opacity = '0.4';
    dragStartY = e.originalEvent.y;
};

TaskUI.prototype.handleDrop = function(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if(dragSrcEl!==null)
        dragSrcEl.style.opacity = '1';
    if (dragSrcEl !== null && dragSrcEl != this) {
        if(dragStartY < e.originalEvent.y){
            this.insertAdjacentElement('AfterEnd',dragSrcEl);
        }else if(dragStartY > e.originalEvent.y){
            this.insertAdjacentElement('BeforeBegin',dragSrcEl);
        }
        this.classList.remove('dropfromabove');
        this.classList.remove('dropfrombelow');
        dragSrcEl = null;
    }
    return false;
};

TaskUI.prototype.addTaskDiv = function(taskVal){
    taskUi.taskDivHelper(taskVal, 'add');
};

TaskUI.prototype.addSubTaskDiv = function(taskVal,id){
    taskUi.taskDivHelper(taskVal, 'add', {'id':id});
};

TaskUI.prototype.editTaskDiv = function(taskVal,id){
    taskUi.taskDivHelper(taskVal, 'edit', {'id':id});
};

TaskUI.prototype.removeTaskDiv = function(taskVal,id){
    taskUi.taskDivHelper(taskVal, 'remove', {'id':id});
};

TaskUI.prototype.taskDivHelper = function(taskVal,domFuncType,domFuncArgs){
    if(domFuncType==='remove'){
        $('#' + domFuncArgs.id).replaceWith('');
        return;
    }
    var taskKeys = Object.keys(taskVal);
    var numKeys = taskKeys.length;
    var newTaskDiv = taskTemplate;
    for(var i=0;i<numKeys;i++){
        keyVal = taskVal[taskKeys[i]];
        if(taskKeys[i]==="duedate"){
            if(keyVal===Infinity)
                keyVal='-';
        }
        newTaskDiv = newTaskDiv.replace("##" + taskKeys[i] + "##",keyVal);
    }
    if(domFuncType==='add' && typeof domFuncArgs === "undefined")
        $(newTaskDiv).appendTo('#tasksDiv');
    else if(domFuncType==='add'){
        $(newTaskDiv).appendTo('#'+domFuncArgs.id+'> .subtasks');
        $('#'+domFuncArgs.id+'> .subtasks').hide();
        $('#' + domFuncArgs.id + ' > .taskname > .togglesubtasksbutton:first-child').removeClass('hidden');
        $('#' + domFuncArgs.id + ' > .taskname > .togglesubtasksbutton:nth-child(2)').addClass('hidden');
    }else if(domFuncType==='edit')
        $('#' + domFuncArgs.id).replaceWith(newTaskDiv);    
    var subtasks = taskVal.subtasks;
    for(var j=0;j<subtasks.length;j++){
        taskUi.addSubTaskDiv(subtasks[j], taskVal.id);
    }
    $("#tasksDiv > div").on('dragstart',taskUi.handleDragStart);
    $("#tasksDiv > div").on('dragenter',taskUi.handleDragEnter);
    $("#tasksDiv > div").on('dragover',taskUi.handleDragOver);
    $("#tasksDiv > div").on('dragleave',taskUi.handleDragLeave);
    $("#tasksDiv > div").on('drop',taskUi.handleDrop);
    $(".taskbuttonsbar > :nth-child(4)").on('click',function(){
        taskUi.editTask(pomodomoreTaskList.getTask(this.parentElement.parentElement.id));
    });
    $(".taskbuttonsbar > :nth-child(3)").on('click',function(){
        var id = this.parentElement.parentElement.id;
        pomodomoreTaskList.removeTask(id);
        taskUi.removeTaskDiv(undefined,id);
    });
    $('.addsubtaskbutton').on('click',function(){
        taskUi.addSubTask(pomodomoreTaskList.getTask(this.parentElement.parentElement.id));
    });
    $('.togglesubtasksbutton').on('click',function(){
        var substasksDivSelector = $('#' + this.parentElement.parentElement.id + ' > .subtasks');
        var expand = $(this).is(":first-child");
        var num = (expand)?2:1;
        var otherToggle = $('#' + this.parentElement.parentElement.id + 
                    ' > .taskname > .togglesubtasksbutton:nth-child(' + num +')');
        if(expand){
            substasksDivSelector.show();
        }else{
            substasksDivSelector.hide();
        }
        otherToggle.removeClass('hidden');
        $(this).addClass('hidden');
    });
};

TaskUI.prototype.redrawUI = function(options){
    var taskVal = options.taskVal;
    if(options && options.type==='task_added'){
        taskVal = new Task(taskVal);
        pomodomoreTaskList.addTask(taskVal);
        this.addTaskDiv(taskVal);
    }if(options && options.type==='subtask_added'){
        taskVal = new Task(taskVal);
        pomodomoreTaskList.addSubTask(selectedTask.id,taskVal);
        this.addSubTaskDiv(taskVal,selectedTask.id);
        selectedTask = null;
        addedTaskType = null;
    }if(options && options.type==='task_edited'){
        selectedTask = null;
        pomodomoreTaskList.setTask(taskVal.id,taskVal);
        this.editTaskDiv(taskVal,taskVal.id);
    }else if(options && options.type==='tasks_init'){
        var tasks = pomodomoreTaskList.getTasks();
        var numTasks = tasks.length;
        for(var i=0;i<numTasks;i++){
            this.addTaskDiv(tasks[i]);
        }
    }
};

TaskUI.prototype.addTask = function(){
    addedTaskType = 'task';
    taskUi.showTaskWindow();    
};

TaskUI.prototype.addSubTask = function(task){
    selectedTask = task;
    addedTaskType = 'subtask';
    taskUi.showTaskWindow();
};

TaskUI.prototype.editTask = function(task){
    selectedTask = task;
    console.log(task);
    taskUi.showTaskWindow();
};

TaskUI.prototype.showTaskWindow = function(){
    chrome.app.window.create('newtask.html',{
        id: "NewTask",
        minWidth: 500,
        minHeight: 450,
        alwaysOnTop: true
    });
};

function TaskUI(options){
    pomodomoreTaskList = MainWindow.pomodomore_task_list||new TaskList();
    if(this.redrawUI)
      this.redrawUI({'type':'tasks_init'});
}

$(document).ready(function(){
    taskUi.redrawUI({'type':'tasks_init'});
    $("#addTask").click(function(){
        taskUi.addTask();
    });
});
