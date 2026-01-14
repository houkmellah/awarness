import { Button, Modal, Text, TextInput, Textarea, Select, Stack, Group } from "@mantine/core";
import React from "react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MdPsychology } from "react-icons/md";
import useAuthStore from "../../auth/store";

const BELIEF_LEVEL_OPTIONS = [
  { value: '0', label: "Je sais que l'idée est fausse et je n'y prete pas attention" },
  { value: '1', label: "Je sais que l'idée est fausse et je ne m'y empecher d'y preter attention" },
  { value: '2', label: "Parfois surtout quand ca ne va pas bien j'y prete attention" },
  { value: '3', label: "Souvent je pense qu'elle est vraie" },
  { value: '4', label: "J'y crois tellement que je pense qu'elle fait partie de moi et de ma personnalité" },
];

const AddBelief = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      belief: '',
      belielLevel: '0',
      mirrorBelief: '',
      mirrorBeliefReason: '',
      mirrorResponse: ''
    },
    validate: {
      belief: (value) => (!value ? 'Belief is required' : null),
    },
  });

  const createBeliefMutation = useMutation({
    mutationFn: async (beliefData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/beliefs`, beliefData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ListBeliefs'] });
      form.reset();
      close();
    },
    onError: (error) => {
      console.error('Error creating belief:', error);
    },
  });

  const handleSubmit = (values) => {
    // Convertir la valeur string du select en nombre
    const beliefData = {
      ...values,
      belielLevel: parseInt(values.belielLevel, 10)
    };
    createBeliefMutation.mutate(beliefData);
  };

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Add Belief" 
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Belief"
              placeholder="Describe your belief..."
              required
              {...form.getInputProps('belief')}
            />
            
            <Select
              label="Niveau de conviction"
              placeholder="Sélectionnez votre niveau de conviction"
              data={BELIEF_LEVEL_OPTIONS}
              searchable
              required
              {...form.getInputProps('belielLevel')}
            />
            
            <Textarea
              label="Mirror Belief"
              placeholder="How this belief reflects in others..."
              minRows={3}
              {...form.getInputProps('mirrorBelief')}
            />
            
            <Textarea
              label="Mirror Belief Reason"
              placeholder="Why do you think this belief exists in others..."
              minRows={3}
              {...form.getInputProps('mirrorBeliefReason')}
            />
            
            <Textarea
              label="Mirror Response"
              placeholder="Your response or reflection on this mirror belief..."
              minRows={3}
              {...form.getInputProps('mirrorResponse')}
            />
            
            <Group justify="flex-end" mt="md">
              <Button 
                variant="outline" 
                onClick={close}
                disabled={createBeliefMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={createBeliefMutation.isPending}
              >
                Add
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      
      <Button
        onClick={open}
        leftSection={<MdPsychology size={24} />}
        variant="filled"
        color="purple"
      >
        <Text visibleFrom="md">Add Belief</Text>
      </Button>
    </>
  );
};

export default AddBelief;
