import { TextInput, Textarea } from "@mantine/core";

const FormExpectation = ({form}) => {
   
    return (
        <form>
            <TextInput label="Name" placeholder="Name" {...form.getInputProps('name')} />
            <Textarea label="Reason" placeholder="Reason" {...form.getInputProps('reason')} />
        </form>
    )
}

export default FormExpectation;