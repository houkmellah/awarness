import React from "react";
import { Button, Modal, Stack, Textarea, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import useAuthStore from "../../auth/store";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl } from "../../utils/config";
import { TfiPencil } from "react-icons/tfi";
import { ActionIcon } from "@mantine/core";
import Debugger from "../../debugger";

const AddAndUpdateFear = ({ fear }) => {
  const [opened, { open: openfearModal, close: closefearModal }] =
    useDisclosure(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { title, description, createdBy } = fear || {};

  const form = useForm({
    initialValues: {
      title: title || "",
      description: description || "",
      createdBy: createdBy || user?.id,
    },
  });

  const updatefear = useMutation({
    mutationFn: (data) =>
      axios.put(`${apiUrl}/fears/${fear._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  });

  const createfear = useMutation({
    mutationFn: (data) =>
      axios.post(`${apiUrl}/fears`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  });

  const {
    mutate: addfear,
    isError,
    error,
  } = useMutation({
    mutationFn: (data) =>
      fear ? updatefear.mutate(data) : createfear.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["listfearsByUser"]);
      closefearModal();
      form.reset();
    },
    onError: (error) => {
      console.error("Erreur lors de l'opération:", error);
      // Vous pouvez ajouter ici une notification d'erreur avec @mantine/notifications
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={closefearModal} title="Add fear">
        <Stack>
          <TextInput label="Title" {...form.getInputProps("title")} />
          <Textarea
            label="Description"
            {...form.getInputProps("description")}
          />
          <Button onClick={() => addfear(form.values)}>Add fear</Button>
        </Stack>
        <Debugger data={form.values} />
      </Modal>
      {fear ? (
        <ActionIcon onClick={openfearModal}>
          <TfiPencil />
        </ActionIcon>
      ) : (
        <Button onClick={openfearModal}>Add fear</Button>
      )}
    </>
  );
};

export default AddAndUpdateFear;
