const xrpl=require("xrpl")
export async function connectXRPL(setter) {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    let res = await client.connect()
    if (setter) {
        console.log("setting client");
        setter(client);
    }
    return client;

}
