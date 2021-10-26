/*** events.ts
*   This class file defines the records we want to capture for eventual storage and retrieval from the DB
*   The classes here will also have helpful methods to allow you to use the classes more easily
*   
***/
type PriceTier = number;
    

export class CollateralTiers {

    totals: Record<PriceTier,number> = {};

    public AddCollateralTierRecord(_price: number, _amt: number): void {
        // Convert liquidation price into 10cent tiers
        let tier = Math.ceil(_price * 10 );
        console.log(`Adding ${_amt} for tier ${tier}`);
        
        let amt = this.totals[tier] ? this.totals[tier] + _amt : _amt ;
        this.totals[tier]=amt;
    }

    public RetrieveCollateralTierRecords(): any {
        return this.totals
    }
    
    public RetrieveCollateralTierRecord(_num: number): number {
        return this.totals[_num]
    }
}


export class BorrowStableEvent {
    public block: number;
    public amount: number;
    public address: string;

    constructor(_block: number, _amt: number, _addr: string) {
        this.block = _block;
        this.amount = _amt;
        this.address = _addr;
    }

}