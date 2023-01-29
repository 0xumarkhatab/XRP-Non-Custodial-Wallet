import { color, Heading, HStack, Img, Text, VStack } from "@chakra-ui/react";
import React, { useState } from "react";

function AccountInstance({
  account,
  selector,
  color,
  hover_bg,
  size,
  copyable,
}) {
  const [showCopy, setShowCopy] = useState(false);
  function getMinimalAddress(_address) {
    let minAddress =
      _address?.toString().slice(0, 8) + "..." + _address?.toString().slice(44);
    console.log({ minAddress });
    return minAddress;
  }

  return (
    <VStack spacing={1}>
      <HStack
        onClick={() => {
          selector(account);
        }}
        onMouseOver={() => {
          copyable ? "" : showCopy == false && setShowCopy(true);
          // console.log("copy");
        }}
        onMouseLeave={() => {
          copyable ? "" : showCopy == true && setShowCopy(false);
          // console.log("copy");
        }}
        _hover={{
          bg: hover_bg ? hover_bg : "rgba(0,0,0,0.1)",
          color: "white",
          cursor: "pointer",
        }}
        padding={size == "sm" ? "5px" : "20px"}
        spacing={5}
        borderRadius={"10px"}
      >
        {copyable && (
          <Img
            height={size == "sm" ? "40px" : "60px"}
            borderRadius={"50%"}
            src={"./logo.PNG"}
          />
        )}

        <VStack>
          <Heading
            fontSize={size == "sm" ? "12px" : "20px"}
            color={color ? color : "black"}
          >
            {account?.name}
          </Heading>
          <Text
            fontSize={size == "sm" ? "14px" : "18px"}
            color={color ? color : "black"}
          >
            {getMinimalAddress(account?.address)}
          </Text>
        </VStack>
        {showCopy == true && (
          <Text
            position={"absolute"}
            top={"35vh"}
            fontSize={"12px"}
            color={"black"}
            bg={"white"}
            borderRadius={"10px"}
            padding={"5px"}
          >
            Copy to Clipboard
          </Text>
        )}
      </HStack>
    </VStack>
  );
}

export default AccountInstance;
