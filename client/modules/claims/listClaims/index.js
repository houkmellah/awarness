import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import useClaimStore from "../store";
import { useEffect } from "react";
import {  Table, Group } from "@mantine/core";
import { format } from "date-fns";
import AddClaim from "../addAndUpdateClaim";
import DeleteClaim from "../deleteClaim";
import { apiUrl } from "../../utils/config";

const headers = ["Nom", "Raison", "Créé le", "Mis à jour le"];

const ListClaims = () => {
    const { token, user } = useAuthStore()
    const { setClaims } = useClaimStore()
    
    const getClaimsByUser = async () => {
        try {
            const response = await axios.get(`${apiUrl}/claims/user/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération:", error);
            throw error;
        }
    }

    const { data: claims, isLoading, error, refetch } = useQuery({
        queryKey: ["listClaimsByUser"],
        queryFn: getClaimsByUser,
    });

    useEffect(() => {
        if (claims) {
            setClaims(claims);
        }
    }, [claims, setClaims]);

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
                    {claims.map((claim) => (
                        <Table.Tr key={claim._id}>
                            <Table.Td>{claim.title}</Table.Td>
                            <Table.Td>{claim?.description}</Table.Td>
                            <Table.Td>{format(claim.createdAt, "dd/MM/yyyy")}</Table.Td>
                            <Table.Td>{format(claim.updatedAt, "dd/MM/yyyy")}</Table.Td>
                            <Table.Td w="10%" justify="flex-end">
                                <Group w="100%">
                                    <AddClaim claim={claim} refetch={refetch} />
                                    <DeleteClaim claim={claim} refetch={refetch} />
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            {/* <Debugger data={claims} /> */}
        </>
    )
}

export default ListClaims;
