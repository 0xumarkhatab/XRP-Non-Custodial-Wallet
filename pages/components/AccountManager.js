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
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AccountInstance from "./AccountInstance";
import Web3 from "web3";
import * as bip39 from "@scure/bip39";
import { hdkey } from "ethereumjs-wallet";

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

function AccountManager({ mnemonic }) {
  const [selectedChain, setSelectedChain] = useState(chains[0].name);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [assets, setAssets] = useState(Assets);
  const [accounts, setAccounts] = useState([]);

  function capitalize(str) {
    let _str = String(str);
    _str = _str.toUpperCase()[0] + _str.slice(1);
    return _str;
  }

  async function checkBalance(address) {
    if (!address) return 0;
    const websocketUrl = providers[selectedChain];
    const provider = new Web3.providers.WebsocketProvider(websocketUrl);
    const web3 = new Web3(provider);

    let balance = await web3.eth.getBalance(address);
    balance = parseInt(balance) / 10 ** 18;
    // console.log(`Balance of ${address}: ${balance} wei`);
    return balance;
  }
  const generateAccounts = async (_seedPhrase) => {
    const seed = bip39.mnemonicToSeedSync(_seedPhrase);
    const hdwallet = hdkey.fromMasterSeed(seed);
    const wallet_hdpath = "m/44'/60'/0'/0/";
    let _accounts = [];
    for (let i = 0; i < 3; i++) {
      const wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
      const address = "0x" + wallet.getAddress().toString("hex");
      let balance = await checkBalance(address);
      _accounts.push({
        name: "Account " + (i + 1),
        avatar: "./account.png",
        balance,
        address,
      });
    }
    console.log("the accounts are ", _accounts);
    setAccounts(_accounts);
    setSelectedAccount(_accounts[0]);
    return _accounts;
  };

  async function updateAssets() {
    let _assets = [...Assets]; // get assets here
    let balance = await checkBalance(selectedAccount?.address);
    let _Account = {
      name: capitalize(selectedChain) + " " + "ETH",
      avatar: selectedAccount?.avatar,
      balance,
    };
    _assets.push(_Account);
    setAssets(_assets);
  }
  useEffect(() => {
    updateAssets();
  }, [selectedAccount, selectedChain]);

  useEffect(() => {
    generateAccounts(mnemonic);
  }, []);
  console.log({
    assets,
    selectedChain,
    selectedAccount,
  });
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
              }}
              onChange={(e) => {
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
                <Center
                  height={"100vh"}
                  bg={"rgba(0,0,0,0.4)"}
                  position={"absolute"}
                  width={"100vw"}
                  top={"0"}
                  left={"0"}
                >
                  <VStack
                    height={"80vh"}
                    position={"absolute"}
                    zIndex={2}
                    bg={"rgba(255,255,255,0.95)"}
                    width={"50vw"}
                    borderRadius={"20px"}
                    paddingTop={"10vh"}
                  >
                    {accounts?.map((account) => {
                      return (
                        <AccountInstance
                          selector={(account) => {
                            setSelectedAccount(account);
                            setShowAccounts(false);
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
                </Center>
              </>
            )}
          </Box>
        </HStack>
        <hr style={{ content: "", width: "20vw" }} />
      </>
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
        <Img height={8} src={selectedAccount?.avatar} alt={"account__avatar"} />
        <Heading>{selectedAccount?.balance} ETH</Heading>
        <HStack>
          <Button colorScheme={"blue"}>Buy</Button>
          <Button colorScheme={"blue"}>Sell</Button>
          <Button colorScheme={"blue"}>Swap</Button>
        </HStack>
      </VStack>
      <VStack>
        <Tabs justifyContent={"center"} width={"40vw"}>
          <TabList justifyContent={"space-between"}>
            <Tab>Assets</Tab>
            <Tab>Activity</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {assets.map((asset) => {
                return (
                  <HStack
                    padding={"20px"}
                    borderBottom={"1px solid white"}
                    borderRadius={"20px"}
                    justify={"space-between"}
                    cursor={"pointer"}
                    _hover={{
                      bg: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <HStack>
                      <Img src={asset.avatar} height={8} />
                      <HStack>
                        <Heading> {asset.balance} </Heading>
                        <Heading>{asset.name}</Heading>
                      </HStack>
                    </HStack>
                    <Box>
                      <Img
                        borderRadius={"50%"}
                        bg={"white"}
                        src={
                          "https://cdn-icons-png.flaticon.com/512/1549/1549612.png"
                        }
                        height={"30px"}
                      />
                    </Box>
                  </HStack>
                );
              })}
            </TabPanel>
            <TabPanel>
              <Heading>To be added</Heading>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </VStack>
  );
}

export default AccountManager;
