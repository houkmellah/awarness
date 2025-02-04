import { Button, Modal, Text , ActionIcon} from "@mantine/core";
import React from "react";
import { useDisclosure } from "@mantine/hooks";
import AddPersonForm from "./addPersonForm";
import { MdOutlinePersonAddAlt } from "react-icons/md";

const AddPerson = ({ refetch}) => {
  const [opened, { open, close: closeAddPersonModal }] = useDisclosure(false);
  return (
    <>
      <Modal
        opened={opened}
        onClose={closeAddPersonModal}
        title="Add Person"
        size={"xl"}
      >
        <AddPersonForm close={closeAddPersonModal} refetch={refetch} />
      </Modal>

      <ActionIcon onClick={open} variant="transparent">
        <MdOutlinePersonAddAlt size={24} />
      </ActionIcon>

      {/* <Button onClick={open} leftSection={<MdOutlinePersonAddAlt size={27} />}>
        <Text visibleFrom="md">{"Add Person"}</Text>
      </Button> */}
    </>
  );
};

export default AddPerson;
