/*
The MIT License (MIT)

Copyright (c) 2015 Geoffrey Arnold

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

module.exports = function(RED) {
    'use strict';
    var beanStatus = require('./beanNodeStatusMixin.js');

    function BeanScratchCharacteristicsNode(n) {
        RED.nodes.createNode(this, n);
        this.bean = RED.nodes.getNode(n.bean);

        var node = this;

        this.on('input', function(msg) {
            if (node.bean) {
                // force connection
                node.bean.requestTemp(function() {});

                if (node.bean.isConnected()) {
                    node.bean.device.readOne(function(data) {
                        var value = data.toString('utf8');
                        node.log(value);
                        msg.scratch1 = value;

                        node.bean.device.readTwo(function(data) {
                            var value = data.readUInt32LE(0);
                            node.log(value);
                            msg.scratch2 = value;

                            node.send(msg);
                        });
                    });
                }
            }
        });

        this.beanConfig = this.bean; // required by status mixin
        beanStatus.configureBeanStatuses.call(this);
    }
    RED.nodes.registerType('bean scratch', BeanScratchCharacteristicsNode);
}
