import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Table,
  Group,
  Tooltip,
  Avatar,
  Pagination,
  Center,
  Stack,
  Badge,
  Loader,
  Paper,
  Text,
  TextInput,
  HoverCard,
  Box,
  Divider,
  Overlay,
  ActionIcon,
  CopyButton,
} from "@mantine/core";
import {
  HiMiniChevronUpDown,
  HiMiniChevronDown,
  HiMiniChevronUp,
  HiMagnifyingGlass,
  HiOutlineClipboardDocument,
} from "react-icons/hi2";
import { GetFullIcon } from "../../getFullIcon";
import { format } from "date-fns";
import axios from "axios";
import DeleteNote from "../deleteNote";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import usePeopleStore from "../../people/addPerson/store/usePeopleStore";
import useEmotionsStore from "../../emotions/store";
import useClaimsStore from "../../claims/store";
import useFearsStore from "../../fears/store";
import useBeliefStore from "../../belief/store";
import UpdateNote from "../updateNote";
import getInitials from "../../utils/getInitials";
import EmptyList from "../../ui/emptyList";
import { fetchPeople } from "../../people/api/fetchPeople";
import { apiUrl } from "../../utils/config";
import { lifeAspects } from "../../utils/data";
import AddEgo from "../../ego/addEgo";
import Debugger from "../../debugger";
import useExpectationStore from "../../expectations/store";

const categoryColors = {
  doute: "blue",
  refus: "orange",
  colère: "red",
  stress: "yellow",
  agréable: "green",
};

const LifeAspectBadge = ({ aspect }) => {
  const aspectInfo = lifeAspects.find((a) => a.value === aspect);
  if (!aspectInfo) return null;

  const Icon = aspectInfo.icon;
  return (
    <Badge
      variant="filled"
      color={aspectInfo.color}
      leftSection={<Icon size={19} />}
      fz={12}
      size="sm"
    >
      {aspectInfo.value}
    </Badge>
  );
};

const escapeRegex = (str) =>
  String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedText = ({ text, highlight }) => {
  if (text == null || text === "") return null;
  if (!highlight || !String(highlight).trim()) return <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>;

  const escaped = escapeRegex(highlight);
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = String(text).split(regex);

  return (
    <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            style={{
              backgroundColor: "var(--mantine-color-yellow-2)",
              padding: "0 2px",
              borderRadius: 2,
              display: "inline",
            }}
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </div>
  );
};

