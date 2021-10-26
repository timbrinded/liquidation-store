import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as dotenv from "dotenv";
import axios, { AxiosResponse } from 'axios';
import { BorrowStableEvent, CollateralTiers } from './events';

export const listenToTerra = (borrowEvents: BorrowStableEvent[], tiers: CollateralTiers) => {
    var ws = new WebSocket('wss://observer.terra.dev');

    ws.onopen = function () {
        let chain: string = "columbus-5";
        process.stdout.write("Connected to websocket.: ");
        process.stdout.write(` Subscribing to... ${chain}.....`);
        // subscribe to new_block events
        ws.send(JSON.stringify({ subscribe: "new_block", chain_id: chain }));
        process.stdout.write("......Subscribed. \n");
    };

    ws.onmessage = function (message) {
        const jsonResult = JSON.parse(message.data.toString());
        const height = jsonResult.data.block.header.height;

        if (height) {
            console.log(`Message for block ${height} has been received.`);
        }

        // Process each transacction in block
        const txnArray = jsonResult.data.txs;
        for (let item of txnArray) {

            // Filter and Parse valid txns
            if (item.code == 0) {
                const raw = JSON.parse(item.raw_log);
                const events = raw[0].events;
                let filtered = events.filter((data: any) => data.type == "wasm");
                let borrower, amount;

                // Process raw logs for relevant messages
                if (filtered.length > 0) {
                    let txn = filtered[0].attributes;
                    //console.log(txn);

                    //Handle borrow_stable message
                    if (txn.some((item: any) => item.value === "borrow_stable")) {
                        for (let item of txn) {
                            switch (item.key) {
                                case "borrower": borrower = item.value; break;
                                case "borrow_amount": amount = item.value; break;
                                default: break;
                            }
                        }
                        console.log(`The user ${borrower} has just borrowed ${amount / 1_000_000} UST`);
                        const evt = new BorrowStableEvent(height, amount / 1_000_000, borrower);
                        borrowEvents.push(evt);
                        console.log("===== Borrow Event Added =====");
                        console.log(borrowEvents[borrowEvents.length - 1]);
                        
                        // Determine LUNA price
                        const lunaPrice = getLunaPrice(raw);

                        // Kick-off async request to find out user collateral balance for this block
                        queryUserBalance(evt,lunaPrice, tiers);

                    }

                    //TODO: Handle repay_stable
                    if (txn.some((item: any) => item.value === "repay_stable")) {

                    }

                    //TODO: Handle deposit_stable
                    if (txn.some((item: any) => item.value === "deposit_stable")) {

                    }
                }
            }
        }
    };

    ws.onclose = function (e) {
        console.log('websocket closed. reopening...');
        setTimeout(function () {
            listenToTerra(borrowEvents,tiers);
        }, 1000);
    };
}

function queryUserBalance(_evt: BorrowStableEvent, _collatPrice: number, tiers: CollateralTiers): void {
    const host = "https://lcd.terra.dev/";
    const msg = `{ "borrower": { "address": "${_evt.address}" } }`;
    const contract_address = "terra1ptjp2vfjrwh0j0faj9r6katm640kgjxnwwq9kn";
    const request = `${host}wasm/contracts/${contract_address}/store?query_msg=${msg}`;

    axios.get(request)
        .then(function (response: any) {
            // TODO: - Use _collatPrice parameter and this retrieved balance to work out liquidation price
            //       - Format this response and add it as a collateral balance snapshot
            //       - Use balance snapshot and block height to create a update for Collateral Tier record
            console.log("===== User Balance =====");
            let resp = response.data;
            console.log(resp);
            let string = JSON.stringify(resp);
            let json = JSON.parse(string);
            let luna = json.result.balance / 1_000_000;
            let deposit = luna * _collatPrice ;

            let liquidationPrice = calculateLiquidationPrice(_evt.amount,deposit);
            console.log(`Liquidation price calculated to be: ${liquidationPrice}`);
            tiers.AddCollateralTierRecord(liquidationPrice,luna);

        })
        .catch(function (error: any) {
            // handle error
            console.log(error);
        });
}

// TODO: This function gets passed in a blob of JSON and returns the calculated LUNA price
//       For that block. Should use normal array filtering methods for `exchange_rates`.
function getLunaPrice(_blob: string): number {
    let rate = 44.430960493928318897;
    // Currently hardcoded
    return rate
}

// Liquidation price for bLUNA
// Collateral liquidates when LTV reaches 60% 
//      i.e. loan > deposit * 0.6
function calculateLiquidationPrice(_loan: number, _deposit: number): number {
    return _loan / (_deposit * 0.6)
}

