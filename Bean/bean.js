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

// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file


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
        console.log(n)
        // Store local copies of the node configuration (as defined in the .html)
        this.name = n.name;

        console.log(this);

        var beanHasDisconnected = function (){
            this.emit("disconnected");
        }.bind(this)


        var attemptConnection = function(){
            // TODO: review how this works. Will it still work reliably when multiple nodes are changing this class property?
            // Scan for a Bean with either the same name or UUID
            bleBean.is = function(peripheral){
                return ( peripheral.advertisement.localName === this.name 
                        || peripheral.uuid === this.uuid );
            }.bind(this);
            bleBean.discover(function(bean) {
                console.log("We found a desired Bean \"" + this.name + "\"");
                this.device = bean;
                this.device.connectAndSetup(function(){
                    console.log("We connected to the Bean with name \"" + this.name + "\"");
                    this.device.on('disconnect',beanHasDisconnected);
                    this.emit("connected");
                }.bind(this))
            }.bind(this))
        }.bind(this)

        this.isConnected = function (){
            if(this.device
                && this.device._peripheral.state == 'connected'){
                return true;
            }else{
                return false;
            }
        }

        attemptConnection();
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("bean",BeanNode);


    function BeanLedNode(n) {
        RED.nodes.createNode(this,n);

        this.topic = n.topic;
        this.bean = n.bean
        this.beanConfig = RED.nodes.getNode(this.bean);

        // respond to inputs....
        this.on('input', function (msg) {
            var rgbValues = msg.payload.split(",");
            // Convert from strings to integers, and check range
            var outOfRange = false;
            for(var i=0; i<rgbValues.length; i++) { 
                rgbValues[i] = parseInt(rgbValues[i]); 
                if(rgbValues[i] < 0 || rgbValues[i] > 255){
                    outOfRange = true;
                }
            } 

            // Display a warning if the input is invalid
            if(rgbValues.length != 3
                || outOfRange === true){
                this.warn("Invalid input to the LED Bean node. Please use three comma separated integers (0-255) as an input. For example: \"0,128,255\"");
                return;
            }

            if(this.beanConfig
                && this.beanConfig.isConnected){
                console.log(this.beanConfig.device)
                this.beanConfig.device.setColor(new Buffer(rgbValues), function(){
                    console.log("led color sent");
                });
            }
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: this.client.disconnect();
        });


        var setStatusDisconnected = function(){
            this.status({
                fill:"red",
                shape:"ring",
                text:"disconnected"
            });
        }.bind(this)();

        var setStatusConnected = function(){
            this.status({
                fill:"green",
                shape:"dot",
                text:"connected"
            });
        }.bind(this);

        this.beanConfig.on("connected", function() {
            setStatusConnected();
        }.bind(this));

        this.beanConfig.on("disconnected", function() {
            setStatusDisconnected();
        }.bind(this));

    }

    RED.nodes.registerType("bean led",BeanLedNode);


    function BeanSerialNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.topic = n.topic;
        this.bean = n.bean
        this.beanConfig = RED.nodes.getNode(this.bean);

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        var msg = {};
        msg.topic = this.topic;
        msg.payload = "Hello world !"

        // send out the message to the rest of the workspace.
        this.send(msg);

        // respond to inputs....
        this.on('input', function (msg) {
            console.log("I saw a payload: "+msg.payload);
            // in this example just send it straight on... should process it here really
            //this.send(msg);
            if(this.beanConfig){
                console.log(this.beanConfig.bean)
                if(this.beanConfig.bean
                    && this.beanConfig.bean._peripheral.state == 'connected'){
                    console.log("Sending this string: " + msg.payload)
                    this.beanConfig.bean.write(new Buffer(msg.payload), function(){
                        console.log("serial data sent");
                    });
                }
            }
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: this.client.disconnect();
        });

        var setStatusDisconnected = function(){
            this.status({
                fill:"red",
                shape:"ring",
                text:"disconnected"
            });
        }.bind(this)();

        var setStatusConnected = function(){
            this.status({
                fill:"green",
                shape:"dot",
                text:"connected"
            });
        }.bind(this);

        this.beanConfig.on("connected", function() {
            setStatusConnected();
        }.bind(this));

        this.beanConfig.on("disconnected", function() {
            setStatusDisconnected();
        }.bind(this));
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("bean serial",BeanSerialNode);

}
