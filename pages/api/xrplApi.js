import { testnetProviders } from "./data";

const xrpl=require("xrpl")
export async function connectXRPL(setter,chain) {
    const client = new xrpl.Client(testnetProviders[chain?chain:"testnet"]);
    let res = await client.connect()
    if (setter) {
        // console.log("setting client");
        setter(client);
    }
    return client;

}
