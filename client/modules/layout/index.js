import React, { useState, useEffect } from "react";
import { AppShell, Burger, Group, Box, Stack, Image, Center, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import AddNote from "../notes/addNote";
import { BsPeople } from "react-icons/bs";
import { MdInterests, MdOutlineMood, MdOutlineNotes  } from "react-icons/md";
import { MdDashboard } from "react-icons/md";
import { useRouter } from "next/router";
import AddPerson from "../people/addPerson";
import dynamic from "next/dynamic";
import useAuthStore from "../auth/store";
import AddExpectation from "../expectations/addExpectation";

const UserMenu = dynamic(() => import("../auth/userMenu"), { ssr: false });

const pages = [
  { name: "Dashboard", path: "/", icon: MdDashboard },
  { name: "People", path: "/people", icon: BsPeople },
  { name: "Notes", path: "/notes", icon: MdOutlineNotes },
  { name : "Emotions", path : "/emotions", icon : MdOutlineMood },
  { name : "Expectations", path : "/expectations", icon : MdInterests },
  { name : "Claims", path : "/claims", icon : MdOutlineMood },
];

export function Layout({ children }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
            <Center px="md">

            <Image src={"logo.png"} w={"80px"} h={"100%"} />
            </Center>
          </Group>
          <Group>
            {isClient && (
              <>
                {router.pathname === "/people" && <AddPerson />}
                {router.pathname === "/notes" && <AddNote />}
                {user?.name && <UserMenu mobileOpened={mobileOpened} />}
                {router.pathname === "/expectations" && <AddExpectation/>}
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="lg">
        <Stack gap="lg">
          {pages.map((page) => {
            const isSelected = page.path === router.pathname;
            const IconComponent = page.icon;
            return (
              <Group
                key={page.name}
                onClick={() => router.push(page.path)}
                style={{ cursor: "pointer" }}
              >
                <IconComponent
                  size={25}
                  color={isSelected ? "blue" : "black"}
                />
                <Title  order={6} c={isSelected ? "blue" : undefined} > 
                  {page.name}
                </Title>
              </Group>
            );
          })}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main bg={"gray.0"}>{children}</AppShell.Main>
    </AppShell>
  );
}
