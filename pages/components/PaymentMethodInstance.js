import { Box, Button, Img, Text, VStack } from "@chakra-ui/react";
import React from "react";

function PaymentMethodInstance(props) {
  let payment = props?.payment;

  return (
    <VStack align={"left"} spacing={5}>
      <Box>
        <Img src={payment?.logo} width={"15vw"} />
      </Box>
      <Text color={"black"} width={"30vw"}>
        {payment?.description}
      </Text>
      <Button colorScheme={"facebook"} variant="outline">
        Continue with {payment?.title}
      </Button>
    </VStack>
  );
}

export default PaymentMethodInstance;
