var prototype = module.exports;

var info = true;
prototype.log = function(prefix, message){
    console.log("Commservus " + prefix + " >> " + message);
};

prototype.info = function(message){
    if(!info){
        return;
    }

    this.log("INFO", message);
};

prototype.error = function(message){
    this.log("ERROR", message);
};

prototype.warning = function(message){
    this.log("ERROR", message);
};