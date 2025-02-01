import { Button, Modal, Stack, Textarea, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import useAuthStore from "../../auth/store";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl } from "../../utils/config";
import { TfiPencil } from "react-icons/tfi";
import { ActionIcon } from "@mantine/core";

const AddClaim = ({claim}) => {
const [opened, { open: openClaimModal, close: closeClaimModal }] = useDisclosure(false)
const {token} = useAuthStore()
const queryClient = useQueryClient()
const {user} = useAuthStore()
const {title, description, createdBy} = claim || {}

const form = useForm({
    initialValues: {
        title: title || "",
        description: description || "",
        createdBy: createdBy || user?.id,
    },
});

const updateClaim = useMutation({
    mutationFn: (data) => 
        axios.put(`${apiUrl}/claims/${claim._id}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }),
});

const createClaim = useMutation({
    mutationFn: (data) => 
        axios.post(`${apiUrl}/claims`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }),
});

const {mutate: addClaim} = useMutation({
    mutationFn: (data) => 
        claim ? updateClaim.mutate(data) : createClaim.mutate(data),
    onSuccess: () => {
        queryClient.invalidateQueries(["listClaimsByUser"])
        closeClaimModal()
        form.reset()
    },
});

return (
    <>
    <Modal opened={opened} onClose={closeClaimModal} title="Add Claim">
        <Stack>
            <TextInput label="Title" {...form.getInputProps('title')} />
            <Textarea label="Description" {...form.getInputProps('description')} />
            <Button onClick={() => addClaim(form.values)}>Add Claim</Button>
        </Stack>
    </Modal>
    {claim ? <ActionIcon onClick={openClaimModal}>
                <TfiPencil />
            </ActionIcon> : <Button onClick={openClaimModal}>Add Claim</Button>}
    </>
)
}

export default AddClaim;