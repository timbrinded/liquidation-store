/*****
 * datastore.ts
 *   - This file is to contain instantiation and connection of a SQL DB or otherwise
 *   - Haven't decided yet best course of action, given that blockchain is our DB
 *   - May prefer to follow event source model and read events into memory to rebuild state on startup
 * 
 */

export class DataStore {

    // Connect to borrow/repay/query_balance events
    public static async write(path: string, data: Object): Promise<any> {

    }

    // Connect up to REST endpoint
    public static async list(path: string): Promise<any> {

    }
}