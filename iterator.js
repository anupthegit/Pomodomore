SortByKeyIterator.ASCENDING=1;
SortByKeyIterator.DESCENDING=-1;

function Iterator(){
    this.tasks=[];
    this.currentTask=undefined;
    this.currentTaskIndex=undefined;
}

Iterator.prototype.removeItem = function(id,taskList){
    var tasklist=taskList||this.tasks;
    for(var i=0;i<tasklist.length;i++){
        var taskcurr=tasklist[i];
        if(taskcurr.id===id){
            tasklist.splice(i,1);
        }
        var subtasks = taskcurr.subtasks;
        if(subtasks.length>0){
            this.removeItem(id,subtasks);
        }
    }
};

Iterator.prototype.getItem = function(id,taskList){
    var tasklist=taskList||this.tasks;
    for(var i=0;i<tasklist.length;i++){
        var taskcurr=tasklist[i];
        if(taskcurr.id===id){
            return taskcurr;
        }
        var subtasks = taskcurr.subtasks;
        if(subtasks.length>0){
            return this.getItem(id,subtasks);
        }
    }
};

Iterator.prototype.setItem = function(id,task,taskList){
    var tasklist=taskList||this.tasks;
    for(var i=0;i<tasklist.length;i++){
        var taskcurr=tasklist[i];
        if(taskcurr.id===id){
            tasklist[i]=task;
            break;
        }
        var subtasks = taskcurr.subtasks;
        if(subtasks.length>0){
            this.setItem(id,task,subtasks);
        }
    }
};

Iterator.prototype.addSubTask = function(id,subtask,taskList,level){
    var tasklist=taskList||this.tasks;
    level=level||1;
    for(var i=0;i<tasklist.length;i++){
        var taskcurr=tasklist[i];
        if(taskcurr.id===id){
            subtask.level=level;
            taskcurr.subtasks.push(subtask);
            break;
        }
        var subtasks = taskcurr.subtasks;
        if(subtasks.length>0){
            this.addSubTask(id,subtask,subtasks,level+1);
        }
    }
};

Iterator.prototype.removeItems = function(items){
    for(var i=0;i<items.length;i++){
        this.removeItem(items[i]);
    }
};

Iterator.prototype.hasNext = function(){
    if(this.currentTask && this.currentTask.id!==this.tasks[this.tasks.length-1].id)
        return true;
};

Iterator.prototype.next = function(){
    return this.tasks[this.currentTaskIndex+1];
};

Iterator.prototype.startNext = function(){
    this.currentTaskIndex+=1;
};

Iterator.prototype.getCount = function(){
    return this.tasks.length;
};

function OrderPreservingIterator(tasks){
    this.prototype=new Iterator();
    if(typeof tasks!=="undefined")
        this.addItems(tasks);
    this.prototype.currentTaskIndex=0;
    this.prototype.currentTask=this.prototype.tasks[0];
}

OrderPreservingIterator.prototype.addItem = function(task){
    this.prototype.tasks.push(task);
};

OrderPreservingIterator.prototype.addItems = function(tasks){
    for(var i=0;i<tasks.length;i++)
        this.prototype.tasks.push(tasks[i]);
};

OrderPreservingIterator.prototype.moveItems = function(taskswithindices,destindex){
    var indices=Object.keys(taskswithindices);
    for(var i=0;i<indices.length;i++){
        var index=indices[i];
        var task=taskswithindices[index];
        this.prototype.tasks.splice(index,1);
        this.prototype.tasks.splice(destindex+i,0,task);
    }
};

function SortByKeyIterator(tasks,sortkeys,sortdir){
    this.prototype=new Iterator();
    this.sortkeys=sortkeys||["name"];
    this.sortdir=sortdir||SortByKeyIterator.ASCENDING;
    if(typeof tasks!=="undefined")
        this.addItems(tasks);
    this.prototype.currentTaskIndex=0;
    this.prototype.currentTask=this.prototype.tasks[0];
}

SortByKeyIterator.prototype.compareTasks = function(task1,task2){
    for(var i=0;i<this.sortkeys.length;i++){
        var sortkey=this.sortkeys[i];
        if(task1[sortkey]>task2[sortkey])
            return 1;
        if(task1[sortkey]<task2[sortkey])
            return -1;
    }
    return 0;
};

SortByKeyIterator.prototype.addItem = function(task){
    var start=0;
    var end=this.prototype.tasks.length-1;
    var middle=Math.floor((start+end)/2);
    if(start===end || this.compareTasks(task,this.prototype.tasks[end])===1){
        this.prototype.tasks.push(task);
        return this.prototype.tasks;
    }
    if(this.compareTasks(task,this.prototype.tasks[start])===-1){
        this.prototype.tasks.splice(start,0,task);
        return this.prototype.tasks;
    }
    while(start<end){
        middle=Math.floor((start+end)/2);
        var comparison=this.compareTasks(task,this.prototype.tasks[middle]);
        if(comparison===1){
            if(this.sortdir===SortByKeyIterator.ASCENDING)
                end=middle-1;
            else
                start=middle+1;
        }else if(comparison===-1){
            if(this.sortdir===SortByKeyIterator.ASCENDING)
                start=middle+1;
            else
                end=middle-1;
        }else{
            break;
        }
    }
    this.prototype.tasks.splice(middle,0,task);
    return this.prototype.tasks;
};

SortByKeyIterator.prototype.addItems = function(tasks){
    for(var i=0;i<tasks.length;i++)
        this.prototype.tasks.push(tasks[i]);
    this.prototype.tasks.sort();
    return this.prototype.tasks;
};

SortByKeyIterator.prototype.getOrderPreservingIterator = function(){
    return new OrderPreservingIterator(this.prototype.tasks);
};
