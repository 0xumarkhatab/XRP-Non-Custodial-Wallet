import { Box, Button, Heading, Img, Input, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

function Unlock({ unlocker }) {
  const [password, setPassword] = useState("");
  const [originalPassword, setOriginalPassword] = useState(null);

  async function unlock() {
    if (password === originalPassword || !originalPassword) {
      if (!originalPassword) localStorage.setItem("password", password);
      unlocker(true);
    } else {
      alert("Invalid Password");
    }
  }
  useEffect(() => {
    let _pass = localStorage.getItem("password");
    console.log("original password is ", { _pass });
    if (!_pass || _pass == "null") {
      setOriginalPassword(null);
      // localStorage.setItem("password",password);
    } else {
      setOriginalPassword(_pass);
    }
  }, []);

  return (
    <VStack
      paddingTop={"20vh"}
      width={"100%"}
      height={"80%"}
      justify={"space-between"}
    >
      <VStack spacing={5}>
        <Img height={20} borderRadius={"50%"} src={"./logo.PNG"} />
        {/* https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_cc75b4289277b1c28eafa1a8f776a8c0/atomic-wallet.png */}

        <Heading fontSize={"24px"}>Trust-Less, Control-More</Heading>
      </VStack>

      <VStack spacing={10}>
        <Input
          width={"100%"}
          border={"1px solid grey"}
          colorScheme={"blue"}
          placeholder={(!originalPassword ? "Create a new " : "") + "Password"}
          type={"text"}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={unlock} colorScheme={"blue"}>
          Unlock
        </Button>
      </VStack>
    </VStack>
  );
}

export default Unlock;
