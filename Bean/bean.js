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

    // The main node definition - most things happen in here
    function BeanNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);
        events.EventEmitter.call(this);

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

        var hasDisconnected = function (){
            console.log("We disconnected from the Bean with name \"" + this.name + "\"");
            this.emit("disconnected");
            if(this.connectiontype == 'constant'){
                attemptConnection();
            }
        }.bind(this)

        var hasConnected = function (){
            console.log("We connected to the Bean with name \"" + this.name + "\"");
            this.emit("connected");

            // Release serial gate
            this.device.send(new Buffer([0x05, 0x50]), new Buffer([]), function(){});

            setDisconnectionTimeout(this.connectiontimeout);
            
            while (this._funqueue.length > 0) {
                (this._funqueue.shift()).call(this);   
            }
        }.bind(this)



        var attemptConnection = function(){
            if(this._isAttemptingConnection === true){ 
                //console.log("Already in a connection attempt to the Bean with name \"" + this.name + "\"");
                return false; 
            }

            console.log("Attempting to connect to the Bean with name \"" + this.name + "\"");

            this._isAttemptingConnection = true;

            this.emit("searching");

            var onDiscovery = function(bean) {
                console.log("We found a desired Bean \"" + this.name + "\"");
                this.device = bean;
                this.emit("connecting");
                this.device.connectAndSetup(function(){
                    this.device.on('disconnect', hasDisconnected);
                    this._isAttemptingConnection = false;
                    hasConnected();
                }.bind(this))
            }.bind(this)

            bleBean.discoverWithFilter(function(bean) {
                return (bean.uuid === this.uuid) || (bean.name === this.name);
            }.bind(this), onDiscovery);

            return true;
        }.bind(this)


        this.isConnected = function (){
            if(this.device
                && this.device._peripheral.state == 'connected'){
                return true;
            }else{
                return false;
            }
        }

        var setDisconnectionTimeout = function(seconds){
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
                    this.device.disconnect();
                }.bind(this), seconds*1000);
            }else if(this.connectiontype === 'constant'){

            }
        }.bind(this)


        this.write = function(data, done){
            performFunctionWhenConnected(function(){
                this.device.write(data, done);
            })
        }

        this.setColor = function(color,done){
            performFunctionWhenConnected(function(){
                this.device.setColor(color, done);
            })
        };

        this.requestAccell = function(done){
            performFunctionWhenConnected(function(){
                this.device.requestAccell(done);
            })
        };

        this.requestTemp = function(done){
            performFunctionWhenConnected(function(){
                this.device.requestTemp(done);
            })
        };

        var performFunctionWhenConnected = function(aFunction){
            setDisconnectionTimeout(this.connectiontimeout);

            if(this.isConnected() === true){
                aFunction.call(this);
            }else{
                attemptConnection();
                this._funqueue.push(aFunction);
            }
        }.bind(this)
        

        // This is a second precaution in case the "disconnect" event isn't reached 
        if(this.connectiontype === 'constant'){
            // Queue up a call to attempt initial connection. 
            // This lets the Bean nodes that depend on this configuration get setup before connction is attempted
            setImmediate(function(){
                attemptConnection();
            })

            // Check connection status periodically and attempt to reconnect if disconnceted
            this.reconnectInterval = setInterval(function(){
                if(this.isConnected() === false){
                    attemptConnection();
                }else{
                    //console.log("We are currently connected to the Bean with name \"" + this.name + "\"");
                }
            }.bind(this), 30*1000)
        }

        this.on("close", function(done) {
            clearInterval(this.reconnectInterval);
            if (this.isConnected()) {
                this.device.disconnect(function(){
                    console.log("We disconnected from the Bean with name \"" + this.name + "\"");
                    done();
                }.bind(this));
            }else{
                done();
            }
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("bean",BeanNode);

}
