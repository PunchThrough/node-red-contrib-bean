# LightBlue Bean nodes for node-red

Node-Red is a graphic flow-style programming environment based on node.js. The application runs as a server, and you manipulate functional "flows" from a web client. The server can be hosted on an inexpensive device like the Raspberry Pi. Flow's can be manipulated from the browser of the server device, on a separate computer client on the same network, and/or remotely over the internet.

Node-Red allows for third party nodes to be made and distributed as npm modules. This project is set of node-red nodes that allow for easy interfacing to the LightBlue Bean.

![](https://punchthrough.com/images/products/bean/node-red/Screen%20Shot%202015-01-25%20at%203.12.22%20PM.png)

## Installation

1. Install Node.js: http://nodejs.org/download/
1. Install Node-RED
    1. Download: https://github.com/node-red/node-red/archive/master.zip
    1. Unzip
    1. `cd node-red`
    1. `npm install`
1. Install Bean nodes: `npm install node-red-contrib-bean`

## Usage

1. `node red`
1. Open [http://localhost:1880](http://localhost:1880)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

0.0.1 : Initial Release

## Credits

Node-RED has been made possible by the hard work of Nick O'Leary @knolleary and Dave Conway-Jones @ceejay at IBM Emerging Technology. Much thanks to these guys and other supporters for developing this great new platform. 

## License

This SDK is covered under The MIT License. See LICENSE.txt for more details.
