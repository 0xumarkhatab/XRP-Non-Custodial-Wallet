import { color, Heading, HStack, Img, Text, VStack } from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import React, { useState } from "react";
export function getMinimalAddress(_address, upperLimit = 26) {
  let minAddress =
    _address?.toString().slice(0, 8) +
    "..." +
    _address?.toString().slice(upperLimit);
  return minAddress;
}

function AccountInstance({
  account,
  selector,
  color,
  hover_bg,
  size,
  copyable,
}) {
  const [showCopy, setShowCopy] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  if (!account) return <></>;
  let wallet=account.wallet;
  return (
    <HStack
      key={wallet.classicAddress}
      onClick={() => {
        if (!isCopied && copyable) {
          console.log("copying...");
          copy(wallet.classicAddress);
          setIsCopied(true);
        }
        selector(account);
      }}
      onMouseOver={() => {
        copyable ? showCopy == false && setShowCopy(true) : "";
        // console.log("copy");
      }}
      onMouseLeave={() => {
        copyable ? showCopy == true && setShowCopy(false) : "";
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
      {!copyable && (
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
          {account.name}
        </Heading>
        <Text
          fontSize={size == "sm" ? "14px" : "18px"}
          color={color ? color : "black"}
        >
          {getMinimalAddress(wallet.classicAddress)}
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
          {isCopied ? "Copied" : "Copy to Clipboard"}
        </Text>
      )}
    </HStack>
  );
}

export default AccountInstance;
