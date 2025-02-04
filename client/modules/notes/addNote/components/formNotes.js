import React from "react";
import { useForm } from "@mantine/form";
import {
  Center,
  Stack,
  Button,
  Textarea,
  MultiSelect,
  TagsInput,
  Group   
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import EmojiRating from "./emojiRating";
import ListPeople from "../../../people/addPerson/listPeople";
import useAuthStore from "../../../auth/store";
import { apiUrl } from "../../../utils/config";
import AddEgo from "../../../ego/addEgo";
import useExpectationStore from "../../../expectations/store";
import useClaimStore from "../../../claims/store";
import useFearStore from "../../../fears/store";
import Debugger from "../../../debugger";

const FormNotes = ({ note }) => {
  const queryClient = useQueryClient();
  let dateValue = note?.date ? new Date(note.date) : new Date();
  const { token } = useAuthStore();

  const lifeAspects = [
    "Spiritual",
    "Personnal-growth / Self Improvement",
    "Fitness",
    "Health",
    "Family",
    "Career",
    "Social",
    "Leisure",
    "Life Management",
    "Love PartnerShip",
  ];

  const { expectations } = useExpectationStore();
  const { fears } = useFearStore();
  const { claims } = useClaimStore();
  console.log("Claims ===>", claims);
  const expectationsData = expectations.map((expectation) => ({
    value: expectation._id,
    label: expectation.name,
  }));
  const claimsData = claims.map((claim) => ({
    value: claim._id,
    label: claim.title,
  }));
  const fearsData = fears.map((fear) => ({
    value: fear._id,
    label: fear.title,
  })) 

  console.log("Claim Data ====>", claimsData);
  // console.log(expectations)

  const form = useForm({
    initialValues: {
      note: note?.note ?? "",
      date: dateValue,
      rating: note?.rating ?? 0,
      lifeAspect: note?.lifeAspect ?? [],
      people: note?.people ?? [],
      tags: note?.tags ?? [],
      emotions: note?.emotions ?? [],
      expectations: note?.expectations ?? [],
      claims: note?.claims ?? [],
      fears: note?.fears ?? [],
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (values) =>
      axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/notes`,

        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["ListNotes"]);
      // Réinitialiser le formulaire au lieu de le fermer
      form.reset();
    },
    onError: (error) => {
      console.error("Failed to create note:", error);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: (values) =>
      axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/notes/${note._id}`,
        { ...values, token },
        {
          params: { token },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["ListNotes"]);
      // Ne pas fermer le modal, peut-être afficher un message de succès à la place
    },
    onError: (error) => {
      console.error("Failed to update note:", error);
    },
  });

  const handleSubmit = (values) => {
    if (note) {
      updateNoteMutation.mutate(values);
    } else {
      createNoteMutation.mutate(values);
    }
  };

  // Requête pour récupérer les tags de l'utilisateur
  const { data: tags, refetch: refetchTags } = useQuery({
    queryKey: ["tags"],
    queryFn: () =>
      axios
        .get(`${apiUrl}/tags`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data),
  });

  const createTagMutation = useMutation({
    mutationFn: (newTag) =>
      axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tags`,
        { name: newTag, color: "#000000" }, // Vous pouvez ajuster la couleur par défaut
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    onSuccess: () => {
      refetchTags();
    },
  });
  const handleCreateTag = (query) => {
    createTagMutation.mutate(query, {
      onSuccess: (data) => {
        const newTag = data.data;
        form.setFieldValue("tags", [...form.values.tags, newTag._id]);
      },
    });
    return null;
  };
  const fetchEmotions = async (token) => {
    try {
      const { data } = await axios.get(`${apiUrl}/emotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des personnes:", error);
      throw error;
    }
  };
  const { data: emotions = [] } = useQuery({
    queryKey: ["ListPeople"],
    queryFn: () => fetchEmotions(token),
    enabled: !!token,
  });

  const groupedEmotions = Object.values(
    emotions.reduce((acc, emotion) => {
      if (!acc[emotion.category]) {
        acc[emotion.category] = {
          group: emotion.category,
          items: [],
        };
      }
      acc[emotion.category].items.push({
        value: emotion._id,
        label: emotion.name,
      });
      return acc;
    }, {})
  );
  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Stack spacing="md" w="100%">
  <Group position="apart" grow align="flex-start">
    {/* Colonne gauche */}
    <Stack w="60%" spacing="xs" justify="flex-start">
      <Textarea 
        label="Note" 
        {...form.getInputProps("note")} 
        autosize 
        minRows={20}
      />
    </Stack>

    {/* Colonne droite */}
    <Stack w="40%" spacing="xs">
      <DateInput label="Date" {...form.getInputProps("date")} />
      <MultiSelect
        label="Life Aspects"
        placeholder="Select life aspects"
        data={lifeAspects}
        {...form.getInputProps("lifeAspect")}
      />
      <ListPeople form={form} />
      <MultiSelect
        maxDropdownHeight={200}
        label="Emotions"
        placeholder="Select emotions"
        data={groupedEmotions}
        {...form.getInputProps("emotions")}
        searchable
      />
      <MultiSelect
        label="Expectations"
        placeholder="Select expectations"
        data={expectationsData}
        {...form.getInputProps("expectations")}
        searchable
      />
      <MultiSelect
        label="Claims"
        placeholder="Select claims"
        data={claimsData}
        {...form.getInputProps("claims")}
        searchable
      />
      <MultiSelect
        label="Fears"
        placeholder="Select fears"
        data={fearsData}
        {...form.getInputProps("fears")}
        searchable
      />
      <TagsInput
        label="Tags"
        placeholder="Select or create tags"
        data={tags?.map((tag) => ({ value: tag._id, label: tag.name })) || []}
        {...form.getInputProps("tags")}
        searchable
        creatable
        getCreateLabel={(query) => `+ Create ${query}`}
        onCreate={handleCreateTag}
      />
      <Center>
        <EmojiRating
          value={form.values.rating}
          onChange={(value) => form.setFieldValue("rating", value)}
        />
      </Center>
    </Stack>
  </Group>

  {/* Bouton de soumission */}
  <Center>
    <Button
      type="submit"
      loading={createNoteMutation.isLoading || updateNoteMutation.isLoading}
    >
      {note ? "Update" : "Submit"}
    </Button>
  </Center>
</Stack>
    </form>
  );
};

export default FormNotes;
