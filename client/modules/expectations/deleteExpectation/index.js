import { TfiTrash } from "react-icons/tfi";
import React from 'react';
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl } from "../../utils/config";
import useAuthStore from "../../auth/store";
import { ActionIcon } from "@mantine/core";

const DeleteExpectation = ({expectation , refetch}) => {
    const {token} = useAuthStore()
    const deleteExpectation = useMutation({
        mutationFn: () => 
            axios.delete(`${apiUrl}/expectations/${expectation._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            onSuccess: () => {
                refetch()
            }
    });

  return (
  <ActionIcon onClick={() => deleteExpectation.mutate()}><TfiTrash /></ActionIcon>)
}

export default DeleteExpectation;
