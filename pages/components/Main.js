import { Box, Center } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import AccountManager from "./AccountManager";
import SeedPhraseManager from "./SeedPhraseGenerator";
import Unlock from "./Unlock";

function Main() {
  const [unlocked, setUnlocked] = useState(false);
  const [mnemonic, setMnemonic] = useState(null);
  const [masterAddress,setMasterAddress]=useState(null);

  //   mnemonic = localStorage.getItem("mnemonic");
  useEffect(() => {
    let _mnemonic = localStorage.getItem("mnemonic");
    let MasterAddress = localStorage.getItem("masterAddress");
    
    if (_mnemonic && _mnemonic !== "null") {
      setMnemonic(_mnemonic);
      setMasterAddress(MasterAddress);

    }


  }, []);

  return (
    <Center background={"rgba(0,0,0,0.25)"} width={"100vw"} height={"100vh"}>
      <Box
        color={"white"}
        bg={"black"}
        width={"50vw"}
        height={"90vh"}
        padding={"20px"}
        borderRadius={"20px"}
        overflowY={"scroll"}
        sx={{
          "::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {!mnemonic ? (
          <SeedPhraseManager />
        ) : !unlocked ? (
          <Unlock unlocker={setUnlocked} />
        ) : (
          <Box>
            <AccountManager masterAddress={masterAddress} mnemonic={mnemonic} />
          </Box>
        )}
      </Box>
    </Center>
  );
}

export default Main;
