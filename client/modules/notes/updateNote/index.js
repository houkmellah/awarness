import React, { useState } from "react";
import { TfiPencil } from "react-icons/tfi";
import FormNotes from "../addNote/components/formNotes";
import { useDisclosure } from "@mantine/hooks";
import { ActionIcon, Modal, Tooltip } from "@mantine/core";

const UpdateNote = ({ note }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedNote, setSelectedNote] = useState(null);

  return (
    <>
      <Tooltip label="Edit Note">
        <ActionIcon
          onClick={() => {
            open();
            setSelectedNote(note);
          }}
          variant="transparent"
        >
          <TfiPencil size={25} />
        </ActionIcon>
      </Tooltip>
      <Modal
        size="lg"
        opened={opened}
        onClose={() => {
          close();
          setSelectedNote(null);
        }}
        centered
      >
        {selectedNote && (
          <FormNotes
            note={selectedNote}
            close={close}
            setSelectedNote={setSelectedNote}
          />
        )}
      </Modal>
    </>
  );
};

export default UpdateNote;
