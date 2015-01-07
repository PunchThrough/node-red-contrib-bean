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
        this.uuid = n.uuid;
        this.connectiontype = n.connectiontype;
        this.connectiontimeout  = n.connectiontimeout;

        console.log(this);

        var hasDisconnected = function (){
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
                    this.device.on('disconnect',hasDisconnected);
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

}
