import Debugger from "../../debugger";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useAuthStore from "../../auth/store";
import FormEgoMessage from "../formEgoMessage";

const ListEgoMessages = ({note}) => {
    const { token } = useAuthStore();
    const { data, isLoading: isEgosLoading, isError: isEgosError } = useQuery({
        queryKey: ["egos", note],
        queryFn: () => axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ego/note/${note._id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    });

    // Extraire egoMessages de manière sécurisée
    const egoMessages = data?.data;

    return (
      <FormEgoMessage note={note} egoMessages={egoMessages}/>
    )
}

export default ListEgoMessages;