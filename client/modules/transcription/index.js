import React, { useState, useRef, useEffect } from 'react';
import { Button, Stack, Text, Group, Anchor, Tooltip, ActionIcon } from '@mantine/core';
import { 
  IconMicrophone, 
  IconPlayerStopFilled, 
  IconPlayerPlay, 
  IconPlayerStop, 
  IconDownload, 
  IconUpload,
  IconWriting
} from '@tabler/icons-react';
import axios from 'axios';
import useAuthStore from '../auth/store';
import { apiUrl } from '../utils/config';
import { useMutation } from '@tanstack/react-query';
import Debugger from '../debugger';

const CustomActionIcon = ({label , action , Icon , color , disabled , loading}) => {
  return (
    <Tooltip label={label} >
            <ActionIcon color={color} onClick={action} variant='light' radius={'xl'} disabled={disabled} loading={loading}>
            <Icon size={20} />
            </ActionIcon>
            </Tooltip>
  )
}

const AudioRecorder = ({ onTranscriptionUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioPlayer = useRef(null);
  const fileInputRef = useRef(null);
  
  const { token } = useAuthStore();

    // Mutation de transcription via react-query
  const transcriptionMutation = useMutation({
    mutationFn: async (audioBlob) => {
      if (!audioBlob) return;
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'enregistrement.webm');
        const response = await axios.post(
          `${apiUrl}/transcription`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la transcription :", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setTranscription(data.text);
      if (onTranscriptionUpdate) {
        onTranscriptionUpdate(data.text);
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la transcription :", error);
    }
  });

  // Démarre l'enregistrement audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1, // Forcer l'enregistrement en mono
        echoCancellation: true,
        noiseSuppression: true
      }});
      const audioTracks = stream.getAudioTracks();
      console.log('Audio tracks détectées:', audioTracks);
      if (audioTracks.length > 0) {
        console.log(`Microphone utilisé: ${audioTracks[0].label}, enabled: ${audioTracks[0].enabled}, muted: ${audioTracks[0].muted}`);
      }

      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else {
        mimeType = 'audio/webm';
      }
      console.log('Format audio utilisé :', mimeType);

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
        channelCount: 1 // Forcer l'enregistrement en mono
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log('Données audio disponibles :', event.data.size, 'bytes');
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        if (audioChunks.current.length) {
          const blob = new Blob(audioChunks.current, { type: mimeType });
          setAudioBlob(blob);
          audioChunks.current = [];
        } else {
          console.warn("Aucun chunk audio n'a été collecté.");
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      console.log("Enregistrement démarré");
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone :", error);
    }
  };

  // Arrête l'enregistrement audio
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  // Joue l'audio enregistré
  const playAudio = () => {
    if (audioBlob && audioPlayer.current) {
      // Révoquer l'ancienne URL si existante
      if (audioPlayer.current.src) {
        URL.revokeObjectURL(audioPlayer.current.src);
      }
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("URL créée pour le blob :", audioUrl);
      audioPlayer.current.src = audioUrl;
      audioPlayer.current.style.display = 'block';

      audioPlayer.current.onloadedmetadata = () => {
        console.log('Métadonnées audio chargées, durée :', audioPlayer.current.duration);
        if (!isFinite(audioPlayer.current.duration)) {
          console.error("Durée audio invalide");
        }
      };

      audioPlayer.current.oncanplay = () => {
        console.log("Audio prêt à être lu");
        audioPlayer.current.volume = 1.0;
      };

      audioPlayer.current.play()
        .then(() => {
          setIsPlaying(true);
          console.log("Lecture démarrée avec succès");
        })
        .catch((error) => {
          console.error("Erreur lors de la lecture :", error);
          setIsPlaying(false);
        });
    } else {
      console.warn("Aucun blob audio disponible pour la lecture");
    }
  };

  // Arrête la lecture audio
  const stopAudio = () => {
    if (audioPlayer.current) {
      audioPlayer.current.pause();
      audioPlayer.current.currentTime = 0;
      setIsPlaying(false);
      if (audioPlayer.current.src) {
        URL.revokeObjectURL(audioPlayer.current.src);
      }
    }
  };

  // Envoie le fichier audio pour transcription via l'API
  const sendForTranscription = () => {
    if (!audioBlob) return;
    transcriptionMutation.mutate(audioBlob);
  };

  // Ajouter cette nouvelle fonction pour gérer le téléchargement du fichier
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const blob = new Blob([file], { type: file.type });
      setAudioBlob(blob);
      console.log('Fichier audio chargé :', file.name);
    }
  };

  // Nettoyage de l'URL du blob quand le composant se démonte
  useEffect(() => {
    return () => {
      if (audioPlayer.current && audioPlayer.current.src) {
        URL.revokeObjectURL(audioPlayer.current.src);
      }
    };
  }, []);

  return (
    <Stack spacing="md">
      <Group>
        {!isRecording ? (
          <>
          <CustomActionIcon label={"Démarrer l'enregistrement"} action={startRecording} Icon={IconMicrophone} color={"red"} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              style={{ display: 'none' }}
            />
            <CustomActionIcon label={"Charger un fichier audio"} action={() => fileInputRef.current.click()} Icon={IconUpload} color={"gray"} />
          </>
        ) : (
          <CustomActionIcon label={"Arrêter l'enregistrement"} action={stopRecording} Icon={IconPlayerStopFilled} color={"gray"} />         
        )}

        {audioBlob && (
          <>
            {!isPlaying ? (
              <CustomActionIcon label={"Écouter"} action={playAudio} Icon={IconPlayerPlay} color={"gray"} />      
            ) : (
              <CustomActionIcon label={"Stop"} action={stopAudio} Icon={IconPlayerStop} color={"gray"} />          
            )}
            <CustomActionIcon label="Transcrire" action={sendForTranscription} Icon={IconWriting} color="gray" disabled={isRecording} loading={transcriptionMutation?.isPending} />  
            <Anchor 
              href={audioBlob ? URL.createObjectURL(audioBlob) : '#'} 
              download="enregistrement.webm"
            >
               <CustomActionIcon label={"Télécharger l'audio"}  Icon={IconDownload} color={"gray"} disabled={isRecording} /> 
            </Anchor>
          </>
        )}
      </Group>

      
    </Stack>
  );
};

export default AudioRecorder;
