import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MultiSelectPeople from "./multiSelectPeople";
import AddPerson from "./index";
import { Group } from "@mantine/core";
import usePeopleStore from "./store/usePeopleStore";
import useAuthStore from "../../auth/store";

const ListPeople = ({ form }) => {
  const { setPeople } = usePeopleStore();
  const {token} = useAuthStore()
  const fetchPeople = async () => {
    const { data } = await axios.get(`http://localhost:8000/api/people`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setPeople(data);
    return data;
  };
  const {
    data: listPeople,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["people"],
    queryFn: fetchPeople,
  });

  if (isLoading) return <div>Loading people...</div>;
  if (isError) return <div>Error fetching people</div>;

  return (
    <>
      {listPeople && (
        <Group align="flex-end" justify="space-between">
          <MultiSelectPeople listPeople={listPeople} form={form} />
          <AddPerson refetch={refetch} />
        </Group>
      )}
    </>
  );
};

export default ListPeople;
