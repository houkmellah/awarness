import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { register, login } from '../api';
import useAuthStore from '../authStore';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email invalide'),
      password: (value) => (value.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères' : null),
    },
  });

  const handleSubmit = async (values) => {
    setError('');
    try {
      const response = isLogin
        ? await login(values.email, values.password)
        : await register(values.email, values.password);
      
      if (isLogin) {
        const { token } = response.data;
        setToken(token);
        router.push('/dashboard');
      } else {
        setIsLogin(true);
        form.reset();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center" sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}>
        {isLogin ? 'Connexion' : 'Inscription'}
      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Adresse e-mail"
            placeholder="vous@example.com"
            required
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Mot de passe"
            placeholder="Votre mot de passe"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          {error && (
            <Text color="red" size="sm" mt="sm">
              {error}
            </Text>
          )}
          <Button fullWidth mt="xl" type="submit">
            {isLogin ? 'Se connecter' : 'S'inscrire'}
          </Button>
        </form>
      </Paper>
      <Group position="center" mt="md">
        <Text size="sm">
          {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
        </Text>
        <Button 
          variant="subtle" 
          size="sm" 
          onClick={() => {
            setIsLogin(!isLogin);
            form.reset();
          }}
        >
          {isLogin ? "S'inscrire" : 'Se connecter'}
        </Button>
      </Group>
    </Container>
  );
};

export default Auth;