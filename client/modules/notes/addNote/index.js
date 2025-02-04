import { Button, Modal, Text } from "@mantine/core";
import React from "react";
import { useDisclosure } from "@mantine/hooks";
import FormNotes from "./components/formNotes";
import { MdFormatListBulletedAdd } from "react-icons/md";

const AddNote = () => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Modal opened={opened} onClose={close} title="Add Note" size={"100%"}>
        <FormNotes close={close} />
      </Modal>
      <Button
        onClick={open}
        leftSection={<MdFormatListBulletedAdd size={30} />}
        variant="filled"
        color="blue"
      >
        <Text visibleFrom="md"> {"Add Note"}</Text>
      </Button>
    </>
  );
};

export default AddNote;
