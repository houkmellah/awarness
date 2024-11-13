import React from 'react'
import { useForm } from '@mantine/form';
import { Button, Select, Stack, Table, Textarea, TextInput } from '@mantine/core';
import Debugger from '../debugger';
import { useMutation, useQueryClient , useQuery } from "@tanstack/react-query";
import useAuthStore from "../auth/store"
import { apiUrl } from "../utils/config"
import axios from 'axios';
import useEmotionsStore from "./store";



const Emotions = () => {
  const categories = ['doute', 'refus', 'colère', 'stress', 'agréable'];
  const { token } = useAuthStore();
  const { setEmotions } = useEmotionsStore();
  const {
    data: emotions = [], refetch
  
  } = useQuery({
    queryKey: ["ListPeople"],
    queryFn: () => fetchEmotions(token),
    onSuccess: (data) => {
      console.log(data)
      setEmotions(data);
    },
    enabled: !!token,
  });
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      category: '',
      name: '',
      description: '',
      message: '',
      guidance: [],
    },
  });

  const fetchEmotions = async (token) => {
    try {
      const { data  } = await axios.get(`${apiUrl}/emotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmotions(data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des personnes:", error);
      throw error;
    }
  };
  const createEmotionMutation = useMutation({
    mutationFn: (values) => axios.post(`${apiUrl}/emotions`, values, {
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
  }



  return (
    <Stack>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack>
          <Stack>
            <Select label="Category" {...form.getInputProps('category')} data={categories}  />
            <TextInput label="Name" {...form.getInputProps('name')} />
            <Textarea label="Description" {...form.getInputProps('description')} autosize />
            <Textarea label="Message" {...form.getInputProps('message')} autosize />
          </Stack>
          {/* <TextInput label="Guidance" {...form.getInputProps('guidance')} /> */}
          <Button type="submit" loading={createEmotionMutation.isLoading}>Submit</Button>
        </Stack>
      </form>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Category</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Message</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {emotions.map((emotion) => (
            <Table.Tr key={emotion._id}>
              <Table.Td>{emotion.category}</Table.Td>
              <Table.Td>{emotion.name}</Table.Td>
              <Table.Td>{emotion.description}</Table.Td>
              <Table.Td>{emotion.message}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Debugger data={emotions} />
    </Stack>
  )
}

export default Emotions