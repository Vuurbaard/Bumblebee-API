module.exports = function(interval=1000){
    // Fuck this scopes...
    var _vm = this;
    this.jobs = [];
    this.running = false;
    // Don't spam the queuer
    this.maxlength = 25;

    this.push = function(func){
        if(_vm.jobs.length < this.maxlength){
            this.jobs.push(func);
        }
    };
    
    this.runTasks = function(){
        if(!_vm.running && _vm.jobs.length > 0){
            _vm.running = true;
            // Run task
            var task = _vm.jobs.shift();
            // Run task
            try{
                task(_vm);
            }catch(e){
                _vm.running = false;
                console.error(e);
            }   
        }
    }

    this.finish = function(){
        _vm.running = false;
        _vm.runTasks();
    }

    
    setInterval(this.runTasks,interval);

    return this;
}