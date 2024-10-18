import React from "react";
import { useRouter } from "next/router";
import useAuthStore from "../store";
import { Avatar, Button, Group, Menu , Text } from "@mantine/core";
import { BiLogOutCircle } from "react-icons/bi";
import { CiMail } from "react-icons/ci";
import getInitials from "../../utils/getInitials";

const UserMenu = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  console.log("User ======>", user);

  const handleLogout = () => {
    router.push("/auth");
    logout();
  };

  return (
    <Menu>
      <Menu.Target>
        <Button variant="default">
          <Group>
            <Avatar radius="xl" size={30}>
              {getInitials(`${user.name} `)}
            </Avatar>
            <Text visibleFrom="md">
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
