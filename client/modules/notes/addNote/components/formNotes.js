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

const sanitizeTags = (tags = []) => {
  if (!Array.isArray(tags)) return [];

  const seen = new Set();
  const cleanedTags = [];

  for (const tag of tags) {
    const value = typeof tag === "string" ? tag.trim() : "";
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleanedTags.push(value);
  }

  return cleanedTags;
};

const sanitizeSelectData = (items = [], valueKey, labelKey) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const rawValue = item?.[valueKey];
      const rawLabel = item?.[labelKey];
      const value = rawValue == null ? "" : String(rawValue).trim();
      const label = rawLabel == null ? "" : String(rawLabel).trim();
      return { value, label };
    })
    .filter((item) => item.value && item.label);

const FormNotes = ({ note, close: onClose }) => {
  const queryClient = useQueryClient();
  let dateValue = note?.date ? new Date(note.date) : new Date();
  const { token } = useAuthStore();
  
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

  const { expectations, setExpectations } = useExpectationStore();
  const { fears } = useFearStore();
  const { claims } = useClaimStore();
  const { beliefs, setBeliefs } = useBeliefStore();
  console.log("Claims ===>", claims);
  const expectationsData = sanitizeSelectData(expectations, "_id", "name");
  const claimsData = sanitizeSelectData(claims, "_id", "title");
  const fearsData = sanitizeSelectData(fears, "_id", "title");

  // console.log(expectations)

  const form = useForm({
    initialValues: {
      note: note?.note ?? "",
      date: dateValue,
      rating: note?.rating ?? 0,
      lifeAspect: note?.lifeAspect ?? [],
      people: note?.people ?? [],
      tags: sanitizeTags(note?.tags ?? []),
      emotions: note?.emotions ?? [],
      expectations: note?.expectations ?? [],
      claims: note?.claims ?? [],
      fears: note?.fears ?? [],
      beliefs: note?.beliefs?.map(belief => typeof belief === 'object' ? belief._id : belief) ?? [],
    },
  });

  const refetchExpectationsSorted = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/expectations/sorted-by-usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpectations(data);
    } catch (e) {
      console.error("Erreur refetch expectations:", e);
    }
  };

  const mergeNewTagsIntoCache = (newTags) => {
    if (!newTags || newTags.length === 0) return;
    queryClient.setQueryData(["tagSuggestions"], (old = []) => {
      const existingNames = new Set(
        (old || []).map((t) => (typeof t?.name === "string" ? t.name : "").toLowerCase())
      );
      const toAdd = newTags.filter(
        (t) => typeof t === "string" && t.trim() && !existingNames.has(t.trim().toLowerCase())
      );
      if (toAdd.length === 0) return old;
      return [
        ...(old || []),
        ...toAdd.map((name) => ({ name: name.trim(), count: 1 })),
      ];
    });
  };

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
    onSuccess: async (_data, variables) => {
      const savedTags = sanitizeTags(variables?.tags ?? []);
      mergeNewTagsIntoCache(savedTags);
      queryClient.invalidateQueries(["ListNotes"]);
      queryClient.invalidateQueries(["tagSuggestions"]);
      queryClient.refetchQueries(["tagSuggestions"]);
      await refetchExpectationsSorted();
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
    onSuccess: (_data, variables) => {
      const savedTags = sanitizeTags(variables?.tags ?? []);
      mergeNewTagsIntoCache(savedTags);
      queryClient.invalidateQueries(["ListNotes"]);
      queryClient.invalidateQueries(["tagSuggestions"]);
      queryClient.refetchQueries(["tagSuggestions"]);
      if (typeof onClose === "function") onClose();
    },
    onError: (error) => {
      console.error("Failed to update note:", error);
    },
  });

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      tags: sanitizeTags(values.tags),
    };

    if (note) {
      updateNoteMutation.mutate(payload);
    } else {
      createNoteMutation.mutate(payload);
    }
  };

  // Suggestions de tags déjà utilisés par l'utilisateur connecté
  const { data: tagSuggestions = [] } = useQuery({
    queryKey: ["tagSuggestions"],
    queryFn: () =>
      axios
        .get(`${apiUrl}/notes/tags/suggestions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data),
    enabled: !!token,
  });

  const tagSuggestionsData = sanitizeTags(
    tagSuggestions.map((tag) => (typeof tag?.name === "string" ? tag.name : ""))
  );

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
  const beliefsData = sanitizeSelectData(beliefs, "_id", "belief");

  // Debug: vérifier les données des beliefs
  console.log("beliefs from store:", beliefs);
  console.log("beliefsData:", beliefsData);
  console.log("form.values.beliefs:", form.values.beliefs);

  const groupedEmotions = Object.values(
    (Array.isArray(emotions) ? emotions : []).reduce((acc, emotion) => {
      const category = emotion?.category
        ? String(emotion.category).trim()
        : "Unknown";
      const value = emotion?._id == null ? "" : String(emotion._id).trim();
      const label = emotion?.name == null ? "" : String(emotion.name).trim();

      if (!value || !label) return acc;

      if (!acc[category]) {
        acc[category] = {
          group: category,
          items: [],
        };
      }

      acc[category].items.push({ value, label });
      return acc;
    }, {})
  ).filter((group) => group.items.length > 0);

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
        data={tagSuggestionsData}
        value={sanitizeTags(form.values.tags)}
        onChange={(values) => form.setFieldValue("tags", sanitizeTags(values))}
        searchable
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
