import React from "react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Button, Select, Stack, Table, Textarea, TextInput } from '@mantine/core';
import Debugger from '../../debugger';
import { useMutation, useQueryClient , useQuery } from "@tanstack/react-query";
import {
  Stack,
  Select,
  TextInput,
  Textarea,
  Button,
  Modal,
} from "@mantine/core";

const addAndUpdateEmotion = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const categories = ["doute", "refus", "colère", "stress", "agréable"];

  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      category: "",
      name: "",
      description: "",
      message: "",
      guidance: [],
    },
  });

  const createEmotionMutation = useMutation({
    mutationFn: (values) =>
      axios.post(`${apiUrl}/emotions`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["ListPeople"]);
      refetch();
      form.reset();
    },
  });

  const handleSubmit = (values) => {
    createEmotionMutation.mutate(values);
  };

  const form = useForm({
    initialValues: {
      category: "",
      name: "",
      description: "",
      message: "",
    },
  });
  return (
    <Modal opened={opened} onClose={() => setOpened(false)} title="Add Emotion">
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack>
          <Stack>
            <Select
              label="Category"
              {...form.getInputProps("category")}
              data={categories}
            />
            <TextInput label="Name" {...form.getInputProps("name")} />
            <Textarea
              label="Description"
              {...form.getInputProps("description")}
              autosize
            />
            <Textarea
              label="Message"
              {...form.getInputProps("message")}
              autosize
            />
          </Stack>
          {/* <TextInput label="Guidance" {...form.getInputProps('guidance')} /> */}
          <Button type="submit" loading={createEmotionMutation.isLoading}>
            Submit
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default addAndUpdateEmotion;
