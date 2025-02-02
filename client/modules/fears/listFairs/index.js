import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import usefearStore from "../store";
import { useEffect } from "react";
import { Table, Group } from "@mantine/core";
import { format } from "date-fns";
import AddFear from "../addAndUpdateFear";
import DeleteFear from "../deleteFear";
import { apiUrl } from "../../utils/config";

const headers = [
  "Titre",
  "Description",
  "Created At",
  "Mis à jour le",
  "Actions",
];

const Listfears = () => {
  const { token, user } = useAuthStore();
  const { setfears } = usefearStore();

  const getfearsByUser = async () => {
    try {
      const response = await axios.get(`${apiUrl}/fears/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération:", error);
      throw error;
    }
  };

  const {
    data: fears,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["listfearsByUser"],
    queryFn: getfearsByUser,
  });

  useEffect(() => {
    if (fears) {
      setfears(fears);
    }
  }, [fears, setfears]);

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <>
      <Table bg="white" withTableBorder striped>
        <Table.Thead>
          <Table.Tr>
            {headers.map((header) => (
              <Table.Th key={header}>{header}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {fears.map((fear) => (
            <Table.Tr key={fear._id}>
              <Table.Td>{fear.title}</Table.Td>
              <Table.Td>{fear.description}</Table.Td>
              {/* <Table.Td>
                {format(new Date(fear.startDate), "dd/MM/yyyy")}
              </Table.Td>
              <Table.Td>
                {format(new Date(fear.endDate), "dd/MM/yyyy")}
              </Table.Td> */}
              <Table.Td>
                {format(new Date(fear.createdAt), "dd/MM/yyyy")}
              </Table.Td>
              <Table.Td>
                {format(new Date(fear.updatedAt), "dd/MM/yyyy")}
              </Table.Td>
              <Table.Td w="10%" justify="flex-end">
                <Group w="100%">
                  <AddFear fear={fear} refetch={refetch} />
                  <DeleteFear fear={fear} refetch={refetch} />
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
};

export default Listfears;
