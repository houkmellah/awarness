import { TfiTrash } from "react-icons/tfi";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useAuthStore from "../../auth/store";
import { ActionIcon } from "@mantine/core";
import { apiUrl } from "../../utils/config";

const Deletefear = ({ fear, refetch }) => {
  const { token } = useAuthStore();

  const deletefear = useMutation({
    mutationFn: () =>
      axios.delete(`${apiUrl}/fears/${fear._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <ActionIcon onClick={() => deletefear.mutate()}>
      <TfiTrash />
    </ActionIcon>
  );
};

export default Deletefear;
