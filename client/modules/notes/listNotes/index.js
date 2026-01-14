import React, { useState, useMemo, useEffect } from "react";
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
} from "@mantine/core";
import {
  HiMiniChevronUpDown,
  HiMiniChevronDown,
  HiMiniChevronUp,
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

const ListNotes = () => {
  const [notification, setNotification] = useState(null);
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

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = sortedNotes.slice(indexOfFirstNote, indexOfLastNote);

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

  if (isLoading) {
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

  if (notes.length === 0)
    return (
      <EmptyList
        title={"Your Notebook is Empty"}
        message={
          "It looks like you haven't created any notes yet. Why not start your journey now?"
        }
      />
    );

  return (
    <>
      <Stack justify="space-between" h={"85vh"}>
        {sortedNotes.length > 0 && (
          <>
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
                {currentNotes.map((note) => (
                  <Table.Tr key={note._id}>
                    <Table.Td>
                      <Stack>
                        {note.note}
                        <Group>
                          {note.tags.map((tag, index) => (
                            <Badge
                              key={`tag-${index}-${tag}`}
                              variant="outline"
                              color="gray"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {note?.expectations.map((expectation) => (
                            <Badge
                              key={`expectation-${expectation}`}
                              variant="outline"
                              color="blue"
                            >
                              {
                                expectations.find((e) => e._id === expectation)
                                  ?.name
                              }
                            </Badge>
                          ))}
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
                        {note?.emotions.map((emotion, index) => (
                          <Badge
                            key={index}
                            color={getEmotionCategoryColor(emotion)}
                          >
                            {getEmotionName(emotion)}
                          </Badge>
                        ))}
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
                ))}
              </Table.Tbody>
            </Table>
            {/* <Debugger data={emotions} /> */}
            <Center mt="md">
              <Pagination
                total={Math.ceil(sortedNotes.length / notesPerPage)}
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
