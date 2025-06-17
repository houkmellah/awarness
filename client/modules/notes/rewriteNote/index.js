import React, { useState } from 'react';
import { Button, Modal, Textarea, Group, Stack, ActionIcon, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import useAuthStore from '../../auth/store';
import { apiUrl } from '../../utils/config';
import { TfiPencilAlt } from 'react-icons/tfi';

const RewriteNote = ({ note, onRewrite }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [originalText, setOriginalText] = useState(note?.note || '');
  const [rewrittenText, setRewrittenText] = useState('');
  const { token } = useAuthStore();

  const rewriteMutation = useMutation({
    mutationFn: (text) => 
      axios.post(`${apiUrl}/deepseek/rewrite`, 
        { text , action : "rewriteNote" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    onSuccess: (response) => {
      setRewrittenText(response.data.processedText);
    },
  });

  const handleRewrite = () => {
    rewriteMutation.mutate(originalText);
  };

  const handleApply = () => {
    onRewrite(rewrittenText);
    close();
  };

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Réécrire la note avec l'IA" 
        size="100%"
      >

        <Group spacing="md" align='start'h={"100%"}>
          <Stack w={ rewrittenText ? "45%" : "100%"} h={"100%"}>
          <Textarea
            label="Texte original"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            minRows={5}
            autosize
          />
          
          <Button 
            onClick={handleRewrite} 
            loading={rewriteMutation.isPending}
            fullWidth
          >
            Réécrire avec DeepSeek
          </Button>
          </Stack>
          <Stack w={ "45%"} h={"100%"}>
          {rewriteMutation.isLoading && (
            <Group position="center">
              <Loader size="sm" />
              <span>Génération en cours...</span>
            </Group>
          )}
          
          {rewrittenText && (
            <>
              <Textarea
                label="Texte réécrit"
                value={rewrittenText}
                onChange={(e) => setRewrittenText(e.target.value)}
                minRows={5}
                autosize
              />
              
              <Group position="right">
                <Button onClick={handleApply} color="green">
                  Appliquer les modifications
                </Button>
              </Group>
            </>
          )}
          </Stack>
        </Group>
      </Modal>
      
      <ActionIcon onClick={open} title="Réécrire avec l'IA">
        <TfiPencilAlt />
      </ActionIcon>
    </>
  );
};

export default RewriteNote; 