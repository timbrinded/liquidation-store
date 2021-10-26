/**
 *  get.interface.ts
 *   
 *  To contain the interfaces for any requests or responses, so that we can be type safe
  */

export interface IBorrowerResponse {
    "borrower": string;
    "balance": number;
    "spendable": number;
}