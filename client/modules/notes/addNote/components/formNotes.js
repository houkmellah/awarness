import React from "react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  Center,
  Stack,
  Button,
  Textarea,
  MultiSelect,
  TagsInput,
  Group,
  ActionIcon,
  Modal,
  TextInput,
  Select
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
import useBeliefStore from "../../../belief/store";
import Debugger from "../../../debugger";
import AudioRecorder from "../../../transcription";
import RewriteNote from "../../rewriteNote";
import { MdAdd } from "react-icons/md";

const BELIEF_LEVEL_OPTIONS = [
  { value: '0', label: "Je sais que l'idée est fausse et je n'y prete pas attention" },
  { value: '1', label: "Je sais que l'idée est fausse et je ne m'y empecher d'y preter attention" },
  { value: '2', label: "Parfois surtout quand ca ne va pas bien j'y prete attention" },
  { value: '3', label: "Souvent je pense qu'elle est vraie" },
  { value: '4', label: "J'y crois tellement que je pense qu'elle fait partie de moi et de ma personnalité" },
];

const FormNotes = ({ note }) => {
  const queryClient = useQueryClient();
  let dateValue = note?.date ? new Date(note.date) : new Date();
  const { token, userId } = useAuthStore();
  
  // États pour le modal de création de belief
  const [opened, { open, close }] = useDisclosure(false);
  
  // Formulaire pour créer un nouveau belief
  const beliefForm = useForm({
    initialValues: {
      belief: '',
      belielLevel: '0',
    },
    validate: {
      belief: (value) => (value.length < 3 ? 'Le belief doit contenir au moins 3 caractères' : null),
    },
  });

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
  const { beliefs, setBeliefs } = useBeliefStore();
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
  }));

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
      beliefs: note?.beliefs?.map(belief => typeof belief === 'object' ? belief._id : belief) ?? [],
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

  // Mutation pour créer un nouveau belief
  const createBeliefMutation = useMutation({
    mutationFn: (beliefData) =>
      axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/beliefs`,
        beliefData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    onSuccess: (data) => {
      const newBelief = data.data;
      // Ajouter le nouveau belief au store
      setBeliefs([...beliefs, newBelief]);
      
      // Ajouter le nouveau belief à la sélection actuelle
      form.setFieldValue("beliefs", [...form.values.beliefs, newBelief._id]);
      
      // Fermer le modal et réinitialiser le formulaire
      close();
      beliefForm.reset();
      
      // Invalider la requête pour rafraîchir les données
      queryClient.invalidateQueries(["ListBeliefs"]);
    },
  });

  // Fonction pour soumettre le nouveau belief
  const handleSubmitBelief = (values) => {
    // Convertir la valeur string du select en nombre
    const beliefData = {
      ...values,
      belielLevel: parseInt(values.belielLevel, 10)
    };
    createBeliefMutation.mutate(beliefData);
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

  // Utiliser les beliefs du store au lieu d'une requête directe
  const beliefsData = (beliefs || [])
    .filter((belief) => belief && belief._id && belief.belief) // Filtrer les beliefs valides
    .map((belief) => ({
      value: String(belief._id), // S'assurer que c'est une chaîne
      label: String(belief.belief), // S'assurer que c'est une chaîne
    }));

  // Debug: vérifier les données des beliefs
  console.log("beliefs from store:", beliefs);
  console.log("beliefsData:", beliefsData);
  console.log("form.values.beliefs:", form.values.beliefs);

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

  // Fonction pour mettre à jour le champ de note avec la transcription
  const handleTranscriptionUpdate = (transcription) => {
    form.setFieldValue("note", transcription);
  };

  const handleRewrite = (newText) => {
    form.setFieldValue('note', newText);
  };

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
      <Group justify="flex-end">
        <AudioRecorder onTranscriptionUpdate={handleTranscriptionUpdate} />
      </Group>
      <RewriteNote note={note} onRewrite={handleRewrite} />
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
      <Group align="flex-end">
        <MultiSelect
          label="Beliefs"
          placeholder="Select beliefs"
          data={beliefsData || []}
          {...form.getInputProps("beliefs")}
          searchable
          style={{ flex: 1 }}
        />
        <ActionIcon
          onClick={open}
          variant="filled"
          color="blue"
          size="lg"
          title="Ajouter un nouveau belief"
        >
          <MdAdd size={20} />
        </ActionIcon>
      </Group>
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

      {/* Modal pour créer un nouveau belief */}
      <Modal opened={opened} onClose={close} title="Ajouter un nouveau belief" size="md">
        <form onSubmit={beliefForm.onSubmit(handleSubmitBelief)}>
          <Stack>
            <TextInput
              label="Belief"
              placeholder="Entrez votre belief"
              {...beliefForm.getInputProps("belief")}
              required
            />
            <Select
              label="Niveau de conviction"
              placeholder="Sélectionnez votre niveau de conviction"
              data={BELIEF_LEVEL_OPTIONS}
              searchable
              required
              {...beliefForm.getInputProps("belielLevel")}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={close}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                loading={createBeliefMutation.isPending}
              >
                Ajouter
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </form>
  );
};

export default FormNotes;
