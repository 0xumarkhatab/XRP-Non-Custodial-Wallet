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
import { capitalize } from "../api/Utilities";
import { buyMethods, chains, currencyOf, tokens } from "../api/data";
import { connectXRPL } from "../api/xrplApi";
const xrpl = require("xrpl")

//

//

// funtction to get Transactions of an address on a 'network' chain
let network = "testnet"; // "testnet","mainnet" or "devnet"

function AccountManager({ mnemonic, masterAddress }) {
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
  const [xrplClient, setXRPLClient] = useState(null);

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
  async function checkBalance(address, client) {
    if (!address) return 0;
    try {
      let Client = client || xrplClient;
      let res = await Client.request({
        "command": "account_info",
        "account": address,
        "ledger_index": "validated"
      })
      let balance = res.result.account_data.Balance;
      console.log("balance in drops", balance);


      if (balance == undefined) return 0;
      balance = parseFloat(parseInt(balance) / 10 ** 6).toFixed(2);
      if (balance.toString() === "0.00") {
        balance = 0;
      }

      return balance;
    }
    catch (e) {
      return 0;
    }
  }

  const generateAccounts = async (_seedPhrase, _masterAddress, _client) => {

    setLoadingMessage("Gathering accounts...");
    let XrplClient = _client || xrplClient;

    let test_wallet = xrpl.Wallet.fromSeed(_seedPhrase, {
      masterAddress: _masterAddress
    })

    let balance = await checkBalance(test_wallet.address, XrplClient);
    if (selectedChain != "mainnet" && balance == 0) {
      console.log("Funding it....");
      const fund_result = await XrplClient.fundWallet(test_wallet)

    }
    balance = await checkBalance(test_wallet.address, XrplClient);

    test_wallet.balance = balance;
    let _accountsObject = {
      name: "Account1 ",
      avatar: "./account.png",
      wallet: test_wallet,
    };
    let accountsArray = [_accountsObject]


    setSelectedAccount(accountsArray[0]);
    setAccounts(accountsArray);
    console.log("_");
    setLoadingMessage(null);


    return accountsArray;
  };

  async function updateAssets() {
    if (!selectedAccount || !xrplClient) return 0;
    setLoadingMessage("Updating balances...")
    let balance = await checkBalance(selectedAccount?.wallet?.address, xrplClient);
    let updatedAccount = { ...selectedAccount };
    updatedAccount.wallet.balance = balance;
    setSelectedAccount(updatedAccount);
    setLoadingMessage(null)

    // if (!selectedAccount || !selectedChain) {
    //   return 0;
    // }

    // loadingMessage == null && setLoadingMessage("Loading");
    // web3.current = await getWeb3(selectedChain);
    // // fetching latest transactions of selected account
    // let trxs = await getTransactions(
    //   selectedChain,
    //   selectedAccount.address,
    //   setTransactions
    // );

    // fetching balance of the user

  }

  async function transferMoney() {
    if(!transferAmount || !transferAddress){
      Toast({
        title: "Invalid Transfer",
        description: `Kindly fill the fields`,
        type:  "error",
      });
      return 0;
      
    }
    await prepareTransaction(xrplClient, selectedAccount.wallet, transferAddress,
      (transferAmount.toString()),
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
      transactionObject, xrplClient,
      selectedAccount.wallet,
      selectedChain,
      () => {
        setTransactionObject(null);
        setTimeout(() => {
          setLoadingMessage(null);
        }, 1000);
        let txs = transactions.length>0?transactions: []
        txs.push({
          asset: "XRP",
          to: transferAddress,
          value: transferAmount,
          from: selectedAccount.wallet.address
        })
        setTransactions(txs)
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

  async function init() {
    let res = await connectXRPL(setXRPLClient);
    await generateAccounts(mnemonic, masterAddress, res);

  }
  useEffect(() => {

    init();

  }, []);

  useEffect(() => {
    if (transactions?.length > 0) {
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
          <Link href={"/"}>
            <Img
              width={"10vw"}
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
                    bg={"black"}
                    boxShadow={"1px 1px 1px 1px rgba(0,0,0,0.4)"}
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
                            let balance = await checkBalance(account.address, xrplClient);
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
            color="cyan.700"
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
            <Heading>{selectedAccount?.wallet.balance} XRP</Heading>
            <HStack>
              <Button colorScheme={"cyan"} onClick={() => setBuyIntent(true)}>
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
                colorScheme={"cyan"}
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
                      <Button colorScheme={"cyan"} onClick={transferMoney}>
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
                      <Text>{getMinimalAddress(selectedAccount.wallet.address)}</Text>
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
                      <Button colorScheme={"cyan"} onClick={signTransaction}>
                        Accept
                      </Button>
                    </HStack>
                  </VStack>
                </ModalWrapper>
              )}

              <Button onClick={underDevelopmentToast} colorScheme={"cyan"}>
                Swap
              </Button>
            </HStack>
            <VStack spacing={10}>
              <Heading>Recent Transactions</Heading>
              {!transactions || transactions?.length == 0 ? (
                <>
                  <Text>No Recent Transactions</Text>
                </>
              ) : (
                <>
                  <VStack spacing={5}>
                    {transactions?.map((asset) => {
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
          </VStack>
        </>
      )}
    </VStack>
  );
}

export default AccountManager;
