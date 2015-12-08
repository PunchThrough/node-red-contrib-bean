# LightBlue Bean nodes for node-red

Node-Red is a graphic flow-style programming environment based on node.js. The application runs as a server, and you manipulate functional "flows" from a web client. The server can be hosted on an inexpensive device like the Raspberry Pi. Flows can be manipulated from the browser of the server device, on a separate computer client on the same network, and/or remotely over the internet.

Node-Red allows for third party nodes to be made and distributed as npm modules. This project is set of node-red nodes that allow for easy interfacing to the LightBlue Bean.

![](http://legacy.punchthrough.com/images/products/bean/node-red/Screen%20Shot%202015-01-25%20at%203.12.22%20PM.png)

## Installation

1. Install Node.js
    - Linux Binaries: [32-bit](https://nodejs.org/dist/v0.12.7/node-v0.12.7-linux-x86.tar.gz) or [64-bit](https://nodejs.org/dist/v0.12.7/node-v0.12.7-linux-x64.tar.gz)
    - Max OS X Installer: [Universal](https://nodejs.org/dist/v0.12.7/node-v0.12.7.pkg)
    - [Raspberry Pi](http://nodered.org/docs/hardware/raspberrypi.html)
    - [BeagleBone Black](http://nodered.org/docs/hardware/beagleboneblack.html)
1. Install Node-RED: `sudo npm install -g node-red`
1. Install Bean nodes
    1. `mkdir -p ~/.node-red/node_modules`
    1. `npm install --prefix ~/.node-red node-red-contrib-bean` 

## Usage

1. `sudo node-red`
1. Open [http://localhost:1880](http://localhost:1880)

## Updating

1. Update Node-RED: `sudo npm update -g node-red`
1. Update Bean nodes
    1. `npm update --prefix ~/.node-red node-red-contrib-bean`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

- 0.5.2 : Fix Serial node to add the split char on outgoing messages
- 0.5.1 : Fix Read scratch node
- 0.5.0 : Update README links and package.json
- 0.4.4 : Typo fix that was affecting latest versions of noble
- 0.4.3 : Temporary fix to prevent bean nodes from hanging at "searching...". This will be resolved once ble-bean dependancy is updated to use the latest nobleDevice dependancy. 
- 0.4.2 : Bug fix for a crash caused by node interaction during "connecting" state 
- 0.4.1 : Aesthetic changes to node appearance 
- 0.4.0 : Scratch characteristic nodes
- 0.3.2 : Timeout mode for serial node
- 0.3.1 : Option to send basic color names in string form to the LED node. ex: "Red"
- 0.3.0 : Ability to search for nearby Beans in configuration 
- 0.2.0 : Better logging and reporting of errors, more accurate Bean connection timeout
- 0.1.0 : More robust connection routines, fixed some crashes during deployment, better how-to-use text
- 0.0.1 : Initial Release

## Authors

* Ray Kampmeier [@raykamp](https://github.com/raykamp)
* Simone Giertz [@simsalapim](https://github.com/simsalapim)
* Geoffrey Arnold [@garnold](https://github.com/garnold)
* Ashish Derhgawen [@aderhgawen](http://github.com/aderhgawen)
* Stephen Stack [@swstack](https://github.com/swstack)

## Credits

Node-RED has been made possible by the hard work of Nick O'Leary @knolleary and Dave Conway-Jones @ceejay at IBM Emerging Technology. Much thanks to them and other supporters for advancing this platform. 

## License

This SDK is covered under The MIT License. See LICENSE.txt for more details.
