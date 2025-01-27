import {Button, Modal , Textarea} from "@mantine/core"
import { GoCommentDiscussion } from "react-icons/go";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useMutation} from "@tanstack/react-query";
import axios from "axios";
import ListEgoMessages from "../listEgoMessages";
import FormEgoMessage from "../formEgoMessage";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";

const AddEgo = ({note}) => {
    const [opened , { open : openEgoModal, close : closeEgoModal }] = useDisclosure(false);
    const { token } = useAuthStore();
    const { data, isLoading: isEgosLoading, isError: isEgosError  , refetch} = useQuery({
        queryKey: ["egos", note],
        queryFn: () => axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ego/note/${note._id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
        enabled: opened,
    });

    // Extraire egoMessages de manière sécurisée
    const egoMessages = data?.data;
    return (
    <>
        <Modal opened={opened} onClose={closeEgoModal} title="Add Ego" size={"xl"}>
        <FormEgoMessage note={note} egoMessages={egoMessages} refetch={refetch}/>
        </Modal>
        <Button onClick={openEgoModal} leftSection={<GoCommentDiscussion size={24} />}>
            Add Ego 
        </Button>
    </>
    )
}

export default AddEgo;
