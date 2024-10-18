import React from "react";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Center, Stack, Button, TextInput } from "@mantine/core";
import useAuthStore from "../../auth/store";

const PersonForm = ({ close, refetch, person }) => {
  const token = useAuthStore();
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      firstName: person?.firstName ?? "",
      secondName: person?.secondName ?? "",
      nickName: person?.nickName ?? "",
    },
  });

  const createPersonMutation = useMutation({
    mutationFn: (values) =>
      axios.post("http://localhost:8000/api/people", values, {
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

  const updatePersonMutation = useMutation({
    mutationFn: (values) => {
      const token = localStorage.getItem("token"); // Assurez-vous que c'est une chaîne
      return axios.put(
        `http://localhost:8000/api/people/${person._id}`,
        values, // Ne pas inclure le token dans le body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Utilisez une template string
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["people"]);
      close();
      refetch();
    },
    onError: (error) => {
      console.error("Échec de la mise à jour de la personne:", error);
    },
  });

  const handleSubmit = (values) => {
    if (person) {
      updatePersonMutation.mutate(values);
    } else {
      createPersonMutation.mutate(values);
    }
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
          <Button
            type="submit"
            loading={
              createPersonMutation.isLoading || updatePersonMutation.isLoading
            }
          >
            {person ? "Update" : "Submit"}
          </Button>
        </Stack>
      </Center>
    </form>
  );
};

export default PersonForm;
