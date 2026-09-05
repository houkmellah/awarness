import Debugger from "../../debugger";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import { apiUrl } from "../../utils/config";
import useExpectationStore from "../store";
import { useEffect, useState, useMemo } from "react";
import { ActionIcon, Button, Table  , Group} from "@mantine/core";
import { format } from "date-fns";
import { TfiPencil } from "react-icons/tfi";
import {
    HiMiniChevronUpDown,
    HiMiniChevronDown,
    HiMiniChevronUp,
} from "react-icons/hi2";
import AddExpectation from "../addExpectation";
import DeleteExpectation from "../deleteExpectation";

const sortableColumns = [
    { key: "name", label: "Name" },
    { key: "reason", label: "Raison" },
    { key: "usageCount", label: "Citations" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
];

const ListExpectations = () => {
    const {token , user} = useAuthStore()
    const {setExpectations} = useExpectationStore()
    const [sortConfig, setSortConfig] = useState({
        key: "usageCount",
        direction: "descending",
    });

    const getExpectationsByUserWithUsage = async () => {
        try {
            const response = await axios.get(`${apiUrl}/expectations/user/${user.id}/with-usage`, {
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

    const { data: expectations = [], isLoading, error , refetch} = useQuery({
        queryKey: ["listExpectationsByUser", user?.id],
        queryFn: getExpectationsByUserWithUsage,
        enabled: !!user?.id && !!token,
    });

    const sortedExpectations = useMemo(() => {
        const data = [...expectations];
        if (!sortConfig.key) return data;
        data.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (sortConfig.key === "usageCount") {
                const aNum = Number(aVal) || 0;
                const bNum = Number(bVal) || 0;
                return sortConfig.direction === "ascending"
                    ? aNum - bNum
                    : bNum - aNum;
            }
            if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
                const aDate = new Date(aVal || 0).getTime();
                const bDate = new Date(bVal || 0).getTime();
                return sortConfig.direction === "ascending"
                    ? aDate - bDate
                    : bDate - aDate;
            }
            const aStr = String(aVal || "").toLowerCase();
            const bStr = String(bVal || "").toLowerCase();
            if (aStr < bStr) return sortConfig.direction === "ascending" ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === "ascending" ? 1 : -1;
            return 0;
        });
        return data;
    }, [expectations, sortConfig]);

    const onSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === "ascending"
                    ? "descending"
                    : "ascending",
        }));
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <HiMiniChevronUpDown />;
        return sortConfig.direction === "ascending" ? (
            <HiMiniChevronDown />
        ) : (
            <HiMiniChevronUp />
        );
    };

    useEffect(() => {
        if (expectations?.length) {
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
            {sortableColumns.map(({ key, label }) => (
                <Table.Th
                    key={key}
                    style={{ cursor: "pointer" }}
                    onClick={() => onSort(key)}
                >
                    {label} {renderSortIcon(key)}
                </Table.Th>
            ))}
            <Table.Th></Table.Th>
        </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
        {sortedExpectations.map((expectation) => (
            <Table.Tr key={expectation._id} >
                <Table.Td>{expectation.name}</Table.Td>
                <Table.Td>{expectation?.reason}</Table.Td>
                <Table.Td>{expectation?.usageCount ?? 0}</Table.Td>
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