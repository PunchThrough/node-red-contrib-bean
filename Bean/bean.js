/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    // "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");
    var bleBean = require("ble-bean");
    var events = require('events');
    var beanScanner = require('./beanScanner.js');


    // The main node definition - most things happen in here
    function BeanNode(n) {
        var verboseLog = function (msg){
            if (RED.settings.verbose) {
                this.log(msg);
            }
        }.bind(this)

        // Create a RED node
        RED.nodes.createNode(this,n);
        events.EventEmitter.call(this);
        verboseLog("A Bean config node is being instantiated");

        //beanScanner.startScanning();

        // Unlimited listeners
        this.setMaxListeners(0);

        // Store local copies of the node configuration (as defined in the .html)
        this.name = n.name;
        this.uuid = n.uuid;
        this.connectiontype = n.connectiontype;
        this.connectiontimeout  = n.connectiontimeout;

        // noble-device device object for the bean
        this.device;

        // Queue of functions to perform on a connceted Bean
        this._funqueue = [];

        // Disconnection timeout
        this._disconnectTimer;

        this._isAttemptingConnection = false;
        this._isConnectedAndSetUp = false;

        // Called after a Bean has been disconnected
        var _hasDisconnected = function (){
            this._isConnectedAndSetUp = false;

            verboseLog("We disconnected from the Bean with name \"" + this.name + "\"");
            this.emit("disconnected");
            if(this.connectiontype == 'constant' &&
                this.isBeingDestroyed !== true){
                _attemptConnection();
            }
        }.bind(this)

        // Called after a Bean has successfully connected
        var _hasConnected = function (){
            this._isConnectedAndSetUp = true;

            verboseLog("We connected to the Bean with name \"" + this.name + "\"");
            this.emit("connected");

            // Release serial gate
            this.device.send(new Buffer([0x05, 0x50]), new Buffer([]), function(){});

            _setDisconnectionTimeout(this.connectiontimeout);
            
            while (this._funqueue.length > 0) {
                (this._funqueue.shift()).call(this);   
            }
        }.bind(this)


        // This function will attempt to connect to a Bean. 
        var _attemptConnection = function(){
            if(this._isAttemptingConnection === true ||
                this.isBeingDestroyed === true){ 
                //verboseLog("Already in a connection attempt to the Bean with name \"" + this.name + "\"");
                return false; 
            }

            verboseLog("Scanning for the Bean with name \"" + this.name + "\"");

            this._isAttemptingConnection = true;

            this.emit("searching");

            var onDiscovery = function(bean) {
                verboseLog("We found a desired Bean \"" + this.name + "\"");
                this.device = bean;
                this.emit("connecting");
                this.device.connectAndSetup(function(){
                    this.device.once('disconnect', _hasDisconnected);
                    this._isAttemptingConnection = false;
                    _hasConnected();
                }.bind(this))
            }.bind(this)

            bleBean.discoverWithFilter(function(bean) {
                return (bean.uuid === this.uuid) || (bean._peripheral.advertisement.localName === this.name);
            }.bind(this), onDiscovery);

            return true;
        }.bind(this)

        // Used to check if this node is currently conencted to a Bean
        this._isConnected = function (){
            if(this.device
                && this._isConnectedAndSetUp === true
                && this.device._peripheral.state == 'connected'
                && ((this.device.connectedAndSetUp) ? this.device.connectedAndSetUp === true : true)){
                return true;
            }else{
                return false;
            }
        }

        // In the "Connect on Event" mode, this function sets a timeout for the bean to disconnect
        // This timout should be reset every time a new event is sent to this Bean config node
        var _setDisconnectionTimeout = function(seconds){
            if(this.connectiontype == 'timeout'){
                // Clear any previous disconnect timeout
                if (typeof(this._disconnectTimer) === 'undefined' 
                    || this._disconnectTimer === null)
                {

                }else{
                    clearTimeout(this._disconnectTimer);
                }
                // Set the new disconnect timeout
                this._disconnectTimer = setTimeout(function(){
                    if(this._isConnected() === true){
                        this.device.disconnect();
                    }
                }.bind(this), seconds*1000);
            }else if(this.connectiontype === 'constant'){

            }
        }.bind(this)


        this.write = function(data, done){
            _performFunctionWhenConnected(function(){
                this.device.write(data, done);
            })
        }

        this.setColor = function(color,done){
            _performFunctionWhenConnected(function(){
                this.device.setColor(color, done);
            })
        };

        this.requestAccell = function(done){
            _performFunctionWhenConnected(function(){
                this.device.requestAccell(done);
            })
        };

        this.requestTemp = function(done){
            _performFunctionWhenConnected(function(){
                this.device.requestTemp(done);
            })
        };

        this.readOne = function(done) {
            _performFunctionWhenConnected(function() {
                this.device.readOne(done);
            });
        };

        this.writeOne = function(buffer, done) {
            _performFunctionWhenConnected(function() {
                this.device.writeOne(buffer, done);
            });
        };

        this.readTwo = function(done) {
            _performFunctionWhenConnected(function() {
                this.device.readTwo(done);
            });
        };

        this.writeTwo = function(buffer, done) {
            _performFunctionWhenConnected(function() {
                this.device.writeTwo(buffer, done);
            });
        };

        this.readThree = function(done) {
            _performFunctionWhenConnected(function() {
                this.device.readThree(done);
            });
        };

        this.writeThree = function(buffer, done) {
            _performFunctionWhenConnected(function() {
                this.device.writeThree(buffer, done);
            });
        };

        this.readFour = function(done) {
            _performFunctionWhenConnected(function() {
                this.device.readFour(done);
            });
        };

        this.writeFour = function(buffer, done) {
            _performFunctionWhenConnected(function() {
                this.device.writeFour(buffer, done);
            });
        };

        this.readFive = function(done) {
            _performFunctionWhenConnected(function() {
                this.device.readFive(done);
            });
        };

        this.writeFive = function(buffer, done) {
            _performFunctionWhenConnected(function() {
                this.device.writeFive(buffer, done);
            });
        };

        // This function will immediately execute "aFunction" if the Bean is connected 
        // If the Bean is not connected, "aFunction" will be queued up an executed on next connection
        var _performFunctionWhenConnected = function(aFunction){
            if(this._isConnected() === true){
                aFunction.call(this);
                _setDisconnectionTimeout(this.connectiontimeout);
            }else{
                _attemptConnection(this.connectiontimeout);
                this._funqueue.push(aFunction);
            }
        }.bind(this)
        

        // This is a second precaution in case the "disconnect" event isn't reached 
        if(this.connectiontype === 'constant'){
            // Queue up a call to attempt initial connection. 
            // This lets the Bean nodes that depend on this configuration get setup before connction is attempted
            setImmediate(function(){
                _attemptConnection();
            })

            // Check connection status periodically and attempt to reconnect if disconnceted
            this.reconnectInterval = setInterval(function(){
                if(this._isConnected() === false){
                    _attemptConnection();
                }else{
                    //verboseLog("We are currently connected to the Bean with name \"" + this.name + "\"");
                }
            }.bind(this), 30*1000)
        }

        // This event handle this Bean config node being destroyed
        this.on("close", function(done) {
            verboseLog("A Bean config node is being destroyed");
            this.isBeingDestroyed = true;
            clearInterval(this.reconnectInterval);
            beanScanner.stopScanning();
            // This is a hack. It clears all scan requests for noble-device. 
            // If every other bean config node isn't also being reset now, then we have issues
            bleBean.emitter.removeAllListeners('discover');  
            if (this._isConnected()) {
                this.device.disconnect(function(){
                    verboseLog("A Bean config node is finished being destroyed");
                    done();
                }.bind(this));
            }else{
                verboseLog("A Bean config node is finished being destroyed");
                done();
            }
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("bean",BeanNode);

    RED.httpAdmin.get("/discoveredbeans",function(req,res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        var beans = beanScanner.getDiscoveredBeans();
        var beanReport =[];
        for (i = 0; i < beans.length; i++) {
            beanReport.push({
                "name":beans[i]._peripheral.advertisement.localName,
                "uuid":beans[i].uuid,
                "rssi":beans[i]._peripheral.rssi
            });
        }

        res.write(JSON.stringify(beanReport));
        res.end();
    });
}
