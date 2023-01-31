const Web3 = require("web3");
const Eth = require("ethjs");
const eth = new Eth(new Web3.providers.HttpProvider("YOUR_NODE_URL"));

// Function to create a transaction object
async function createTransaction(toAddress, value, privateKey) {
  const nonce = await eth.getTransactionCount(eth.coinbase);
  const gasPrice = await eth.gasPrice();
  const gasLimit = 21000;

  const rawTransaction = {
    nonce,
    gasPrice: gasPrice.toString(16),
    gasLimit: gasLimit.toString(16),
    to: toAddress,
    value: value.toString(16),
    data: "",
  };

  return rawTransaction;
}

// Function to sign a transaction
async function signTransaction(rawTransaction, privateKey) {
  const signedTransaction = eth.signTransaction(rawTransaction, privateKey);
  return signedTransaction;
}

// Function to broadcast a signed transaction
async function broadcastTransaction(signedTransaction) {
  eth.sendRawTransaction(signedTransaction, (err, hash) => {
    if (!err) {
      console.log(`Transaction broadcasted: ${hash}`);
    } else {
      console.log(`Transaction broadcast failed: ${err}`);
    }
  });
}

// Example usage
async function sendTransactionExample() {
  const toAddress = "0x1234567890123456789012345678901234567890";
  const value = "1000000000000000000";
  const privateKey =
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef";

  const rawTransaction = await createTransaction(toAddress, value, privateKey);
  const signedTransaction = await signTransaction(rawTransaction, privateKey);
  await broadcastTransaction(signedTransaction);
}

sendTransactionExample();
