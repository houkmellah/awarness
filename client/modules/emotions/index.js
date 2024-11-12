import React from 'react'
import { useForm } from '@mantine/form';
import { Button, Select, Stack, Textarea, TextInput } from '@mantine/core';
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

  const createEmotionMutation = useMutation({
    mutationFn: (values) => axios.post(`${apiUrl}/emotions`, values, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  });

  const handleSubmit = (values) => {
    createEmotionMutation.mutate(values);
  }

  const fetchEmotions = async (token) => {
    try {
      const { data } = await axios.get(`${apiUrl}/emotions`, {
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
  const {
    data: emotions = [],
  
  } = useQuery({
    queryKey: ["ListPeople"],
    queryFn: () => fetchEmotions(token),
    onSuccess: (data) => {
      console.log(data)
      setEmotions(data);
    },
    enabled: !!token,
  });


  return (
    <Stack>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack>
          <Stack>
            <Select label="Category" {...form.getInputProps('category')} data={categories} />
            <TextInput label="Name" {...form.getInputProps('name')} />
            <Textarea label="Description" {...form.getInputProps('description')} />
            <Textarea label="Message" {...form.getInputProps('message')} />
          </Stack>
          {/* <TextInput label="Guidance" {...form.getInputProps('guidance')} /> */}
          <Button type="submit" loading={createEmotionMutation.isLoading}>Submit</Button>
        </Stack>
      </form>
      <Debugger data={emotions} />
    </Stack>
  )
}

export default Emotions