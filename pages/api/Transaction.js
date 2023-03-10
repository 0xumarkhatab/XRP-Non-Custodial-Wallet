const { Alchemy } = require("alchemy-sdk");
const { alchemyApps } = require("./data");
import Web3 from "web3";
import { testnetProviders } from "./data";
const xrpl = require("xrpl")
export async function getTransactions(network, address, setter) {
  const config = alchemyApps[network];
  const alchemy = new Alchemy(config);

  const to_trxs = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toAddress: address,
    category: ["external", "internal", "erc20", "erc721", "erc1155"],
  });
  const from_trxs = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    fromAddress: address,
    category: ["external", "internal", "erc20", "erc721", "erc1155"],
  });
  let arr = [...to_trxs.transfers];
  arr.concat({ ...from_trxs.transfers });
  arr.reverse();
  if (setter) setter(arr);
  // console.log("transactions are ", arr);

  return arr;
}

export async function getWeb3(chain_name) {
  let HttpProviderURL = testnetProviders[chain_name];
  if (!HttpProviderURL) {
    return null;
  }

  let _provider = new Web3.providers.HttpProvider(HttpProviderURL);
  let _web3 = new Web3(_provider);

  return _web3;
}

export async function prepareTransaction(client, senderWallet, toAddress,
  value,
  selectedChain,
  setter
) {
  // Prepare transaction -------------------------------------------------------
  const prepared = await client.autofill({
    "TransactionType": "Payment",
    "Account": senderWallet.address,
    "Amount": xrpl.xrpToDrops(value),
    "Destination": toAddress
  })
  console.log("transaction obj", prepared);
  // const max_ledger = prepared.LastLedgerSequence
  // console.log("Prepared transaction instructions:", prepared)
  // console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP")
  // console.log("Transaction expires after ledger:", max_ledger)




  setter(prepared);
  return prepared;
}
export async function _signTransactionAndBroadcast(
  transactionObject, xrplClient,
  wallet,
  selectedChain,
  finisher,
  Toaster
) {

  // Sign prepared instructions ------------------------------------------------
  const signed = wallet.sign(transactionObject)
  console.log("Identifying hash:", signed.hash)
  console.log("Signed blob:", signed.tx_blob)

  Toaster({
    title: `Transaction Signed`,
    description: `Broadcasting it now `,
    type: "info",
  });
  setTimeout(() => {
    broadcastTransaction(signed, xrplClient, finisher, Toaster, selectedChain);

  }, 2000);

  return signed;

}

// Function to broadcast the signed transaction
export async function broadcastTransaction(
  signedTransaction, client,
  finisher,
  Toast,
  selectedChain
) {

  try {
    // Submit signed blob --------------------------------------------------------
    Toast({
      title: `Transaction initiated`,
      description: `Keep navigating through the wallet and we will perform your transaction in the background`,
      type: "info",
    });
    const tx = await client.submitAndWait(signedTransaction.tx_blob)
    // Check transaction results -------------------------------------------------
    console.log("Transaction result:", tx.result.meta.TransactionResult)
    console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
    Toast({
      title: `Funds Transferred`,
      description: `Funds transferred successfully.`,
      type: "success",
    });
    finisher();


  }
  catch (e) {
    Toast({
      title: `Transaction failed`,
      description: e,
      type: "error",
    });

  }

}
