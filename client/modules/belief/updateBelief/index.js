import { Button, Modal, TextInput, Textarea, Select, Stack, Group, ActionIcon, Tooltip } from "@mantine/core";
import React, { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TfiPencil } from "react-icons/tfi";
import useAuthStore from "../../auth/store";
import { apiUrl } from "../../utils/config";

const BELIEF_LEVEL_OPTIONS = [
  { value: '0', label: "Je sais que l'idée est fausse et je n'y prete pas attention" },
  { value: '1', label: "Je sais que l'idée est fausse et je ne m'y empecher d'y preter attention" },
  { value: '2', label: "Parfois surtout quand ca ne va pas bien j'y prete attention" },
  { value: '3', label: "Souvent je pense qu'elle est vraie" },
  { value: '4', label: "J'y crois tellement que je pense qu'elle fait partie de moi et de ma personnalité" },
];

const UpdateBelief = ({ belief, refetch }) => {
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

  // Mettre à jour le formulaire quand la croyance change
  useEffect(() => {
    if (belief && opened) {
      form.setValues({
        belief: belief.belief || '',
        belielLevel: belief.belielLevel !== undefined ? String(belief.belielLevel) : '0',
        mirrorBelief: belief.mirrorBelief || '',
        mirrorBeliefReason: belief.mirrorBeliefReason || '',
        mirrorResponse: belief.mirrorResponse || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [belief, opened]);

  const updateBeliefMutation = useMutation({
    mutationFn: async (beliefData) => {
      const response = await axios.put(`${apiUrl}/beliefs/${belief._id}`, beliefData, {
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
      if (refetch) {
        refetch();
      }
    },
    onError: (error) => {
      console.error('Error updating belief:', error);
    },
  });

  const handleSubmit = (values) => {
    // Convertir la valeur string du select en nombre
    const beliefData = {
      ...values,
      belielLevel: parseInt(values.belielLevel, 10)
    };
    updateBeliefMutation.mutate(beliefData);
  };

  return (
    <>
      <Tooltip label="Modifier la croyance">
        <ActionIcon
          color="blue"
          variant="light"
          onClick={open}
        >
          <TfiPencil size={18} />
        </ActionIcon>
      </Tooltip>
      
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Modifier la croyance" 
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
                disabled={updateBeliefMutation.isPending}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                loading={updateBeliefMutation.isPending}
              >
                Modifier
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};

export default UpdateBelief;

