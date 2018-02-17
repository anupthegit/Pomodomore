function TaskList(tasks,iterator){
    this.iterator=iterator||new OrderPreservingIterator();
    this.addTasks(tasks||[]);
}

TaskList.prototype.addTasks = function(tasks){
    this.iterator.addItems(tasks);
};

TaskList.prototype.addTask = function(task){
    this.iterator.addItem(task);
};

TaskList.prototype.addSubTask = function(id,subtask){
    this.iterator.prototype.addSubTask(id,subtask);
};

TaskList.prototype.removeTask = function(id){
    this.iterator.prototype.removeItem(id);
};

TaskList.prototype.getTask = function(id){
    return this.iterator.prototype.getItem(id);
};

TaskList.prototype.setTask = function(id,task){
    this.iterator.prototype.setItem(id,task);
};

TaskList.prototype.removeTasks = function(tasks){
    this.iterator.prototype.removeItems(tasks);
};

TaskList.prototype.getTaskCount = function(){
    return this.iterator.prototype.getCount();
};

TaskList.prototype.getTasks = function(){
    return this.iterator.prototype.tasks;
};

TaskList.prototype.moveTasks = function(taskswithindices,destindex){
    if(this.iterator.constructor.name!=="OrderPreservingIterator"){
        this.iterator=this.iterator.getOrderPreservingIterator();
    }
    this.iterator.moveItems(taskswithindices,destindex);
};

TaskList.prototype.hasNextTask = function(){
    return this.iterator.prototype.hasNext();
};

TaskList.prototype.nextTask = function(){
    return this.iterator.prototype.next();
};

TaskList.prototype.startNext = function(completeCallback,startCallback){
    var currTask=this.iterator.prototype.currentTask;
    var nextTask=this.next();
    currTask.markComplete(completeCallback);
    nextTask.startTask(startCallback);
};
