import { IconFileTextAi } from "@tabler/icons-react"
import useAuthStore from "../auth/store";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Loader } from "@mantine/core";

// Assurez-vous que cette variable est définie
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const WriteMessageWithAI = ({originalMessage, onMessageGenerated , action , messageEgo}) =>  {
    const { token } = useAuthStore();
    const [rewrittenText, setRewrittenText] = useState("");
    
    const writeEgoMessageMutation = useMutation({
        mutationFn: (text) => 
          axios.post(`${apiUrl}/deepseek/rewrite`, 
            { text , action , messageEgo},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        onSuccess: (response) => {
          const generatedText = response.data.processedText	;
          setRewrittenText(generatedText);
          // Appeler la fonction de callback pour mettre à jour le message ego
          if (onMessageGenerated) {
            onMessageGenerated(generatedText);
          }
        },
      });

      const handleRewrite = () => {
        writeEgoMessageMutation.mutate(originalMessage);
      };

    return(
        <>
            {writeEgoMessageMutation.isPending ? 
                <Loader color="blue" size="sm" type="dots" /> : 
                <IconFileTextAi 
                    onClick={handleRewrite} 
                />
            }
        </>
    )
}

export default WriteMessageWithAI