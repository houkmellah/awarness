import React from 'react';
import AudioRecorder from '../../modules/transcription';
import withAuth from '../../modules/auth/withAuth';
import { Container, Title } from '@mantine/core';

const TranscriptionPage = () => {
  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Transcription Audio</Title>
      <AudioRecorder />
    </Container>
  );
};

export default withAuth(TranscriptionPage);	