import { Center, Image, Title, Stack, Paper } from "@mantine/core";
import React from "react";

const EmptyList = ({ title, message }) => {
  return (
    <Paper
      h="90vh"
      w="100%"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      withBorder
    >
      <Center align={"center"}>
        <Stack justify="center" align="center" gap="xs">
          <Image src={"../../empty-box.svg"} alt={"empty-box"} w="400px" />

          <Title order={3} c={"gray.8"}>
            {title}
          </Title>
          <Title order={4} c={"gray.6"}>
            {message}
          </Title>
        </Stack>
      </Center>
    </Paper>
  );
};

export default EmptyList;
