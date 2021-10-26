# Description
This repo is a sample application for realtime monitoring of bonded LUNA liquidation prices on the Anchor protocol.
It connects to both the observer websocket service, as well as the terra.js LCD client.

# Instructions
## Installation
To install, first run:
```
npm i
```
To run the server, run the following in the base directory:
```
tsc
node ./dist/server/src/index.js
```
If you do not care about performance and want to be lazy, feel free to use `ts-node src/index.ts` instead however.

Lastly, if you wish to debug this, you can do so very easily in `vscode`.

*N.B. Observer service is a bit flakey of of late, if you receive 503/504 errors, try again later.*

## Usage
Once the server is running, you should see it ticking over the various blocks as they are being mined.
If any blocks contain the `borrow-stable` message, this will automatically be parsed and eventually added to the data store.

Looking at the console log you will be able to see all new borrow events identified and calculations performed. 
To inspect the tallied amounts, you can use your favourite way of calling REST endpoints. 

For convenience import the Postman collection `Anchor Liquidations.postman_collection.json` has been supplied with the available calls implemented.

# Features
* Connects to Terra Observer via websocket for real time feeds
* Performs on-chain contract queries via LCD client
* Provides REST interface for querying aggregated data
* Automatically calculates liquidation prices and stores them

### Calls
* `'\'` Initial Greeting
* `'borrows'` Return list of parsed `borrow-stable` events
* `'totals'` Return list of liquidation price tiers with accumulated volumes


### Caveat
The calculation here isn't actually very good. It compares new borrow events against total collateral deposited for that user.
As such the liquidation price is far smaller than it should be, because not all borrow events are being considered.

Furthermore this will only look at new events, whereas a true system should be walking back through the chain to build a true state of the world.

# Notes
* Lots of `TODO` in this repo. Most notably a distinct lack of tests and no permanant storage
* A production grade version of this system should be containerized and implement a recovery loop