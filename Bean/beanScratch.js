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
    var async = require('async');
    var beanStatus = require('./beanNodeStatusMixin.js');

    function BeanScratchCharacteristicsNode(n) {
        RED.nodes.createNode(this, n);
        this.bean = RED.nodes.getNode(n.bean);

        this.scratch1 = n.scratch1;
        this.property1 = n.property1 || 'scratch1';
        this.type1 = n.type1 || 'string';

        this.scratch2 = n.scratch2;
        this.property2 = n.property2 || 'scratch2';
        this.type2 = n.type2 || 'string';

        this.scratch3 = n.scratch3;
        this.property3 = n.property3 || 'scratch3';
        this.type3 = n.type3 || 'string';

        this.scratch4 = n.scratch4;
        this.property4 = n.property4 || 'scratch4';
        this.type4 = n.type4 || 'string';

        this.scratch5 = n.scratch5;
        this.property5 = n.property5 || 'scratch5';
        this.type5 = n.type5 || 'string';

        var node = this;

        this.on('input', function(msg) {
            if (node.bean) {
                // force connection
                node.bean.requestTemp(function() {});

                if (node.bean._isConnected()) {
                    var tasks = [];
                    if (node.scratch1) {
                        tasks.push(function(callback) {
                            node.bean.device.readOne(function(data) {
                                msg[node.property1] = valueOf(data, node.type1);
                                callback(null);
                            });
                        });
                    }
                    if (node.scratch2) {
                        tasks.push(function(callback) {
                            node.bean.device.readTwo(function(data) {
                                msg[node.property2] = valueOf(data, node.type2);
                                callback(null);
                            });
                        });
                    }
                    if (node.scratch3) {
                        tasks.push(function(callback) {
                            node.bean.device.readThree(function(data) {
                                msg[node.property3] = valueOf(data, node.type3);
                                callback(null);
                            });
                        });
                    }
                    if (node.scratch4) {
                        tasks.push(function(callback) {
                            node.bean.device.readFour(function(data) {
                                msg[node.property4] = valueOf(data, node.type4);
                                callback(null);
                            });
                        });
                    }
                    if (node.scratch5) {
                        tasks.push(function(callback) {
                            node.bean.device.readFive(function(data) {
                                msg[node.property5] = valueOf(data, node.type5);
                                callback(null);
                            });
                        });
                    }

                    async.series(tasks, function(error, results) {
                        if (error) {
                            node.error(error);
                        } else {
                            node.send(msg);
                        }
                    });
                }
            }
        });

        var valueOf = function(data, type) {
            if (type == 'buffer') {
                return data;
            } else if (type == 'number') {
                return data.readUInt32LE(0);
            } else {
                return data.toString('utf8');
            }
        }

        this.beanConfig = this.bean; // status mixin assumes `beanConfig` property exists
        beanStatus.configureBeanStatuses.call(this);
    }
    RED.nodes.registerType('bean scratch', BeanScratchCharacteristicsNode);
}
