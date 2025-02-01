import { TfiTrash } from "react-icons/tfi";
import React from 'react';
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useAuthStore from "../../auth/store";
import { ActionIcon } from "@mantine/core";
import { apiUrl } from "../../utils/config";

const DeleteClaim = ({ claim, refetch }) => {
    const { token } = useAuthStore();
    
    const deleteClaim = useMutation({
        mutationFn: () => 
            axios.delete(`${apiUrl}/claims/${claim._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        onSuccess: () => {
            refetch();
        }
    });

    return (
        <ActionIcon onClick={() => deleteClaim.mutate()}>
            <TfiTrash />
        </ActionIcon>
    );
}

export default DeleteClaim;
