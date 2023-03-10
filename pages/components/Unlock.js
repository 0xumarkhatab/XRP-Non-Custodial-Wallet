import {
  Box,
  Button,
  Heading,
  Img,
  Input,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

function Unlock({ unlocker }) {
  const [password, setPassword] = useState("");
  const [confirmingPassword, setConfirmingPassword] = useState(null);
  const [originalPassword, setOriginalPassword] = useState(null);
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

  async function unlock() {
    if (!originalPassword && password != confirmingPassword) {
      Toast({
        title: `Authentication Error`,
        description: `Passwords do not match!`,
        type: "error",
      });

      return 0;
    } else if (password === originalPassword || !originalPassword) {
      if (!originalPassword) localStorage.setItem("password", password);
      Toast({
        title: `Authentication Success`,
        description: `You are Authenticated`,
        type: "success",
      });

      unlocker(true);
    } else {
      Toast({
        title: `Authentication Error`,
        description: `Password is incorrect`,
        type: "error",
      });

      return 0;
    }
  }
  useEffect(() => {
    let _pass = localStorage.getItem("password");
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
      spacing={10}

    >
      <VStack spacing={5}>
        <Img width={"20vw"}  src={"./logo.PNG"} />
        {/* https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_cc75b4289277b1c28eafa1a8f776a8c0/atomic-wallet.png */}

        <Heading fontSize={"24px"}>Secure. Simple. XRP.</Heading>
      </VStack>

      <VStack spacing={10}>
        <Input
          width={"100%"}
          border={"1px solid grey"}
          colorScheme={"cyan"}
          placeholder={(!originalPassword ? "Create a new " : "") + "Password"}
          type={"text"}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!originalPassword && (
          <Input
            width={"100%"}
            border={"1px solid grey"}
            colorScheme={"cyan"}
            placeholder={"Confirm your Password"}
            type={"text"}
            onChange={(e) => setConfirmingPassword(e.target.value)}
          />
        )}

        <Button onClick={unlock} colorScheme={"cyan"}>
          Unlock
        </Button>
      </VStack>
    </VStack>
  );
}

export default Unlock;
