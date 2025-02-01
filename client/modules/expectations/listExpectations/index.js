import Debugger from "../../debugger";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import { apiUrl } from "../../utils/config";
import useExpectationStore from "../store";
import { useEffect } from "react";
import { ActionIcon, Button, Table  , Group} from "@mantine/core";
import { format } from "date-fns";
import { TfiPencil } from "react-icons/tfi";
import AddExpectation from "../addExpectation";
import DeleteExpectation from "../deleteExpectation";

const headers = ["Name", "Created At", "Updated At"];

const ListExpectations = () => {
    const {token , user} = useAuthStore()
    const {setExpectations} = useExpectationStore()
    
    const getExpectationsByUser = async () => {
        try {
            const response = await axios.get(`${apiUrl}/expectations/user/${user.id}`, {
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

    const { data: expectations, isLoading, error , refetch} = useQuery({
        queryKey: ["listExpectationsByUser"],
        queryFn: getExpectationsByUser,
    });

    useEffect(() => {
        if (expectations) {
            setExpectations(expectations);
        }
    }, [expectations, setExpectations]);

    if (isLoading) return <p>Chargement...</p>;
    if (error) return <p>Erreur: {error.message}</p>;
    
    return(
<>
<Table  bg="white" withTableBorder striped>
    <Table.Thead>
        <Table.Tr>
            {headers.map((header) => (
                <Table.Th key={header}>{header}</Table.Th>
            ))}
        </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
        {expectations.map((expectation) => (
            <Table.Tr key={expectation._id} >
                <Table.Td>{expectation.name}</Table.Td>
                <Table.Td>{expectation?.reason}</Table.Td>
                <Table.Td>{format(expectation.createdAt, "dd/MM/yyyy")}</Table.Td>
                <Table.Td>{format(expectation.updatedAt, "dd/MM/yyyy")}</Table.Td>
                <Table.Td w="7%" justify="flex-end">
                    <Group w="100%">
                    <AddExpectation expectation={expectation} refetch={refetch} />
                    <DeleteExpectation expectation={expectation} refetch={refetch} />
                    </Group>
                </Table.Td>
            </Table.Tr>
        ))}
    </Table.Tbody>
</Table>
{/* <Debugger data={expectations} />; */}
</>
    )
    
}

export default ListExpectations; 