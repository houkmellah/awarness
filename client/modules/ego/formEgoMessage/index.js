import useAuthStore from "../../auth/store";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Textarea, Button, Group, Stack } from "@mantine/core";
import Debugger from "../../debugger";


const FormEgoMessage = ({note, egoMessages , refetch}) => {
    const { token } = useAuthStore();
    const handleSubmit = async (values) => {
        if(egoMessages){
            try {
                await updateEgoMessageMutation.mutateAsync(values);
                form.reset();
                refetch();
        } catch (error) {
            console.error('Error creating ego message:', error);
            }
        }else{
            try {
                await createEgoMessageMutation.mutateAsync(values);
                form.reset();
                refetch();  
            } catch (error) {
                console.error('Error creating ego message:', error);
            }
        }
    };
    const form = useForm({
        initialValues: {
            message: egoMessages ? egoMessages[0]?.message  : "",
            response: egoMessages ? egoMessages[0]?.response  :"",
            note: note,
        },
    });

    const createEgoMessageMutation = useMutation({
        mutationFn: (values) => axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ego`, values, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    });
    const updateEgoMessageMutation = useMutation({
        mutationFn: (values) => axios.put(`${process.env.NEXT_PUBLIC_API_URL}/ego/${egoMessages?.[0]?._id}`, values, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    });
    const egoMessage = egoMessages ? egoMessages[0]?.message : "";
    return (
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Stack>
            <Group grow align="flex-start">

           
            <Textarea 
            placeholder="Add Ego Message" 
            {...form.getInputProps("message")} 
            defaultValue={egoMessage}
            autosize/>
            <Textarea 
            placeholder="Add Heartfelt Response" 
            {...form.getInputProps("response")} 
            defaultValue={egoMessages ? egoMessages[0]?.response : ""}
            autosize
            />
            </Group>
            {/* <Debugger data={egoMessages?.[0]} /> */}
            <Group justify="flex-end">
            <Button type="submit" loading={createEgoMessageMutation.isLoading}>
                {egoMessages ? "Update Discussion" : "Add Discussion"}
            </Button>
            </Group>
            </Stack>
        </form>
    )
}

export default FormEgoMessage;