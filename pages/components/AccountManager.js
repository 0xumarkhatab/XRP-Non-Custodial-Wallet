/**       Imports */
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
import TransactionInstance from "./TransactionInstance";
import AssetTemplate from "./AssetTemplate";
import {
  getTransactions,
  getWeb3,
  prepareTransaction,
  _signTransaction,
  _signTransactionAndBroadcast,
} from "../api/Transaction";
import { arrayToPrivateKey, capitalize } from "../api/Utilities";
import { buyMethods, chains, currencyOf, tokens } from "../api/data";
import { providers } from "web3";
//

//

// funtction to get Transactions of an address on a 'network' chain

function AccountManager({ mnemonic }) {
  const [selectedChain, setSelectedChain] = useState(chains[0].name);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
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

  function underDevelopmentToast() {
    Toast({
      title: `Under Development`,
      description: `We are working on it.\nIt will be ready soon.\nThank you for trying out`,
      type: "info",
    });
  }
  async function checkBalance(address) {
    if (!address) return 0;
    if (!web3 || !web3.current) {
      web3.current = await getWeb3(selectedChain);
    }
    let balance = await web3.current?.eth.getBalance(address);
    if (balance == undefined) return 0;
    balance = parseFloat(parseInt(balance) / 10 ** 18).toFixed(4);
    if (balance.toString() === "0.0000") {
      balance = 0;
    }
    return balance;
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

    setSelectedAccount(_accounts[0]);
    setAccounts(_accounts);
    return _accounts;
  };

  async function updateAssets() {
    if (!selectedAccount || !selectedChain) {
      return 0;
    }

    loadingMessage == null && setLoadingMessage("Loading");
    web3.current = await getWeb3(selectedChain);
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

  async function transferMoney() {
    await prepareTransaction(
      parseEther(transferAmount.toString()),
      transferAddress,
      selectedChain,
      setTransactionObject
    );
  }
  async function signTransaction() {
    // To get back to the state of the wallet so that user can continue navigating the wallet
    setTransactionObject(null);
    setSendIntent(false);

    // signing transaction
    _signTransactionAndBroadcast(
      transactionObject,
      selectedAccount.privateKey,
      selectedChain,
      setTransactionObject,
      () => {
        setTimeout(() => {
          setLoadingMessage(null);
        }, 1000);
        updateAssets();
      },
      Toast
    );
  }

  // use Effects
  /**/
  useEffect(() => {
    updateAssets();
  }, [selectedChain]);

  useEffect(() => {
    generateAccounts(mnemonic);
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
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

              <Button onClick={underDevelopmentToast} colorScheme={"blue"}>
                Swap
              </Button>
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
                    {tokens[selectedChain].length > 0 &&
                      tokens[selectedChain].map((item) => {
                        return (
                          <AssetTemplate
                            onClick={underDevelopmentToast}
                            key={item.address + item.name}
                            asset={item}
                            chain={selectedChain}
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
                                onClick={underDevelopmentToast}
                                key={asset.toString()}
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
