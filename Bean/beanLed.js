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
    var beanNode = require('./beanNodeStatusMixin.js');

    function BeanLedNode(n) {
        RED.nodes.createNode(this,n);

        this.topic = n.topic;
        this.bean = n.bean
        this.beanConfig = RED.nodes.getNode(this.bean);

        // respond to inputs....
        this.on('input', function (msg) {
            if ( ! (typeof msg.payload == 'string' || msg.payload instanceof String)){
                this.warn("Invalid input to the LED Bean node. The input payload should be a string containing three comma separated integers (0-255) as an input. For example: \"0,128,255\"");
                return;
            }

            if(msg.payload.toUpperCase() === "RED"){
                this.beanConfig.setColor(new Buffer([ 255, 0, 0]), function(){})
                return;
            }else if(msg.payload.toUpperCase() === "GREEN"){
                this.beanConfig.setColor(new Buffer([ 0, 255, 0]), function(){})
                return;
            }else if(msg.payload.toUpperCase() === "BLUE"){
                this.beanConfig.setColor(new Buffer([ 0, 0, 255]), function(){})
                return;
            }else if(msg.payload.toUpperCase() === "OFF"){
                this.beanConfig.setColor(new Buffer([ 0, 0, 0]), function(){})
                return;
            }

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

            if(this.beanConfig){
                this.beanConfig.setColor(new Buffer(rgbValues), function(){
                })
            }
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: this.client.disconnect();
        });

        beanNode.configureBeanStatuses.call(this);

    }

    RED.nodes.registerType("bean led",BeanLedNode);

}
