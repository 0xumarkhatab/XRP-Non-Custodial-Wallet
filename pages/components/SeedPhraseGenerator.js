import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Img,
  Input,
  Modal,
  Text,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useState } from "react";
import * as bip39 from "@scure/bip39";

import { wordlist } from "@scure/bip39/wordlists/english";
import copy from "copy-to-clipboard";
import Link from "next/link";

const SeedPhraseManager = () => {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [copied, setCopied] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleNewSeedPhrase = () => {
    const newSeedPhrase = bip39.generateMnemonic(wordlist);
    // const newSeedPhrase =
    //   " asd adsdasdaasdas d asd asd sa das d as das d asd sda sdasdasd asd";
    setSeedPhrase(newSeedPhrase);
    localStorage.setItem("seedPhrase", newSeedPhrase);
  };

  const handleImportSeedPhrase = (e) => {
    setSeedPhrase(e.target.value);
    localStorage.setItem("seedPhrase", e.target.value);
  };

  function CopyHandler() {
    copy(seedPhrase);
    setCopied(true);
    location.reload();
    localStorage.setItem("seedPhrase", seedPhrase);
  }

  async function importFromSeedphrase() {
    setLoader(true);
    if (!seedPhrase || seedPhrase == "") {
      alert("Please Enter Valid Seedphrase");
    }
    localStorage.setItem("mnemonic", seedPhrase);
    location.reload();
  }
  return (
    <VStack
      paddingTop={"20vh"}
      width={"100%"}
      height={"80%"}
      justify={"center"}
    >
      {!showImportModal && seedPhrase ? (
        <VStack spacing={10}>
          <Heading>Seed Phrase</Heading>
          <Wrap spacing={10}>
            <WrapItem key={"seed-phrase"}>
              <Wrap spacing={5} width={"30vw"}>
                {seedPhrase.split(" ").map((word) => {
                  return (
                    <WrapItem key={"seed-item" + word}>
                      <Box
                        width={"fit-content"}
                        minW={"80px"}
                        padding={"10px"}
                        border={"1px solid grey"}
                        borderRadius={"10px"}
                      >
                        <Text>{word}</Text>
                      </Box>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </WrapItem>
            <WrapItem key={"copy-btn"}>
              <Button
                disabled={copied}
                onClick={CopyHandler}
                colorScheme={copied ? "green" : "blue"}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </WrapItem>
          </Wrap>
          <Text>Please Copy your seed phrase and refresh the page</Text>
        </VStack>
      ) : (
        <>
          {!showImportModal && (
            <VStack spacing={40}>
              <Link href={"#"}>
                <Img
                  height={"100px"}
                  width={"100px"}
                  borderRadius={"50%"}
                  src={"./logo.PNG"}
                />
              </Link>

              <HStack>
                <Button
                  colorScheme={"blue"}
                  onClick={() => !showImportModal && setShowImportModal(true)}
                >
                  + Import Wallet
                </Button>
                <Button colorScheme={"blue"} onClick={handleNewSeedPhrase}>
                  Create New Wallet
                </Button>
              </HStack>
            </VStack>
          )}
        </>
      )}
      {showImportModal && (
        <FormControl width={"30vw"}>
          <VStack spacing={10}>
            <FormLabel>Enter Your Seed Phrase</FormLabel>
            <Input onChange={handleImportSeedPhrase} />
            <Button colorScheme={"green"} onClick={importFromSeedphrase}>
              Import
            </Button>
          </VStack>
        </FormControl>
      )}
    </VStack>
  );
};

export default SeedPhraseManager;
