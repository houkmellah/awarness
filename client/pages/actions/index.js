import React from "react";
import { Center, Card } from "@mantine/core";
import FormActions from "../../modules/formActions";

const index = () => {
  return (
    <Center>
      <Card w="80%" shadow="lg">
        <FormActions />
      </Card>
    </Center>
  );
};

export default index;
