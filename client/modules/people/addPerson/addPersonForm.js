import React from "react";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Center, Stack, Button, TextInput } from "@mantine/core";
import useAuthStore from "../../auth/store";
import { apiUrl } from "../../utils/config";

const AddPersonForm = ({ close, refetch }) => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      firstName: "",
      secondName: "",
      nickName: "",
    },
  });

  const createPersonMutation = useMutation({
    mutationFn: (values) =>
      axios.post(`${apiUrl}/people`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["people"]);
      close();
      refetch();
    },
    onError: (error) => {
      console.error("Failed to create person:", error);
    },
  });

  const handleSubmit = (values) => {
    createPersonMutation.mutate(values);
  };

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Center>
        <Stack w="100%">
          <TextInput label="First Name" {...form.getInputProps("firstName")} />
          <TextInput
            label="Second Name"
            {...form.getInputProps("secondName")}
          />
          <TextInput label="Nick Name" {...form.getInputProps("nickName")} />
          <Button type="submit" loading={createPersonMutation.isLoading}>
            Submit
          </Button>
        </Stack>
      </Center>
    </form>
  );
};

export default AddPersonForm;
