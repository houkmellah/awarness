import Debugger from "../../debugger";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import { apiUrl } from "../../utils/config";
import useExpectationStore from "../store";
import { useEffect } from "react";

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

    const { data: expectations, isLoading, error } = useQuery({
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
    
    return <Debugger data={expectations} />;
}

export default ListExpectations; 