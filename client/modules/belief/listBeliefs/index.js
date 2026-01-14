import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Group,
  Pagination,
  Center,
  Stack,
  Loader,
  Paper,
  Badge,
  Text,
} from "@mantine/core";
import {
  HiMiniChevronUpDown,
  HiMiniChevronDown,
  HiMiniChevronUp,
} from "react-icons/hi2";
import { format } from "date-fns";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import useBeliefStore from "../store";
import { apiUrl } from "../../utils/config";
import EmptyList from "../../ui/emptyList";
import UpdateBelief from "../updateBelief";
import DeleteBelief from "../deleteBelief";

const ListBeliefs = () => {
  const [isClient, setIsClient] = useState(false);
  const { token, userId } = useAuthStore((state) => ({
    token: state.token,
    userId: state.user?.id,
  }));
  const { setBeliefs } = useBeliefStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "descending",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const beliefsPerPage = 10;

  const getBeliefDate = (belief) => {
    if (belief.createdAt) {
      return new Date(belief.createdAt);
    }
    // Si pas de createdAt, on utilise une date par défaut
    return new Date();
  };

  const formatBeliefDate = (belief, formatString) => {
    try {
      const date = getBeliefDate(belief);
      return format(date, formatString);
    } catch (error) {
      return "N/A";
    }
  };

  const fetchBeliefs = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/beliefs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch beliefs");
    }
  };

  const {
    data: beliefs = [],
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["ListBeliefs", userId],
    queryFn: fetchBeliefs,
    enabled: !!userId && !!token && isClient,
  });

  useEffect(() => {
    if (beliefs && beliefs.length > 0) {
      setBeliefs(beliefs);
    }
  }, [beliefs, setBeliefs]);

  const sortedBeliefs = useMemo(() => {
    let sortedData = [...beliefs];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        if (sortConfig.key === "createdAt") {
          const aDate = getBeliefDate(a);
          const bDate = getBeliefDate(b);
          return sortConfig.direction === "ascending"
            ? aDate - bDate
            : bDate - aDate;
        }
        if (sortConfig.key === "belielLevel") {
          return sortConfig.direction === "ascending"
            ? (a.belielLevel || 0) - (b.belielLevel || 0)
            : (b.belielLevel || 0) - (a.belielLevel || 0);
        }
        if (sortConfig.key === "belief") {
          return sortConfig.direction === "ascending"
            ? a.belief.localeCompare(b.belief)
            : b.belief.localeCompare(a.belief);
        }
        return 0;
      });
    }
    return sortedData;
  }, [beliefs, sortConfig]);

  const indexOfLastBelief = currentPage * beliefsPerPage;
  const indexOfFirstBelief = indexOfLastBelief - beliefsPerPage;
  const currentBeliefs = sortedBeliefs.slice(indexOfFirstBelief, indexOfLastBelief);

  const onSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
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

  const BELIEF_LEVEL_LABELS = {
    0: "Je sais que l'idée est fausse et je n'y prete pas attention",
    1: "Je sais que l'idée est fausse et je ne m'y empecher d'y preter attention",
    2: "Parfois surtout quand ca ne va pas bien j'y prete attention",
    3: "Souvent je pense qu'elle est vraie",
    4: "J'y crois tellement que je pense qu'elle fait partie de moi et de ma personnalité",
  };

  const getBeliefLevelLabel = (level) => {
    const label = BELIEF_LEVEL_LABELS[level] || "Niveau inconnu";
    // Capitaliser seulement la première lettre
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  const getBeliefLevelColor = (level) => {
    // Les valeurs élevées (3, 4) sont plus dangereuses donc rouge/orange
    // Les valeurs faibles (0, 1) sont moins dangereuses donc vert/jaune
    if (level === 4) return "red";      // Le plus dangereux
    if (level === 3) return "orange";    // Dangereux
    if (level === 2) return "yellow";   // Moyen
    if (level === 1) return "blue";      // Moins dangereux
    if (level === 0) return "green";     // Le moins dangereux
    return "gray";
  };

  if (!isClient) {
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

  if (isError) return <div>Error fetching beliefs</div>;

  if (beliefs.length === 0)
    return (
      <EmptyList
        title={"Your Beliefs are Empty"}
        message={
          "It looks like you haven't created any beliefs yet. Why not start exploring your beliefs now?"
        }
      />
    );

  return (
    <>
      <Stack justify="space-between" h={"85vh"}>
        {sortedBeliefs.length > 0 && (
          <>
            <Table bg="white" withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w="40%" onClick={() => onSort("belief")}>
                    Belief {renderSortIcon("belief")}
                  </Table.Th>
                  <Table.Th onClick={() => onSort("belielLevel")}>
                    Level {renderSortIcon("belielLevel")}
                  </Table.Th>
                  <Table.Th>Mirror Belief</Table.Th>
                  <Table.Th onClick={() => onSort("createdAt")}>
                    Created {renderSortIcon("createdAt")}
                  </Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {currentBeliefs.map((belief) => (
                  <Table.Tr key={belief._id}>
                    <Table.Td>
                      <Stack>
                        <Text size="sm" fw={500}>
                          {belief.belief}
                        </Text>
                        {belief.mirrorBeliefReason && (
                          <Text size="xs" c="dimmed">
                            Reason: {belief.mirrorBeliefReason}
                          </Text>
                        )}
                        {belief.mirrorResponse && (
                          <Text size="xs" c="dimmed">
                            Response: {belief.mirrorResponse}
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      {belief.belielLevel !== undefined && (
                        <Badge
                          color={getBeliefLevelColor(belief.belielLevel)}
                          variant="light"
                          
                        >
                          {getBeliefLevelLabel(belief.belielLevel)}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {belief.mirrorBelief || "No mirror belief"}
                      </Text>
                    </Table.Td>
                    <Table.Td visibleFrom="md">
                      {formatBeliefDate(belief, "eeee dd MMM")}
                    </Table.Td>
                    <Table.Td hiddenFrom="md">
                      {formatBeliefDate(belief, "dd/MM")}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <UpdateBelief belief={belief} refetch={refetch} />
                        <DeleteBelief belief={belief} refetch={refetch} />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            <Center mt="md">
              <Pagination
                total={Math.ceil(sortedBeliefs.length / beliefsPerPage)}
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

export default ListBeliefs;
