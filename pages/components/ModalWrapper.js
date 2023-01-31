import { Center } from "@chakra-ui/react";
import React from "react";

function ModalWrapper(props) {
  let Children = props?.children;

  return (
    <Center
      height={"100vh"}
      bg={"rgba(0,0,0,0.4)"}
      position={"absolute"}
      width={"100vw"}
      top={"0"}
      left={"0"}
    >
      {Children}
    </Center>
  );
}

export default ModalWrapper;
