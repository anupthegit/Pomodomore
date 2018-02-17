function Task(options){
    options=options||{};
    this.name = options.name||"Untitled Task";
    this.description = options.description||"No description";
    this.estimate = options.estimate||Infinity;
    this.id = options.id||Task.generateId();
    this.categories = options.categories||[];
    this.elapsed = 0;
    this.duedate = options.duedate||Infinity;
    this.priority = options.priority||0;
    this.tags = options.tags||[];
    this.complete = false;
    this.actors = options.actors||[];
    this.watchers = options.watchers||[];
    this.attachments = options.attachments||[];
    this.subtasks = options.subtasks||[];
    this.dependson = options.dependson||[];
    this.createTime = new Date();
    this.level = options.level||0;
}

Task.generateId = function(){
    //Source from discussion at http://tinyurl.com/l3wdzgj
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

Task.prototype.equals = function(task){
    return this.id===task.id;
};

Task.prototype.getPomodoroCount = function(){
    this.throwPomodoroCountErrors();
    return Math.ceil(this.estimate/pomodomore_options.work.total);
};

Task.prototype.getRemainingPomodoroCount = function(){
    this.throwPomodoroCountErrors();
    return Math.ceil((this.estimate - this.elapsed)/pomodomore_options.work.total);
};

Task.prototype.throwPomodoroCountErrors = function(){
    if(this.estimate===Infinity)
        throw new Error("Cannot find number of Pomodoros with no task duration estimate");
    if(typeof pomodomore_options==="undefined")
        throw new Error("Pomodomore is not properly initialized");
};

Task.prototype.markComplete = function(callback){
    this.complete = true;
    this.endTime = new Date();
    callback();
};

Task.prototype.startTask = function(callback){
    this.startTime = this.startTime||new Date();
    callback();
};