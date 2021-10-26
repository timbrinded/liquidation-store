import * as express from "express";
import { listenToTerra } from "./client";
import {CollateralTiers, BorrowStableEvent} from "./events";



abstract class App {

    static get port(): number { return 3000 }

    static init(): any {

        switch (process.argv[2]) {

            // In case we want to have different operation modes
            case 'start-server':
                return App.start_server()
            default:
                return App.start_server()
        }
    }

    static start_server(): void {

        const app = express();
        let events: BorrowStableEvent[] = [];
        let tiers = new CollateralTiers();

        app.get("/", (req, res) => {
            res.send("Hello, welcome to the liquidation Store!");
        });

        app.get("/totals", (req, res) => {
            // Currently this is just looking at borrow events scraped from feed
            // TODO: Connect to our store of CollateralTiers: Map<string,number>
            let records = tiers.RetrieveCollateralTierRecords();
            res.send(JSON.stringify(records));
        });

        app.get("/borrows", (req, res) => {
            let json = JSON.stringify(events);
            res.send(json);
        });

        const port = process.env.PORT || 3000;

        app.listen(port, () => console.log(`REST server listening on PORT ${port}`));
        listenToTerra(events, tiers);
    }

    static display_help() { console.log('usage: index.ts [ start-server ]') }
}

App.init()