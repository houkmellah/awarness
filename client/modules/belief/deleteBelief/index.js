import { TfiTrash } from "react-icons/tfi";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useAuthStore from "../../auth/store";
import { ActionIcon, Tooltip } from "@mantine/core";
import { apiUrl } from "../../utils/config";

const DeleteBelief = ({ belief, refetch }) => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const deleteBeliefMutation = useMutation({
    mutationFn: () =>
      axios.delete(`${apiUrl}/beliefs/${belief._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ListBeliefs"] });
      if (refetch) {
        refetch();
      }
    },
    onError: (error) => {
      console.error("Error deleting belief:", error);
    },
  });

  return (
    <Tooltip label="Supprimer la croyance">
      <ActionIcon
        color="red"
        variant="light"
        onClick={() => deleteBeliefMutation.mutate()}
        loading={deleteBeliefMutation.isPending}
      >
        <TfiTrash size={18} />
      </ActionIcon>
    </Tooltip>
  );
};

export default DeleteBelief;

