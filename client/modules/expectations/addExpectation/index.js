import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import useAuthStore from "../../auth/store";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl } from "../../utils/config";

const AddExpectation = () => {
const [opened , { open : openExpectationModal, close : closeExpectationModal}] = useDisclosure(false)
const {token , user} = useAuthStore()
const queryClient = useQueryClient()
const form = useForm({
    initialValues: {
        name: "",
        createdBy: user.id,
    },
});
const {mutate: addExpectation } = useMutation({
    mutationFn: (data) => axios.post(`${apiUrl}/expectations`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }),
    onSuccess: () => {
        queryClient.invalidateQueries(["listExpectationsByUser"])
        closeExpectationModal()
        form.reset()
    },
});
    return (
    <>
    <Modal opened={opened} onClose={closeExpectationModal} title="Add Expectation">
        <Stack>
        <form>
            <TextInput label="Name" placeholder="Name" {...form.getInputProps('name')} />
        </form>
        <Button onClick={() => addExpectation(form.values)}>Add Expectation</Button>
        </Stack>
    </Modal>
    <Button onClick={openExpectationModal}>Add Expectation</Button>
    </>
)
}

export default AddExpectation;