import { Box, Button, HStack, Img, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { getMinimalAddress } from "./AccountInstance";

function AssetInstance({ asset }) {
  return (
    <HStack
      width={"40vw"}
      borderRadius={"20px"}
      bg={"white"}
      color={"black"}
      spacing={10}
      padding={"10px"}
    >
      <Box bg={"black"} color={"white"} borderRadius={"50%"} padding={"10px"}>
        {asset.asset}
      </Box>

      <VStack align={"left"}>
        <Text fontWeight={"700"}> {getMinimalAddress(asset.from)}</Text>
        <HStack justify={"center"} width={"15vw"} spacing={5}>
          <Img
            height={5}
            src="https://png.pngtree.com/png-vector/20190419/ourmid/pngtree-vector-down-arrow-icon-png-image_956433.jpg"
            alt="down arrow"
          />
          <Text textDecoration={"underline"}>
            {asset.value ? asset.value : 0}
          </Text>
        </HStack>
        <Text fontWeight={"700"}>{getMinimalAddress(asset.to)}</Text>
      </VStack>
      <Button colorScheme={"cyan"}>View Details</Button>
    </HStack>
  );
}

export default AssetInstance;
