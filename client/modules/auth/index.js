import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  TextInput,
  PasswordInput,
  Button,
  Image,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Notification,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconX } from "@tabler/icons-react";
import { register, login, forgotPassword } from "./api";
import useAuthStore from "./store";

const Auth = () => {
  const [mode, setMode] = useState("login"); // 'login', 'register', or 'forgotPassword'
  const [notification, setNotification] = useState(null);
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) =>
        mode === "register" && value.length < 2
          ? "Name must have at least 2 characters"
          : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        mode !== "forgotPassword" && value.length < 6
          ? "Password must have at least 6 characters"
          : null,
      confirmPassword: (value, values) =>
        mode === "register" && value !== values.password
          ? "Passwords do not match"
          : null,
    },
  });

  const handleSubmit = async (values) => {
    setNotification(null);
    try {
      if (mode === "login") {
        const response = await login(values.email, values.password);
        const { token, userId, name, email } = response.data;
        setToken(token);
        setUser({ id: userId, name, email });
        setNotification({ type: "success", message: "Login successful" });
        setTimeout(() => router.push("/"), 1500);
      } else if (mode === "register") {
        await register(values.name, values.email, values.password);
        setNotification({
          type: "success",
          message: "Registration successful. Please log in.",
        });
        setMode("login");
        form.reset();
      } else if (mode === "forgotPassword") {
        await forgotPassword(values.email);
        setNotification({
          type: "success",
          message: "Password reset instructions sent to your email.",
        });
        setMode("login");
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: error.response?.data?.message || "An error occurred",
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({
          fontFamily: `Greycliff CF, ${theme.fontFamily}`,
          fontWeight: 900,
        })}
      >
        {mode === "login"
          ? "Login"
          : mode === "register"
          ? "Sign Up"
          : "Forgot Password"}
      </Title>
      {notification && (
        <Notification
          icon={
            notification.type === "success" ? (
              <IconCheck size="1.1rem" />
            ) : (
              <IconX size="1.1rem" />
            )
          }
          color={notification.type === "success" ? "teal" : "red"}
          title={notification.type === "success" ? "Success" : "Error"}
          onClose={() => setNotification(null)}
          mb="md"
        >
          {notification.message}
        </Notification>
      )}
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Image src="logo.png" size={"lg"} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {mode === "register" && (
            <TextInput
              label="Name"
              placeholder="Your name"
              required
              {...form.getInputProps("name")}
            />
          )}
          <TextInput
            label="Email"
            placeholder="you@example.com"
            required
            mt="md"
            {...form.getInputProps("email")}
          />
          {mode !== "forgotPassword" && (
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              {...form.getInputProps("password")}
            />
          )}
          {mode === "register" && (
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              mt="md"
              {...form.getInputProps("confirmPassword")}
            />
          )}
          <Button fullWidth mt="xl" type="submit">
            {mode === "login"
              ? "Login"
              : mode === "register"
              ? "Sign Up"
              : "Reset Password"}
          </Button>
        </form>
      </Paper>
      <Group position="center" mt="md">
        {mode === "login" && (
          <>
            <Text size="sm">{"Don't have an account?"}</Text>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setMode("register")}
            >
              Sign Up
            </Button>
          </>
        )}
        {mode === "register" && (
          <>
            <Text size="sm">Already have an account?</Text>
            <Button variant="subtle" size="sm" onClick={() => setMode("login")}>
              Login
            </Button>
          </>
        )}
      </Group>
      {mode !== "forgotPassword" && (
        <Anchor
          component="button"
          type="button"
          color="dimmed"
          onClick={() => setMode("forgotPassword")}
          size="xs"
          mt="sm"
          style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          Forgot password?
        </Anchor>
      )}
      {mode === "forgotPassword" && (
        <Anchor
          component="button"
          type="button"
          color="dimmed"
          onClick={() => setMode("login")}
          size="xs"
          mt="sm"
          style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          Back to login
        </Anchor>
      )}
    </Container>
  );
};

export default Auth;