const ListNotes = () => {
  const router = useRouter();
  const { personId: urlPersonId, personName: urlPersonName } = router.query;
  const [notification, setNotification] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedExpectation, setSelectedExpectation] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const { expectations } = useExpectationStore();
  const { claims } = useClaimsStore();
  const { fears } = useFearsStore();
  const { beliefs } = useBeliefStore();
  const { token, userId } = useAuthStore((state) => ({
    token: state.token,
    userId: state.user?.id,
  }));

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });
  let people;

  const { people: peopleFromStore, setPeople } = usePeopleStore();
  const { emotions } = useEmotionsStore();
  const {
    data: peopleFromQuery = [],
    
  } = useQuery({
    queryKey: ["people", userId],
    queryFn: () => fetchPeople(token),
    enabled: !!peopleFromStore && !!token,
    onSuccess: (data) => setPeople(data),
  });

  people = peopleFromStore && peopleFromQuery;

  // Initialiser le store des beliefs si nécessaire
  const { setBeliefs } = useBeliefStore();
  
  useEffect(() => {
    const initializeBeliefs = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/beliefs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBeliefs(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des beliefs:", error);
      }
    };

    if (token && userId && beliefs.length === 0) {
      initializeBeliefs();
    }
  }, [token, userId, setBeliefs, beliefs.length]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (urlPersonId && typeof urlPersonId === "string") {
      setSelectedPerson({
        id: urlPersonId,
        name: typeof urlPersonName === "string" ? decodeURIComponent(urlPersonName) : "Personne",
      });
    }
  }, [urlPersonId, urlPersonName]);

  const clearPersonFilter = () => {
    setSelectedPerson(null);
    router.replace("/notes", undefined, { shallow: true });
  };

  const fetchNotes = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch notes");
    }
  };

  const {
    data: notes = [],
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["ListNotes", userId], // Use userId in queryKey instead of token
    queryFn: fetchNotes,

    enabled: !!userId && !!token, // Only run query if both userId and token exist
  });

  const sortedNotes = useMemo(() => {
    let sortedData = [...notes];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        if (sortConfig.key === "date") {
          return sortConfig.direction === "ascending"
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        if (sortConfig.key === "lifeAspect") {
          const aAspect = a.lifeAspect[0] || "";
          const bAspect = b.lifeAspect[0] || "";
          return sortConfig.direction === "ascending"
            ? aAspect.localeCompare(bAspect)
            : bAspect.localeCompare(aAspect);
        }
        if (sortConfig.key === "emotions") {
          const aEmotion = a.emotions[0] || "";
          const bEmotion = b.emotions[0] || "";
          return sortConfig.direction === "ascending"
            ? aEmotion.localeCompare(bEmotion)
            : bEmotion.localeCompare(aEmotion);
        }
        if (sortConfig.key === "rating") {
          return sortConfig.direction === "ascending"
            ? (a.rating || 0) - (b.rating || 0)
            : (b.rating || 0) - (a.rating || 0);
        }
        return 0;
      });
    }
    return sortedData;
  }, [notes, sortConfig]);

  const filteredNotes = useMemo(() => {
    return sortedNotes.filter((note) => {
      const matchesTag = selectedTag
        ? (note?.tags || []).some(
            (tag) =>
              typeof tag === "string" &&
              tag.toLowerCase() === selectedTag.toLowerCase()
          )
        : true;

      const matchesExpectation = selectedExpectation
        ? (note?.expectations || []).some((expectation) => {
            const expectationId =
              expectation && typeof expectation === "object"
                ? String(expectation._id || "")
                : String(expectation || "");
            return expectationId === selectedExpectation.id;
          })
        : true;

      const matchesPerson = selectedPerson
        ? (note?.people || []).some((p) => {
            const pid = p && typeof p === "object" ? String(p._id || "") : String(p || "");
            return pid === selectedPerson.id;
          })
        : true;

      const q = (searchQuery || "").trim().toLowerCase();
      const matchesSearch = !q
        ? true
        : (() => {
            const noteText = (note?.note || "").toLowerCase();
            const tagsStr = (note?.tags || []).map((t) => (t || "").toLowerCase()).join(" ");
            const lifeAspectStr = (note?.lifeAspect || []).join(" ").toLowerCase();
            const emotionNames = (note?.emotions || [])
              .map((eId) => emotions.find((e) => e._id === eId)?.name || "")
              .join(" ")
              .toLowerCase();
            const expectationNames = (note?.expectations || [])
              .map((exp) => {
                const id = exp && typeof exp === "object" ? exp._id : exp;
                return expectations.find((e) => e._id === id)?.name || "";
              })
              .join(" ")
              .toLowerCase();
            const peopleNames = (note?.people || [])
              .map((p) => {
                if (!p || typeof p !== "object") return "";
                return [p.firstName, p.secondName, p.nickName].filter(Boolean).join(" ");
              })
              .join(" ")
              .toLowerCase();
            const searchable = `${noteText} ${tagsStr} ${lifeAspectStr} ${emotionNames} ${expectationNames} ${peopleNames}`;
            return searchable.includes(q);
          })();

      return matchesTag && matchesExpectation && matchesPerson && matchesSearch;
    });
  }, [sortedNotes, selectedTag, selectedExpectation, selectedPerson, searchQuery, emotions, expectations]);

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag, selectedExpectation, selectedPerson, searchQuery]);

  const onSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };
  const getEmotionName = (value) => {
    const emotion = emotions.find((e) => e._id === value);
    return emotion ? emotion.name : "Unknown";
  };
  const getBeliefName = (value) => {
    console.log("value belief ===>", value);
    console.log("beliefs ===>", beliefs);   
    const belief = beliefs.find((b) => b._id === value._id);
    console.log("belief found ====>", belief);
    return belief ? belief.belief : "Unknown";
  };
  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? (
        <HiMiniChevronDown />
      ) : (
        <HiMiniChevronUp />
      );
    }
    return <HiMiniChevronUpDown />;
  };

  const getEmotionCategoryColor = (value) => {
    const emotion = emotions.find((e) => e._id === value);
    const categoryName = emotion ? emotion.category : "Unknown";
    return categoryColors[categoryName];
  };

  const isTagSelected = (tag) =>
    Boolean(
      selectedTag &&
        typeof tag === "string" &&
        tag.toLowerCase() === selectedTag.toLowerCase()
    );

  const isExpectationSelected = (expectationId) =>
    Boolean(selectedExpectation && selectedExpectation.id === expectationId);

  if (!isMounted || isLoading) {
    return (
      <Paper
        h="90vh"
        w="100%"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        bg="transparent"
      >
        <Center>
          <Loader color="blue" size="xl" type="bars" />
        </Center>
      </Paper>
    );
  }
  if (isError) return <div>Error fetching notes</div>;

  const emptyMessage =
    notes.length === 0
      ? "Votre carnet est vide. Créez votre première note !"
      : searchQuery.trim()
        ? `Aucune note ne correspond à "${searchQuery}".`
        : selectedTag || selectedExpectation || selectedPerson
          ? "Aucune note ne correspond aux filtres sélectionnés."
          : null;

  return (
    <>
      <Stack justify="space-between" h={"85vh"}>
        <TextInput
          placeholder="Rechercher dans les notes, tags, émotions, personnes..."
          leftSection={<HiMagnifyingGlass size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="sm"
        />
        {true && (
        <>
            {(selectedTag || selectedExpectation || selectedPerson) && (
              <Group justify="space-between">
                <Group gap="xs">
                  {selectedTag && (
                    <Text size="sm">
                      Tag: <strong>{selectedTag}</strong>
                    </Text>
                  )}
                  {selectedExpectation && (
                    <Text size="sm">
                      Attente: <strong>{selectedExpectation.name}</strong>
                    </Text>
                  )}
                  {selectedPerson && (
                    <Text size="sm">
                      Personne: <strong>{selectedPerson.name}</strong>
                    </Text>
                  )}
                </Group>
                <Group gap="xs">
                  {selectedTag && (
                    <Badge
                      variant="outline"
                      color="red"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedTag(null)}
                    >
                      Effacer tag
                    </Badge>
                  )}
                  {selectedExpectation && (
                    <Badge
                      variant="outline"
                      color="red"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedExpectation(null)}
                    >
                      Effacer attente
                    </Badge>
                  )}
                  {selectedPerson && (
                    <Badge
                      variant="outline"
                      color="red"
                      style={{ cursor: "pointer" }}
                      onClick={clearPersonFilter}
                    >
                      Effacer personne
                    </Badge>
                  )}
                </Group>
              </Group>
            )}
            <Table bg="white" withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w="40%">Note</Table.Th>
                  <Table.Th onClick={() => onSort("emotions")}>
                    Emotions {renderSortIcon("emotions")}
                  </Table.Th>
                  <Table.Th onClick={() => onSort("date")}>
                    Date {renderSortIcon("date")}
                  </Table.Th>
                  <Table.Th onClick={() => onSort("rating")}>
                    Rating {renderSortIcon("rating")}
                  </Table.Th>
                  <Table.Th onClick={() => onSort("lifeAspect")}>
                    Life Aspect {renderSortIcon("lifeAspect")}
                  </Table.Th>
                  <Table.Th>People</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {currentNotes.length > 0 ? (
                  currentNotes.map((note) => (
                  <Table.Tr key={note._id}>
                    <Table.Td>
                      <Stack>
                        <Group gap="xs" align="flex-start" wrap="nowrap">
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <HighlightedText text={note.note} highlight={searchQuery} />
                          </Box>
                          <CopyButton value={note?.note || ""}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? "Copié !" : "Copier la description"}>
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  color={copied ? "teal" : "gray"}
                                  onClick={copy}
                                >
                                  <HiOutlineClipboardDocument size={18} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        </Group>
                        <Group>
                          {(note?.tags || []).map((tag, index) => (
                            <Badge
                              key={`tag-${index}-${tag}`}
                              variant={isTagSelected(tag) ? "filled" : "outline"}
                              color={isTagSelected(tag) ? "blue" : "gray"}
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                setSelectedTag((prev) =>
                                  prev &&
                                  typeof prev === "string" &&
                                  typeof tag === "string" &&
                                  prev.toLowerCase() === tag.toLowerCase()
                                    ? null
                                    : tag
                                )
                              }
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(note?.expectations || []).map((expectation, index) => {
                            const expectationId =
                              expectation && typeof expectation === "object"
                                ? String(expectation._id || "")
                                : String(expectation || "");
                            const expectationName =
                              expectation && typeof expectation === "object"
                                ? expectation.name
                                : expectations.find((e) => e._id === expectationId)
                                    ?.name;

                            if (!expectationId) return null;

                            return (
                              <Badge
                                key={`expectation-${expectationId}-${index}`}
                                variant={
                                  isExpectationSelected(expectationId)
                                    ? "filled"
                                    : "outline"
                                }
                                color={
                                  isExpectationSelected(expectationId)
                                    ? "blue"
                                    : "indigo"
                                }
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setSelectedExpectation((prev) =>
                                    prev?.id === expectationId
                                      ? null
                                      : {
                                          id: expectationId,
                                          name: expectationName || "Attente",
                                        }
                                  )
                                }
                              >
                                {expectationName || "Unknown"}
                              </Badge>
                            );
                          })}
                          {note?.claims?.map((claim) => (
                            <Badge
                              key={`claim-${claim}`}
                              variant="outline"
                              color="red"
                            >
                              {claims.find((c) => c._id === claim)?.title}
                            </Badge>
                          ))}
                          {note?.fears?.map((fear) => (
                            <Badge
                              key={`fear-${fear}`}
                              variant="outline"
                              color="orange"
                            >
                              {fears.find((f) => f._id === fear)?.title}
                            </Badge>
                          ))}
                          {note?.beliefs?.map((belief) => (
                            <Badge
                              key={`belief-${belief}`}
                              variant="outline"
                              color="purple"
                            >
                              {getBeliefName(belief)}
                            </Badge>
                          ))}
                        </Group>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Stack>
                        {note?.emotions.map((emotionId, index) => {
                          const emotionObj = emotions.find((e) => e._id === emotionId);
                          if (!emotionObj) return null;
                          const color = getEmotionCategoryColor(emotionId);
                          return (
                            <HoverCard
                              key={index}
                              width={400}
                              size="lg"
                              position="bottom-start"
                              shadow="md"
                              withArrow
                              closeDelay={0}
                            >
                              <HoverCard.Target>
                                <Badge
                                  color={color}
                                  style={{ cursor: "pointer" }}
                                >
                                  {getEmotionName(emotionId)}
                                </Badge>
                              </HoverCard.Target>
                              <HoverCard.Dropdown
                                p={0}
                                style={{
                                  border: "none",
                                  borderRadius: 12,
                                  overflow: "hidden",
                                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                                }}
                              >
                                <Overlay
                                  color="#000"
                                  backgroundOpacity={0.25}
                                  fixed
                                  style={{ zIndex: -1, pointerEvents: "none" }}
                                />
                                <Box
                                  p="md"
                                  style={{
                                    position: "relative",
                                    zIndex: 1,
                                    background: `linear-gradient(135deg, var(--mantine-color-${color}-0) 0%, var(--mantine-color-${color}-1) 100%)`,
                                  }}
                                >
                                  <Badge
                                    color={color}
                                    variant="filled"
                                    size="lg"
                                    style={{ textTransform: "capitalize", marginBottom: 8 }}
                                  >
                                    {emotionObj.category}
                                  </Badge>
                                  <Text size="lg" fw={700} c="dark.8" lh={1.2}>
                                    {emotionObj.name}
                                  </Text>
                                </Box>
                                <Box p="md" bg="gray.0">
                                  {emotionObj.description && (
                                    <>
                                      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>
                                        Description
                                      </Text>
                                      <Text size="sm" mb={emotionObj.message ? "md" : 0} lh={1.6} c="dark.7">
                                        {emotionObj.description}
                                      </Text>
                                      {emotionObj.message && <Divider my="sm" />}
                                    </>
                                  )}
                                  {emotionObj.message && (
                                    <>
                                      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>
                                        Message
                                      </Text>
                                      <Text
                                        size="sm"
                                        fs="italic"
                                        c="dark.6"
                                        lh={1.6}
                                        style={{
                                          fontFamily: "Georgia, serif",
                                        }}
                                      >
                                        "{emotionObj.message}"
                                      </Text>
                                    </>
                                  )}
                                </Box>
                              </HoverCard.Dropdown>
                            </HoverCard>
                          );
                        })}
                      </Stack>
                    </Table.Td>
                    <Table.Td visibleFrom="md">
                      {format(new Date(note.date), "eeee dd MMM")}
                    </Table.Td>
                    <Table.Td hiddenFrom="md">
                      {format(new Date(note.date), "dd/MM")}
                    </Table.Td>

                    <Table.Td>
                      {note.rating > 0 && <GetFullIcon value={note.rating} />}
                    </Table.Td>
                    <Table.Td>
                      <LifeAspectBadges aspects={note.lifeAspect} />
                    </Table.Td>

                    <Table.Td>
                      <Avatar.Group spacing="sm">
                        {note?.people?.map((person) => {
                          // const person = people.find((p) => p._id === personId);
                          return person ? (
                            <Tooltip
                              key={person._id}
                              label={`${person?.firstName} ${person?.secondName} ${person?.nickName}`}
                              withArrow
                            >
                              <Avatar radius="xl">
                                {getInitials(
                                  `${person?.firstName || ""} ${
                                    person?.secondName || ""
                                  }`
                                )}
                              </Avatar>
                            </Tooltip>
                          ) : null;
                        })}
                      </Avatar.Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="end">
                        <AddEgo note={note} />
                        <UpdateNote note={note} />
                        <DeleteNote
                          id={note._id}
                          notification={notification}
                          setNotification={setNotification}
                          refetch={refetch}
                        />
                      </Group>
                    </Table.Td>
                    {/* <Debugger data={note?.expectations} /> */}
                  </Table.Tr>
                ))
                ) : (
                  <Table.Tr key="empty">
                    <Table.Td colSpan={8}>
                      <Text c="dimmed" ta="center" py="xl">
                        {emptyMessage || "Aucune note"}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
            {/* <Debugger data={emotions} /> */}
            <Center mt="md">
              <Pagination
                total={Math.ceil(filteredNotes.length / notesPerPage)}
                value={currentPage}
                onChange={setCurrentPage}
              />
            </Center>
          </>
        )}
      </Stack>
    </>
  );
};

const LifeAspectBadges = ({ aspects }) => {
  return (
    <Stack gap="xs">
      {aspects.map((aspect, index) => (
        <LifeAspectBadge key={index} aspect={aspect} />
      ))}
    </Stack>
  );
};

export default ListNotes;
