import React from 'react'
import { useQuery } from "@tanstack/react-query";
import { Stack, Table, Badge } from '@mantine/core';
import useAuthStore from "../../auth/store"
import { apiUrl } from "../../utils/config"
import axios from 'axios';
import useEmotionsStore from "../store";



const Emotions = () => {
  const { token } = useAuthStore();
  const { setEmotions } = useEmotionsStore();
  const {
    data: emotions = [], refetch
  
  } = useQuery({
    queryKey: ["ListPeople"],
    queryFn: () => fetchEmotions(token),
    onSuccess: (data) => {
      setEmotions(data);
    },
    enabled: !!token,
  });
  

  const fetchEmotions = async (token) => {
    try {
      const { data  } = await axios.get(`${apiUrl}/emotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmotions(data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des personnes:", error);
      throw error;
    }
  };
  



  const categoryColors = {
    'doute': 'blue',
    'refus': 'red',
    'colère': 'orange',
    'stress': 'yellow',
    'agréable': 'green'
  };

  return (
    <Stack>
     
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Category</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Message</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {emotions.map((emotion) => (
            <Table.Tr key={emotion._id}>
              <Table.Td>
                <Badge color={categoryColors[emotion.category]}>
                  {emotion.category}
                </Badge>
              </Table.Td>
              <Table.Td>{emotion.name}</Table.Td>
              <Table.Td>{emotion.description}</Table.Td>
              <Table.Td>{emotion.message}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  )
}

export default Emotions