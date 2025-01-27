import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useAuthStore from "../store";
import { Avatar, Button, Group, Menu , Text } from "@mantine/core";
import { BiLogOutCircle } from "react-icons/bi";
import { CiMail } from "react-icons/ci";
import getInitials from "../../utils/getInitials";

const UserMenu = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  if (!mounted) {
    return null;
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button variant="subtle">
          <Group gap={7}>
            <Avatar
              size={20}
              radius="xl"
              variant="filled"
              color="blue"
            >
              {user?.name ? getInitials(user.name) : ""}
            </Avatar>
            <Text size="sm" fw={500}>
              {user?.name}
            </Text>
          </Group>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<CiMail />}>{user?.email}</Menu.Item>
        <Menu.Item leftSection={<BiLogOutCircle />} onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
