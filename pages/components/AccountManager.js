import {
  Box,
  Button,
  Heading,
  HStack,
  Img,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import AccountInstance, { getMinimalAddress } from "./AccountInstance";
import Web3 from "web3";
import * as bip39 from "@scure/bip39";
import { hdkey } from "ethereumjs-wallet";
import ModalWrapper from "./ModalWrapper";
import PaymentMethodInstance from "./PaymentMethodInstance";
import { parseEther } from "ethers/lib/utils";
import { Alchemy, Network } from "alchemy-sdk";
import TransactionInstance from "./TransactionInstance";

import AssetTemplate from "./AssetTemplate";

function capitalize(str) {
  let _str = String(str);
  _str = _str.toUpperCase()[0] + _str.slice(1);
  return _str;
}

// funtction to get Transactions of an address on a 'network' chain

async function getTransactions(network, address, setter) {
  const config = alchemyApps[network];
  console.log({ config });
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

// Data portion starts here

let tokens = {
  mainnet: [
    {
      name: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
    {
      name: "BNB",
      address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    },
    {
      name: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    {
      name: "BUSD",
      address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    },

    {
      name: "MATIC",
      address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    },

    {
      name: "OKB",
      address: "0x75231F58b43240C9718Dd58B4967c5114342a86c",
    },

    {
      name: "stETH",
      address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    },
    {
      name: "anyLTC",
      address: "0x0aBCFbfA8e3Fda8B7FBA18721Caf7d5cf55cF5f5",
    },
    {
      name: "SHIB",
      address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    },
    {
      name: "THETA",
      address: "0x3883f5e181fccaF8410FA61e12b59BAd963fb645",
    },
  ],

  goerli: [
    {
      name: "WBTC",
      address: "0xD8c4F6e84D6f6A0D39d25a3F42F15351303a6Af5",
    },

    {
      name: "WETH",
      address: "0x695364ffAA20F205e337f9e6226e5e22525838d9",
    },
    {
      name: "USDC",
      address: "0x8C1170519FE80dc2d56eB95B073D5C3203208985",
    },
  ],
};

let alchemyApps = {
  goerli: {
    apiKey: "OINpsQZSN0z6VRLC1jL5YYrLmQiYGARE",
    network: Network.ETH_GOERLI,
  },

  mainnet: {
    apiKey: "Ye6S888IuNTfAGGPQf2C_ZRvXJD9YQdQ",
    network: Network.ETH_MAINNET,
  },
};
let chains = [
  {
    name: "mainnet",
    chain_id: 1,
  },
  {
    name: "goerli",
    chain_id: 5,
  },
];

let providers = {
  goerli: "https://goerli.infura.io/v3/685daa6fa7f94b4b89cdc6d7c5a8639e",
  mainnet: "https://mainnet.infura.io/v3/685daa6fa7f94b4b89cdc6d7c5a8639e",
};

let Assets = [];

let buyMethods = [
  {
    title: "Coinbase Pay",
    description:
      "You can easily buy or transfer crypto with your Coinbase account.",
    logo: `https://uploads-ssl.webflow.com/5f9a1900790900e2b7f25ba1/60f6a9afaba0af0029922d6d_Coinbase%20Wallet.png`,
  },

  {
    title: "Transak",
    description:
      "Transak supports credit & debit cards, Apple Pay, MobiKwik, and bank transfers (depending on location) in 100+ countries. ETH deposits directly into your MetaMask account.",
    logo: `https://mms.businesswire.com/media/20220425005854/en/1431513/22/logo_transparent.jpg`,
  },
  {
    title: "MoonPay",
    description:
      "MoonPay supports popular payment methods, including Visa, Mastercard, Apple / Google / Samsung Pay, and bank transfers in 145+ countries. Tokens deposit into your MetaMask account.",
    logo: `https://www.moonpay.com/assets/logo-full-purple.svg`,
  },
  {
    title: "Wyre",
    description:
      "Easy onboarding for purchases up to $ 1000. Fast interactive high limit purchase verification. Supports Debit/Credit Card, Apple Pay, Bank Transfers. Available in 100+ countries. Tokens deposit into your MetaMask Account",
    logo: `https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_e97458783e493c9b8e5e8da0aaa92dfd/wyre.png`,
  },
];
let currencyOf = {
  goerli: "ETH",
  mainnet: "ETH",
};

// Data portion ends here !

let httpProviderUrl = providers[chains[0].name];
let _provider = new Web3.providers.HttpProvider(httpProviderUrl);
let _web3 = new Web3(_provider);

function AccountManager({ mnemonic }) {
  const [selectedChain, setSelectedChain] = useState(chains[0].name);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [assets, setAssets] = useState(Assets);
  const [accounts, setAccounts] = useState([]);
  const [buyIntent, setBuyIntent] = useState(false);
  const [sendIntent, setSendIntent] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferAddress, setTransferAddress] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [transactionObject, setTransactionObject] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const web3 = useRef(null);
  const toast = useToast();
  function Toast(message) {
    toast({
      title: message.title,
      description: message.description,
      status: message.type,
      duration: 2000,
      isClosable: true,
    });
  }

  async function checkBalance(address) {
    if (!address) return 0;
    if (!web3 || !web3.current) {
      let httpProviderUrl = providers[selectedChain];
      let _provider = new Web3.providers.HttpProvider(httpProviderUrl);
      let _web3 = new Web3(_provider);
      web3.current = _web3;
    }
    let balance = await web3.current?.eth.getBalance(address);
    if (balance == undefined) return 0;
    balance = parseFloat(parseInt(balance) / 10 ** 18).toFixed(4);
    if (balance.toString() === "0.0000") {
      balance = 0;
    }
    return balance;
  }

  function arrayToPrivateKey(array_) {
    return Array.from(array_, (byte) => {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");
  }
  const generateAccounts = async (_seedPhrase) => {
    // console.log("generating accounts");
    const seed = bip39.mnemonicToSeedSync(_seedPhrase);
    const hdwallet = hdkey.fromMasterSeed(seed);
    const wallet_hdpath = "m/44'/60'/0'/0/";
    let _accounts = [];
    for (let i = 0; i < 3; i++) {
      const wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
      const _address = "0x" + wallet.getAddress().toString("hex");
      let privKey = arrayToPrivateKey(wallet.getPrivateKey());
      let balance = await checkBalance(_address);
      let _accountsObject = {
        name: "Account " + (i + 1),
        avatar: "./account.png",
        balance,
        address: _address,
        privateKey: privKey,
      };
      _accounts.push(_accountsObject);
    }
    // console.log("setting first account");

    setSelectedAccount(_accounts[0]);
    setAccounts(_accounts);
    return _accounts;
  };

  async function updateAssets() {
    if (!selectedAccount || !selectedChain) {
      return 0;
    }

    loadingMessage == null && setLoadingMessage("Loading");
    httpProviderUrl = providers[selectedChain];
    _provider = new Web3.providers.HttpProvider(httpProviderUrl);
    _web3 = new Web3(_provider);
    web3.current = _web3;
    // fetching latest transactions of selected account
    let trxs = await getTransactions(
      selectedChain,
      selectedAccount.address,
      setTransactions
    );

    // fetching balance of the user
    let balance = await checkBalance(selectedAccount.address);
    setSelectedAccount({ ...selectedAccount, balance });
    setTimeout(() => {
      setLoadingMessage(null);
    }, 1000);
  }

  async function prepareTransaction(value, toAddress) {
    const gasPrice = await web3.current.eth.getGasPrice();
    const gasLimit = 21000;

    const rawTransaction = {
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      to: toAddress,
      value: value,
    };
    setTransactionObject(rawTransaction);
    return rawTransaction;
  }
  async function transferMoney() {
    await prepareTransaction(
      parseEther(transferAmount.toString()),
      transferAddress
    );
  }
  async function signTransaction() {
    setSendIntent(false);
    setTransactionObject(null);
    _signTransaction(selectedAccount.privateKey);
  }
  async function _signTransaction(privKey) {
    const signedTransaction = await web3.current.eth.accounts.signTransaction(
      transactionObject,
      privKey
    );
    setTransactionObject(signedTransaction);
    broadcastTransaction(signedTransaction);
    return signedTransaction;
  }

  // Function to broadcast the signed transaction
  async function broadcastTransaction(signedTransaction) {
    Toast({
      title: `Transaction initiated`,
      description: `Broadcasting it now !`,
      type: "info",
    });

    web3.current.eth
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

          setTimeout(() => {
            setLoadingMessage(null);
            setTransactionObject(null);
            setSendIntent(false);
          }, 1000);
          updateAssets();
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

  // use Effects
  useEffect(() => {
    updateAssets();
  }, [selectedChain]);

  useEffect(() => {
    setLoadingMessage("Setting up ");
    generateAccounts(mnemonic);
  }, []);
  useEffect(() => {
    if (selectedChain && selectedAccount) {
      loadingMessage != null && setLoadingMessage(null);
    }
  }, [selectedAccount, selectedChain]);

  useEffect(() => {
    if (!selectedAccount || !selectedAccount.address) return;
    getTransactions(selectedChain, selectedAccount.address, setTransactions);
  }, [selectedAccount]);

  return (
    <VStack spacing={5}>
      {/*  Top Bar */}
      <>
        <HStack width={"40vw"} justify={"space-between"}>
          {/* Wallet logo */}
          <Link href={"#"}>
            <Img
              height={"50px"}
              width={"50px"}
              borderRadius={"50%"}
              src={"./logo.PNG"}
            />
          </Link>
          {/* Networks Selection */}
          <Box padding={"20px"} fontWeight={"500"}>
            <select
              style={{
                background: "transparent",
                color: "white",
                cursor: "pointer",
                padding: "5px",
                borderRadius: "20px",
              }}
              onChange={async (e) => {
                setLoadingMessage("Switching to " + capitalize(e.target.value));
                setSelectedChain(e.target.value);
              }}
              placeholder={capitalize(selectedChain)}
            >
              {chains.map((chain) => {
                return (
                  <option
                    style={{
                      background: "black",
                      color: "white",
                      cursor: "pointer",
                    }}
                    key={"chain" + chain.name}
                    value={chain.name}
                  >
                    {capitalize(chain.name)}
                  </option>
                );
              })}
            </select>
          </Box>
          {/* Accounts Selection */}
          <Box>
            <Button
              _hover={{ bg: "transparent" }}
              bg={"transparent"}
              onClick={() => setShowAccounts(true)}
            >
              <Img
                height={8}
                src={selectedAccount?.avatar}
                borderRadius={"50%"}
              />
            </Button>

            {showAccounts && (
              <>
                <ModalWrapper>
                  <VStack
                    height={"75vh"}
                    position={"absolute"}
                    zIndex={2}
                    bg={"white"}
                    width={"40vw"}
                    borderRadius={"20px"}
                    paddingTop={"5vh"}
                  >
                    {accounts?.map((account) => {
                      return (
                        <AccountInstance
                          selector={async (account) => {
                            setShowAccounts(false);
                            setLoadingMessage("Switching Account");
                            let balance = await checkBalance(account.address);
                            setLoadingMessage("Getting account details");

                            setSelectedAccount({ ...account, balance });
                            setTimeout(() => {
                              setLoadingMessage(null);
                            }, 2000);
                          }}
                          copyable={false}
                          account={account}
                        />
                      );
                    })}
                    <Button
                      colorScheme={"red"}
                      onClick={() => setShowAccounts(false)}
                    >
                      Close
                    </Button>
                  </VStack>
                </ModalWrapper>
              </>
            )}
          </Box>
        </HStack>
        <hr style={{ content: "", width: "20vw" }} />
      </>

      {loadingMessage != null ? (
        <VStack align={"center"} width={"50vw"} height={"80vw"} spacing={10}>
          <Spinner
            thickness="5px"
            speed="0.5s"
            emptyColor="gray.200"
            color="green.500"
            size="xl"
          />
          <Heading>{loadingMessage}</Heading>
        </VStack>
      ) : (
        <>
          <HStack width={"40vw"} justify={"space-between"}>
            <HStack
              onClick={() => {
                setIsConnected((prev) => !prev);
                Toast({
                  title: !isConnected ? `Connected` : "Disconnected",
                  description: `Current website is connected to the wallet`,
                  type: !isConnected ? "success" : "error",
                });
              }}
              cursor={"pointer"}
              padding={"10px"}
              borderRadius={"20px"}
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
            >
              <Img
                borderRadius={"50%"}
                src={`./${!isConnected ? "dis" : ""}connectSymbol.png`}
                height={4}
              />
              <Text> {isConnected ? "Connected" : "Connect Now"}</Text>
            </HStack>
            <AccountInstance
              selector={() => {
                console.log("selecting account !");
              }}
              size={"sm"}
              hover_bg={"rgba(255,255,255,0.4)"}
              color={"white"}
              copyable={true}
              account={selectedAccount}
            />
            <Button
              _hover={{ bg: "transparent" }}
              bg={"transparent"}
              onClick={() => setShowAccounts(true)}
            >
              <Img
                bg={"white"}
                bgClip={"border-box"}
                border={"0.001px solid black"}
                borderRadius={"50%"}
                height={8}
                src="http://cdn.onlinewebfonts.com/svg/img_549109.png"
              />
            </Button>
          </HStack>

          <VStack spacing={10}>
            <Img height={8} src={selectedAccount?.avatar} />
            <Heading>{selectedAccount?.balance} ETH</Heading>
            <HStack>
              <Button colorScheme={"blue"} onClick={() => setBuyIntent(true)}>
                Buy
              </Button>
              {buyIntent && (
                <ModalWrapper>
                  <VStack
                    height={"75vh"}
                    position={"absolute"}
                    zIndex={2}
                    bg={"white"}
                    width={"40vw"}
                    borderRadius={"20px"}
                    paddingTop={"5vh"}
                    overflowY={"scroll"}
                    spacing={10}
                    paddingBottom={"20px"}
                  >
                    {buyMethods.map((item) => {
                      return (
                        <PaymentMethodInstance
                          payment={item}
                          key={"payment" + item.title}
                        />
                      );
                    })}
                    <Button
                      colorScheme={"red"}
                      padding={"20px"}
                      onClick={() => setBuyIntent(false)}
                    >
                      Close
                    </Button>
                  </VStack>
                </ModalWrapper>
              )}
              <Button
                colorScheme={"blue"}
                onClick={() => {
                  setSendIntent(true);
                }}
              >
                Send
              </Button>
              {sendIntent && transactionObject == null && (
                <ModalWrapper>
                  <VStack
                    height={"75vh"}
                    position={"absolute"}
                    zIndex={2}
                    bg={"white"}
                    color={"black"}
                    width={"40vw"}
                    borderRadius={"20px"}
                    paddingTop={"5vh"}
                    overflowY={"scroll"}
                    spacing={10}
                    padding={"20px"}
                  >
                    <Heading>Transfer Funds</Heading>
                    <Input
                      type={"text"}
                      placeholder={"Destination Address"}
                      onChange={(e) => {
                        setTransferAddress(e.target.value);
                      }}
                    />
                    <Input
                      type={"text"}
                      placeholder={"Amount to transfer"}
                      onChange={(e) => {
                        setTransferAmount(e.target.value);
                      }}
                    />

                    <HStack spacing={10}>
                      <Button
                        colorScheme={"red"}
                        onClick={() => {
                          setSendIntent(false);
                        }}
                      >
                        Close
                      </Button>
                      <Button colorScheme={"blue"} onClick={transferMoney}>
                        Send
                      </Button>
                    </HStack>
                  </VStack>
                </ModalWrapper>
              )}
              {transactionObject && (
                <ModalWrapper>
                  <VStack
                    height={"75vh"}
                    position={"absolute"}
                    zIndex={2}
                    bg={"white"}
                    color={"black"}
                    width={"40vw"}
                    borderRadius={"20px"}
                    paddingTop={"5vh"}
                    overflowY={"scroll"}
                    spacing={10}
                    padding={"20px"}
                  >
                    <Heading>Approve Transfer</Heading>
                    <HStack>
                      <Text> From : </Text>
                      <Text>{getMinimalAddress(selectedAccount.address)}</Text>
                    </HStack>
                    <HStack>
                      <Text> To : </Text>
                      <Text>{getMinimalAddress(transferAddress)}</Text>
                    </HStack>
                    <HStack>
                      <Text> Amount : </Text>
                      <Text>
                        {transferAmount} {currencyOf[selectedChain]}
                      </Text>
                    </HStack>

                    <HStack spacing={10}>
                      <Button
                        colorScheme={"red"}
                        onClick={() => {
                          setTransactionObject(null);
                        }}
                      >
                        Reject
                      </Button>
                      <Button colorScheme={"blue"} onClick={signTransaction}>
                        Accept
                      </Button>
                    </HStack>
                  </VStack>
                </ModalWrapper>
              )}

              <Button colorScheme={"blue"}>Swap</Button>
            </HStack>
            <Tabs>
              <TabList width={"40vw"} justifyContent={"space-between"}>
                <Tab>Assets</Tab>
                <Tab>Transactions</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Heading>Your Assets</Heading>
                  <VStack pt={"5vh"} spacing={10}>
                    {selectedChain != null &&
                      tokens[selectedChain]?.map((item) => {
                        return (
                          <AssetTemplate
                            onClick={() => {
                              Toast({
                                title: `Under Development`,
                                description: `We are working on it.\nIt will be ready soon.\nThank you for trying out`,
                                type: "info",
                              });
                            }}
                            key={item.address}
                            asset={item}
                            providerUrl={providers[selectedChain]}
                            userAddress={
                              selectedAccount ? selectedAccount.address : null
                            }
                          />
                        );
                      })}
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={10}>
                    <Heading>Recent Transactions</Heading>
                    {transactions.length == 0 ? (
                      <>
                        <Text>No Recent Transactions</Text>
                      </>
                    ) : (
                      <>
                        <VStack spacing={5}>
                          {transactions.map((asset) => {
                            return (
                              <TransactionInstance
                                onClick={() => {
                                  Toast({
                                    title: `Under Development`,
                                    description: `We are working on it.\nIt will be ready soon.\nThank you for trying out`,
                                    type: "info",
                                  });
                                }}
                                key={asset.asset}
                                asset={asset}
                              />
                            );
                          })}
                        </VStack>
                      </>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </>
      )}
    </VStack>
  );
}

export default AccountManager;
