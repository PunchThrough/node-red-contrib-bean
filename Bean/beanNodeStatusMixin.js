exports.configureBeanStatuses = function(){ 

	var setStatusDisconnected = function(){
        this.status({
            fill:"red",
            shape:"ring",
            text:"disconnected"
        });
    }.bind(this);
    setStatusDisconnected();

    var setStatusConnected = function(){
        this.status({
            fill:"green",
            shape:"dot",
            text:"connected"
        });
    }.bind(this);

    var setStatusSearching = function(){
        this.status({
            fill:"yellow",
            shape:"ring",
            text:"searching..."
        });
    }.bind(this);

    var setStatusConnecting = function(){
        this.status({
            fill:"yellow",
            shape:"dot",
            text:"connecting..."
        });
    }.bind(this);

    this.beanConfig.on("connected", function() {
        setStatusConnected();
    }.bind(this));

    this.beanConfig.on("disconnected", function() {
        setStatusDisconnected();
    }.bind(this));

    this.beanConfig.on("searching", function() {
        setStatusSearching();
    }.bind(this));

    this.beanConfig.on("connecting", function() {
        setStatusConnecting();
    }.bind(this));

	return this;
}