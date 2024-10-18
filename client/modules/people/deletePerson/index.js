import React from "react";
import { TfiTrash } from "react-icons/tfi";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import {
  ActionIcon,
  rem,
  Modal,
  Button,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconX, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import useAuthStore from "../../auth/store";

const DeletePerson = ({ id, onDeleteSuccess, setNotification, refetch }) => {
  const {token} = useAuthStore()
  const [opened, { open, close }] = useDisclosure(false);

  const deletePerson = async (id) => {
    await axios.delete(`http://localhost:8000/api/people/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const deletePersonMutation = useMutation({
    mutationFn: (id) => deletePerson(id),
    onSuccess: () => {
      setNotification({
        icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
        color: "teal",
        title: "Success!",
        message: "The person has been successfully deleted",
      });
      refetch();
      if (onDeleteSuccess) {
        onDeleteSuccess(id);
      }
      close(); // Close the modal after deletion
    },
    onError: (error) => {
      console.error("Failed to delete person:", error);
      setNotification({
        icon: <IconX style={{ width: rem(20), height: rem(20) }} />,
        color: "red",
        title: "Error!",
        message: "Failed to delete the person",
      });
      close(); // Close the modal in case of error
    },
  });

  const handleDeletePerson = () => {
    deletePersonMutation.mutate(id);
  };

  return (
    <>
      <Tooltip label="Delete Person">
        <ActionIcon variant="transparent" onClick={open}>
          <TfiTrash size={25} />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={close}
        title="Confirm Deletion"
        centered
        size={"lg"}
      >
        <Text size="sm" mb="lg">
          Are you sure you want to delete this person? This action is
          irreversible.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={close}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDeletePerson}
            leftIcon={<IconAlertTriangle size={16} />}
            loading={deletePersonMutation.isLoading}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default DeletePerson;
