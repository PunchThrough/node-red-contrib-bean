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

    function BeanSerialNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);



        // Store local copies of the node configuration (as defined in the .html)
        this.topic = n.topic;
        this.bean = n.bean
        this.beanConfig = RED.nodes.getNode(this.bean);
        this.bin = n.bin;
        this.newline = n.newline;
        this.addchar = n.addchar;
        this.out = n.out;

        this.splitChar = this.newline.replace("\\n","\n").replace("\\r","\r").replace("\\t","\t").replace("\\e","\e").replace("\\f","\f").replace("\\0","\0").charCodeAt(0);

        this.rxBuffer = new Buffer(0);
        this.serialTimeout = null;

        // respond to inputs....
        this.on('input', function (msg) {
            if(this.beanConfig){
                // This works for both String and Buffer objects. Strings are expected to be utf8 encoded
                var outBuf = new Buffer(msg.payload)

                // Check to see if we should add the split char
                if (this.addchar) {
                    outBuf = Buffer.concat([outBuf, new Buffer([this.splitChar])])
                }

                this.beanConfig.write(outBuf, function(error){
                    if (error) this.error(error)
                })
            }
        });

        var sendIncomingBuffer = function(buffer){
            var msg = {};
            msg.topic = "serial";
            msg.payload = (this.bin === true ? buffer : buffer.toString());
            this.send(msg);
        }.bind(this)

        var attemptToPopCharSeparatedMessage = function(){
            var i = 0;
            while(i < this.rxBuffer.length){
                // Scan for separation characters
                if(this.rxBuffer[i] === this.splitChar){
                    var outputBuf;
                    // Include the message separation character?
                    outputBuf = this.rxBuffer.slice(0,(this.addchar ? i+1 : i));
                    sendIncomingBuffer(outputBuf);
                    this.rxBuffer = this.rxBuffer.slice(i+1);
                    return true;
                }
                i++;
            }
            // No messages to send in the buffer
            return false;
        }.bind(this)

        var attemptToPopLengthSeparatedMessage = function(){
            var separationLength = parseInt(this.newline);
            if( separationLength === NaN ||
                this.rxBuffer.length < separationLength) { 
                return false; 
            }

            outputBuf = this.rxBuffer.slice(0,separationLength);
            sendIncomingBuffer(outputBuf);
            this.rxBuffer = this.rxBuffer.slice(separationLength);
            return true;
        }.bind(this)


        var serialDataRxFromBean = function(data, valid){
            if(valid === false) return;

            // Push new data to the buffer
            this.rxBuffer = Buffer.concat([this.rxBuffer,data]);

            switch(this.out) {
                case 'char':
                    while(attemptToPopCharSeparatedMessage());
                    break;
                case 'time':
                    if(this.serialTimeout === null){
                        var timeout = parseInt(this.newline);
                        timeout = (timeout === NaN) ? 0 : timeout;

                        this.serialTimeout = setTimeout(function(){
                            sendIncomingBuffer(this.rxBuffer);
                            this.rxBuffer = new Buffer(0);
                            this.serialTimeout = null;
                        }.bind(this),timeout);
                    }
                    break;
                case 'count':
                    while(attemptToPopLengthSeparatedMessage());
                    break;
                default:
                    
            }

        }.bind(this);

        this.beanConfig.on("connected", function() {
            this.beanConfig.device.on('serial',serialDataRxFromBean);
        }.bind(this));

        this.on("close", function(done) {
            clearTimeout(this.serialTimeout);
            done();
        });

        beanNode.configureBeanStatuses.call(this);
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("bean serial",BeanSerialNode);

}
