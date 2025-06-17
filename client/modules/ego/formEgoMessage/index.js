import useAuthStore from "../../auth/store";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Textarea, Button, Group, Stack, ActionIcon } from "@mantine/core";
import Debugger from "../../debugger";
import WriteMessageWithAI from "../../ia/writeMessageWithIA";


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
           <Stack>
                <ActionIcon variant="light" radius={"xl"} >
                    <WriteMessageWithAI 
                        originalMessage={note.note} 
                        onMessageGenerated={(text) => form.setFieldValue("message", text)}
                        action={"egoProtector"}
                    />
                </ActionIcon>
            <Textarea 
            placeholder="Add Ego Message" 
            {...form.getInputProps("message")} 
            defaultValue={egoMessage}
            autosize/>
            </Stack>
            <Stack>
                <ActionIcon variant="light" radius={"xl"} >
                    <WriteMessageWithAI 
                        originalMessage={note.note} 
                        messageEgo={form.values.message}
                        onMessageGenerated={(text) => form.setFieldValue("response", text)}
                        action={"higherSelf"}
                    />
                </ActionIcon>
            <Textarea 
            placeholder="Add Heartfelt Response" 
            {...form.getInputProps("response")} 
            defaultValue={egoMessages ? egoMessages[0]?.response : ""}
            autosize
            />
            </Stack>
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