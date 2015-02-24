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

    function BeanAccelNode(n) {
        RED.nodes.createNode(this,n);

        this.topic = n.topic;
        this.bean = n.bean
        this.beanConfig = RED.nodes.getNode(this.bean);

        // respond to inputs....
        this.on('input', function (msg) {

            if(this.beanConfig){
                this.beanConfig.requestAccell(function(){
                })
            }
        });
 
        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: this.client.disconnect();
        });


        this.beanConfig.on("connected", function() {
            this.beanConfig.device.on('accell',accelDataReceived);
        }.bind(this));


        var accelDataReceived = function(x, y, z, valid){
            var msg = {};
            msg.topic = "accel";
            msg.accelX = x;
            msg.accelY = y;
            msg.accelZ = z;
            msg.payload = x +", "+ y +", "+ z;
            this.send(msg);


        }.bind(this);
        
        beanNode.configureBeanStatuses.call(this);
    }

    RED.nodes.registerType("bean accel",BeanAccelNode);

}
