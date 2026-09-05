import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import DeletePerson from "../deletePerson";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  Group,
  Notification,
  Tooltip,
  Avatar,
  Pagination,
  Center,
  Stack,
  Box,
  Loader,
  Paper,
  TextInput,
} from "@mantine/core";
import { HiMagnifyingGlass } from "react-icons/hi2";
import {
  HiMiniChevronUpDown,
  HiMiniChevronDown,
  HiMiniChevronUp,
} from "react-icons/hi2";
import UpdatePerson from "../updatePerson";
import EmptyList from "../../ui/emptyList";
import { fetchPeople } from "../api/fetchPeople";
import useAuthStore from "../../auth/store";

function getInitials(fullName) {
  if (!fullName) return "";
  return fullName
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join("");
}

const ListPeople = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const [notification, setNotification] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "firstName",
    direction: "ascending",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const peoplePerPage = 13; // Vous pouvez ajuster ce nombre selon vos besoins

  const {
    data: people = [],
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["ListPeople"],
    queryFn: () => fetchPeople(token),
    enabled: !!token,
  });

  const sortedPeople = useMemo(() => {
    let sortedData = [...people];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortedData;
  }, [people, sortConfig]);

  const filteredPeople = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return sortedPeople;
    return sortedPeople.filter((person) => {
      const firstName = (person.firstName || "").toLowerCase();
      const secondName = (person.secondName || "").toLowerCase();
      const nickName = (person.nickName || "").toLowerCase();
      const fullName = `${firstName} ${secondName} ${nickName}`.trim();
      return (
        firstName.includes(q) ||
        secondName.includes(q) ||
        nickName.includes(q) ||
        fullName.includes(q)
      );
    });
  }, [sortedPeople, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination logic
  const indexOfLastPerson = currentPage * peoplePerPage;
  const indexOfFirstPerson = indexOfLastPerson - peoplePerPage;
  const currentPeople = filteredPeople.slice(
    indexOfFirstPerson,
    indexOfLastPerson
  );

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

  if (isLoading) {
    return (
      <Paper
        h="80vh"
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

  if (isError) return <div>Error fetching people</div>;

  if (people.length === 0)
    return (
      <EmptyList
        title={"Your People List is Empty"}
        message={
          "You haven't added any people to your list yet. Start building your network today!"
        }
      />
    );

  return (
    <Stack>
      <TextInput
        placeholder="Rechercher par prénom, nom ou surnom..."
        leftSection={<HiMagnifyingGlass size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="md"
      />
      {filteredPeople.length > 0 ? (
        <>
          <Box style={{ overflowY: "auto", flex: 1 }}>
            <Table bg="white" withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th onClick={() => onSort("firstName")}>
                    First Name {renderSortIcon("firstName")}
                  </Table.Th>
                  <Table.Th onClick={() => onSort("secondName")}>
                    Second Name {renderSortIcon("secondName")}
                  </Table.Th>
                  <Table.Th onClick={() => onSort("nickName")}>
                    Nickname {renderSortIcon("nickName")}
                  </Table.Th>
                  <Table.Th>Avatar</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {currentPeople.map((person) => {
                  const personName = [person.firstName, person.secondName]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <Table.Tr
                      key={person._id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        router.push(
                          `/notes?personId=${person._id}&personName=${encodeURIComponent(personName || person.nickName || "")}`
                        )
                      }
                    >
                      <Table.Td>{person.firstName}</Table.Td>
                      <Table.Td>{person.secondName}</Table.Td>
                      <Table.Td>{person.nickName}</Table.Td>
                      <Table.Td>
                        <Tooltip
                          label={`${person.firstName} ${person.secondName}`}
                          withArrow
                        >
                          <Avatar radius="xl">
                            {getInitials(
                              `${person.firstName} ${person.secondName}`
                            )}
                          </Avatar>
                        </Tooltip>
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Group gap="xs" justify="end">
                          <UpdatePerson person={person} refetch={refetch} />
                          <DeletePerson
                            id={person._id}
                            setNotification={setNotification}
                            refetch={refetch}
                          />
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Box>
          <Center mt="auto" pb="md">
            <Pagination
              total={Math.ceil(filteredPeople.length / peoplePerPage)}
              value={currentPage}
              onChange={setCurrentPage}
            />
          </Center>
        </>
      ) : searchQuery.trim() ? (
        <EmptyList
          title={"Aucun résultat"}
          message={`Aucune personne ne correspond à "${searchQuery}".`}
        />
      ) : null}

      {notification && (
        <Notification
          icon={notification.icon}
          color={notification.color}
          title={notification.title}
          onClose={() => setNotification(null)}
          mt="md"
          style={{ zIndex: 1000 }}
        >
          {notification.message}
        </Notification>
      )}
    </Stack>
  );
};

export default ListPeople;
