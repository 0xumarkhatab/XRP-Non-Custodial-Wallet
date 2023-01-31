import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Img,
  Select,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import AccountInstance from "./AccountInstance";
import Web3 from "web3";
import * as bip39 from "@scure/bip39";
import { hdkey } from "ethereumjs-wallet";
import ModalWrapper from "./ModalWrapper";
import PaymentMethodInstance from "./PaymentMethodInstance";
import Head from "next/head";
import { parseEther } from "ethers/lib/utils";

let chains = [
  {
    name: "mainnet",
    chain_id: 1,
  },
  {
    name: "goerli",
    chain_id: 5,
  },

  {
    name: "sepolia",
    chain_id: 11155111,
  },
];

// let accounts = [
//   {
//     name: "Account 1",
//     address: "0x14hjvy455as4uasdasd4as65d4as65d4a6sdas45d6as5d4",
//     balance: 15,
//     avatar: "./account.png",
//   },
//   {
//     name: "Account 2",
//     address: "0x18khdy455as4uasdasd4as65d4as65d4a6sdas45d6as5d4",
//     balance: 10,
//     avatar: "./account.png",
//   },
//   {
//     name: "Account 3",
//     address: "0x13vy455as4uasdasd4as65d4as65d4a6sdas45d6as5d4",
//     balance: 7.92,
//     avatar: "./account.png",
//   },
//   {
//     name: "Account 4",
//     address: "0x19ivt4y55as4uasdasd4as65d4as65d4a6sdas45d6as5d4",
//     balance: 2.5,
//     avatar: "./account.png",
//   },
// ];

let providers = {
  goerli: "wss://goerli.infura.io/ws/v3/685daa6fa7f94b4b89cdc6d7c5a8639e",
  sepolia: "wss://sepolia.infura.io/ws/v3/685daa6fa7f94b4b89cdc6d7c5a8639e",
  mainnet: "wss://mainnet.infura.io/ws/v3/685daa6fa7f94b4b89cdc6d7c5a8639e",
};

let Assets = [];
("  Deposit ETH To interact with decentralized applications using MetaMask, you’ll need ETH in your wallet.");
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
let websocketUrl = providers[chains[0].name];
let _provider = new Web3.providers.WebsocketProvider(websocketUrl);
let _web3 = new Web3(_provider);

function AccountManager({ mnemonic }) {
  const [selectedChain, setSelectedChain] = useState(chains[0].name);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [assets, setAssets] = useState(Assets);
  const [accounts, setAccounts] = useState([]);
  const [buyIntent, setBuyIntent] = useState(false);
  const [sellIntent, setSellIntent] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferAddress, setTransferAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const web3 = useRef(null);

  function capitalize(str) {
    let _str = String(str);
    _str = _str.toUpperCase()[0] + _str.slice(1);
    return _str;
  }

  async function checkBalance(address) {
    if (!address) return 0;
    let balance = await web3.current?.eth.getBalance(address);
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
    const seed = bip39.mnemonicToSeedSync(_seedPhrase);
    const hdwallet = hdkey.fromMasterSeed(seed);
    const wallet_hdpath = "m/44'/60'/0'/0/";
    let _accounts = [];
    for (let i = 0; i < 3; i++) {
      const wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
      const address = "0x" + wallet.getAddress().toString("hex");
      let privKey = arrayToPrivateKey(wallet.getPrivateKey());
      let balance = await checkBalance(address);
      let _accountsObject = {
        name: "Account " + (i + 1),
        avatar:
          "https://user-images.githubusercontent.com/17594777/87848893-9bc99700-c8e4-11ea-992d-8980cf562b1b.png",
        balance,
        address,
        privateKey: privKey,
      };
      _accounts.push(_accountsObject);
    }
    setAccounts(_accounts);
    setSelectedAccount(_accounts[0]);
    return _accounts;
  };

  async function updateAssets() {
    if (!selectedAccount | !selectedChain) {
      return 0;
    }
    !loading && setLoading(true);
    websocketUrl = providers[selectedChain];
    _provider = new Web3.providers.WebsocketProvider(websocketUrl);
    _web3 = new Web3(_provider);
    web3.current = _web3;

    let _assets = [...Assets]; // get assets here
    let balance = await checkBalance(selectedAccount.address);
    setSelectedAccount({ ...selectedAccount, balance });

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }
  useEffect(() => {
    updateAssets();
  }, [selectedChain]);

  useEffect(() => {
    generateAccounts(mnemonic);
  }, []);

  async function prepareTransaction(value, toAddress) {
    const nonce = await web3.eth.getTransactionCount(account);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 21000;

    const rawTransaction = {
      nonce: nonce,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      to: toAddress,
      value: value,
      data: "",
    };

    return rawTransaction;
  }
  async function transferMoney() {
    let trx = await prepareTransaction(
      parseEther(transferAmount.toString()),
      transferAddress
    );
    console.log("trx is ", trx);
  }

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
                alt="account image"
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
                    bg={"rgba(255,255,255,0.95)"}
                    width={"40vw"}
                    borderRadius={"20px"}
                    paddingTop={"5vh"}
                  >
                    {accounts?.map((account) => {
                      return (
                        <AccountInstance
                          selector={async (account) => {
                            setShowAccounts(false);
                            setLoading(true);
                            let balance = await checkBalance(account.address);
                            setSelectedAccount({ ...account, balance });
                            setTimeout(() => {
                              setLoading(false);
                            }, 2000);
                          }}
                          copyable={true}
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

      {loading ? (
        <VStack align={"center"} width={"100%"} height={"100%"}>
          <Heading>Loading....</Heading>
        </VStack>
      ) : (
        <>
          <HStack width={"40vw"} justify={"space-between"}>
            <HStack
              onClick={() => setIsConnected((prev) => !prev)}
              disabled
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
              selector={() => {}}
              size={"sm"}
              hover_bg={"rgba(255,255,255,0.4)"}
              color={"white"}
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
                alt="menu"
              />
            </Button>
          </HStack>

          <VStack spacing={10}>
            <Img
              height={8}
              src={selectedAccount?.avatar}
              alt={"account__avatar"}
            />
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
                  setSellIntent(true);
                }}
              >
                Sell
              </Button>
              {sellIntent && (
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
                          setSellIntent(false);
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
              <Button colorScheme={"blue"}>Swap</Button>
            </HStack>
          </VStack>
        </>
      )}
    </VStack>
  );
}

export default AccountManager;
