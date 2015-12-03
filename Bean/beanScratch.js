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

    function BeanReadScratchNode(n) {
        RED.nodes.createNode(this, n);
        this.bean = RED.nodes.getNode(n.bean);

        this.readOne = n.readOne;
        this.property1 = n.property1 || 'scratch1';
        this.type1 = n.type1 || 'string';

        this.readTwo = n.readTwo;
        this.property2 = n.property2 || 'scratch2';
        this.type2 = n.type2 || 'string';

        this.readThree = n.readThree;
        this.property3 = n.property3 || 'scratch3';
        this.type3 = n.type3 || 'string';

        this.readFour = n.readFour;
        this.property4 = n.property4 || 'scratch4';
        this.type4 = n.type4 || 'string';

        this.readFive = n.readFive;
        this.property5 = n.property5 || 'scratch5';
        this.type5 = n.type5 || 'string';

        var node = this;

        this.on('input', function(msg) {
            if (node.bean) {
                var tasks = [];
                if (node.readOne) {
                    tasks.push(function(callback) {
                        node.bean.readOne(function(error, data) {
                            if (error) {
                                node.error(error);
                            } else {
                                msg[node.property1] = valueOf(data, node.type1);
                            }
                            callback(null);
                        });
                    });
                }
                if (node.readTwo) {
                    tasks.push(function(callback) {
                        node.bean.readTwo(function(error, data) {
                            if (error) {
                                node.error(error);
                            } else {
                                msg[node.property2] = valueOf(data, node.type2);
                            }
                            callback(null);
                        });
                    });
                }
                if (node.readThree) {
                    tasks.push(function(callback) {
                        node.bean.readThree(function(error, data) {
                            if (error) {
                                node.error(error);
                            } else {
                                msg[node.property3] = valueOf(data, node.type3);
                            }
                            callback(null);
                        });
                    });
                }
                if (node.readFour) {
                    tasks.push(function(callback) {
                        node.bean.readFour(function(error, data) {
                            if (error) {
                                node.error(error);
                            } else {
                                msg[node.property4] = valueOf(data, node.type4);
                            }
                            callback(null);
                        });
                    });
                }
                if (node.readFive) {
                    tasks.push(function(callback) {
                        node.bean.readFive(function(error, data) {
                            if (error) {
                                node.error(error);
                            } else {
                                msg[node.property5] = valueOf(data, node.type5);
                            }
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
            } else {
                node.error('Read scratch node is not configured');
            }
        });

        var valueOf = function(data, type) {
            if (data && data.length >= 2) {
                if (type == 'buffer') {
                    return new Buffer(data);
                } else if (type == 'number') {
                    return data.readUInt32LE(0);
                } else {
                    return data.toString('utf8');
                }
            } else {
                return null;
            }
        }

        if (this.bean) {
            this.beanConfig = this.bean; // status mixin assumes `beanConfig` property exists
            beanStatus.configureBeanStatuses.call(this);
        }
    }
    RED.nodes.registerType('read scratch', BeanReadScratchNode);

    function BeanWriteScratchNode(n) {
        RED.nodes.createNode(this, n);
        this.bean = RED.nodes.getNode(n.bean);
        this.msgProperty = n.msgProperty || 'payload';
        this.writeMethod = n.writeMethod || 'writeOne';

        var node = this;

        this.on('input', function(msg) {
            if (node.bean) {
                if (node.msgProperty in msg) {
                    var buffer = bufferize(msg[node.msgProperty]);
                    node.bean[node.writeMethod](buffer, function() {
                        node.send(msg);
                    });
                } else {
                    node.warn('Missing message property [' + node.msgProperty + ']');
                }
            } else {
                node.error('Write scratch node is not configured');
            }
        });

        var bufferize = function(data) {
            if (data == null) {
                return new Buffer(0);
            } else if (Buffer.isBuffer(data)) {
                return new Buffer(data);
            } else {
                var number = Number(data);
                if (isNaN(number)) {
                    return new Buffer(data, 'utf8');
                } else {
                    var buffer = new Buffer(4);
                    buffer.writeUInt32LE(Number(data), 0);

                    return buffer;
                }
            }
        }

        if (this.bean) {
            this.beanConfig = this.bean; // status mixin assumes `beanConfig` property exists
            beanStatus.configureBeanStatuses.call(this);
        }
    }
    RED.nodes.registerType('write scratch', BeanWriteScratchNode);
}
