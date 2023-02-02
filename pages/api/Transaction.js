const { Alchemy } = require("alchemy-sdk");
const { alchemyApps } = require("./data");
import Web3 from "web3";
import { GoerliProviders } from "./data";
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
  let HttpProviderURL = GoerliProviders[chain_name];
  if (!HttpProviderURL) {
    return null;
  }

  let _provider = new Web3.providers.HttpProvider(HttpProviderURL);
  let _web3 = new Web3(_provider);

  return _web3;
}

export async function prepareTransaction(
  value,
  toAddress,
  selectedChain,
  setter
) {
  let web3 = await getWeb3(selectedChain);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 21000;

  const rawTransaction = {
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: toAddress,
    value: value,
  };
  setter(rawTransaction);
  return rawTransaction;
}
export async function _signTransactionAndBroadcast(
  transactionObject,
  privKey,
  selectedChain,
  setter,
  finisher,
  Toaster
) {
  let web3 = await getWeb3(selectedChain);
  console.log({
    transactionObject,
    privKey,
    selectedChain,
    setter,
    finisher,
    Toaster,
  });
  const signedTransaction = await web3.eth.accounts.signTransaction(
    transactionObject,
    privKey
  );
  setter(signedTransaction);
  broadcastTransaction(signedTransaction, finisher, Toaster, selectedChain);
  return signedTransaction;
}

// Function to broadcast the signed transaction
export async function broadcastTransaction(
  signedTransaction,
  finisher,
  Toast,
  selectedChain
) {
  let web3 = await getWeb3(selectedChain);
  if (!web3) return null;

  Toast({
    title: `Transaction initiated`,
    description: `Keep navigating through the wallet and we will perform your transaction in the background`,
    type: "info",
  });

  web3.eth
    .sendSignedTransaction(signedTransaction.rawTransaction)
    .once("transactionHash", (txHash) => {
      console.log(txHash);
      Toast({
        title: `Transaction Broadcast`,
        description: `Wating for confirmation...`,
        type: "info",
      });
    })
    .on("confirmation", (confirmationNumber, receipt) => {
      if (confirmationNumber <= 12)
        Toast({
          title: `Funds Transfer Progress`,
          description: `Transaction confirmed by ${confirmationNumber}/12 block(s)`,
          type: "info",
        });

      if (confirmationNumber == 12) {
        Toast({
          title: `Funds Transferred`,
          description: `Funds transferred successfully, block number: ${receipt.blockNumber}`,
          type: "success",
        });

        Toast(
          `Funds transferred successfully, block number: ${receipt.blockNumber}`
        );

        finisher();

        console.log(
          `Funds transferred successfully, block number: ${receipt.blockNumber}`
        );
      } else {
        return;
      }
    })
    .on("error", (error) => {
      Toast({
        title: `Transaction failed`,
        description: error,
        type: "error",
      });
    });
}
