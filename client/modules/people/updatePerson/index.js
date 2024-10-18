import { ActionIcon, Modal , Tooltip} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import { TfiPencil } from "react-icons/tfi";
import PersonForm from "../personForm";

const UpdatePerson = ({ person, refetch }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  return (
    <>
      <Tooltip label="Edit Person">
      <ActionIcon
        variant="transparent"
        onClick={() => {
          open();
          setSelectedPerson(person);
        }}
      >
        <TfiPencil size={25} />
        </ActionIcon>
        </Tooltip>
      <Modal
        size="lg"
        opened={opened}
        onClose={() => {
          close();
          setSelectedPerson(null);
        }}
        centered
      >
        <PersonForm person={selectedPerson} close={close} refetch={refetch} />
      </Modal>
    </>
  );
};

export default UpdatePerson;
