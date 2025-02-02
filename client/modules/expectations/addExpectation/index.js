import React from "react";
import { Button, Modal, Stack, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import useAuthStore from "../../auth/store";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl } from "../../utils/config";
import FormExpectation from "../formExpectation";
import { TfiPencil } from "react-icons/tfi";

const AddExpectation = ({ expectation }) => {
  const [opened, { open: openExpectationModal, close: closeExpectationModal }] =
    useDisclosure(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { name, reason, createdBy } = expectation || {};
  const form = useForm({
    initialValues: {
      name: name || "",
      reason: reason || "",
      createdBy: createdBy || user.id,
    },
  });

  const updateExpectation = useMutation({
    mutationFn: (data) =>
      axios.put(`${apiUrl}/expectations/${expectation._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  });

  const createExpectation = useMutation({
    mutationFn: (data) =>
      axios.post(`${apiUrl}/expectations`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  });

  const { mutate: addExpectation } = useMutation({
    mutationFn: (data) =>
      expectation
        ? updateExpectation.mutate(data)
        : createExpectation.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["listExpectationsByUser"]);
      closeExpectationModal();
      form.reset();
    },
  });
  return (
    <>
      <Modal
        opened={opened}
        onClose={closeExpectationModal}
        title="Add Expectation"
      >
        <Stack>
          <FormExpectation form={form} />
          <Button onClick={() => addExpectation(form.values)}>
            Add Expectation
          </Button>
        </Stack>
      </Modal>
      {expectation ? (
        <ActionIcon onClick={openExpectationModal}>
          <TfiPencil />
        </ActionIcon>
      ) : (
        <Button onClick={openExpectationModal}>Add Expectation</Button>
      )}
    </>
  );
};

export default AddExpectation;
