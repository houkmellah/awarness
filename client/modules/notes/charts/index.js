import React from "react";
import { BarChart, LineChart } from "@mantine/charts";
import { Stack, Title, Paper, Text, Loader, Center } from "@mantine/core";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import EmptyList from "../../ui/emptyList";

const RATING_COLORS = {
  1: "var(--mantine-color-red-7)",
  2: "var(--mantine-color-orange-7)",
  3: "var(--mantine-color-yellow-7)",
  4: "var(--mantine-color-lime-7)",
  5: "var(--mantine-color-green-7)",
};

const RATING_LABELS = {
  1: "Very Sad",
  2: "Sad",
  3: "Neutral",
  4: "Happy",
  5: "Very Happy",
};

const LifeInsightsDashboard = () => {
  const { token } = useAuthStore();
  const fetchNotes = async () => {
    const { data } = await axios.get("http://localhost:8000/api/notes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  };

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["ListNotes"],
    queryFn: fetchNotes,
  });

  if (isLoading) {
    return (
      <Paper
        h="80vh"
        w="100%"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        bg="transparent"
      >
        <Center>
          <Loader color="blue" size="xl" type="bars" />
        </Center>
      </Paper>
    );
  }

  if (notes.length === 0)
    return (
      <EmptyList
        title={"No Graphs to Display Yet"}
        message={
          "We need some notes to create insightful graphs. Start by adding a few notes, and watch your data come to life!"
        }
      />
    );

  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    return (
      <Stack align="center" spacing="xl">
        <Title order={2}>Life Insights Dashboard</Title>
        {notes === undefined ? (
          <Loader />
        ) : (
          <Text>No data available. Please add some notes to see insights.</Text>
        )}
      </Stack>
    );
  }

  const sortedRatings = Object.keys(RATING_LABELS).sort(
    (a, b) => Number(a) - Number(b)
  );

  const lifeAspectData = notes.reduce((acc, note) => {
    if (note.lifeAspect && note.rating) {
      if (!acc[note.lifeAspect]) {
        acc[note.lifeAspect] = { aspect: note.lifeAspect };
        sortedRatings.forEach((rating) => {
          acc[note.lifeAspect][RATING_LABELS[rating]] = 0;
        });
      }
      const ratingKey = RATING_LABELS[note.rating];
      acc[note.lifeAspect][ratingKey]++;
    }
    return acc;
  }, {});

  const lifeAspectChartData = Object.values(lifeAspectData);

  const series = sortedRatings.map((rating) => ({
    name: RATING_LABELS[rating],
    color: RATING_COLORS[rating],
  }));

  // Restructurer les données pour le graphique d'évolution des émotions
  const emotionTimelineData = notes
    .filter((note) => note.date && note.rating)
    .reduce((acc, note) => {
      const date = new Date(note.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) {
        acc[date] = { date };
        sortedRatings.forEach((rating) => {
          acc[date][RATING_LABELS[rating]] = 0;
        });
      }
      acc[date][RATING_LABELS[note.rating]]++;
      return acc;
    }, {});

  const emotionTimelineChartData = Object.values(emotionTimelineData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const emotionSeries = sortedRatings.map((rating) => ({
    name: RATING_LABELS[rating],
    color: RATING_COLORS[rating],
  }));

  return (
    <Stack spacing="xl">
      <Paper withBorder>
        {lifeAspectChartData?.length > 0 && (
          <Stack shadow="xs" p="md" gap="">
            <Title order={3}>Distribution of Life Aspects and Emotions</Title>
            <BarChart
              h={300}
              data={lifeAspectChartData}
              dataKey="aspect"
              series={series}
              tickLine="y"
              yAxisProps={{ domain: [0, "auto"] }}
            />
          </Stack>
        )}
      </Paper>
      {emotionTimelineChartData.length > 0 && (
        <Paper withBorder>
          <Stack shadow="xs" p="md" gap="">
            <Title order={3}>Emotional Ratings Over Time</Title>
            <LineChart
              h={300}
              data={emotionTimelineChartData}
              dataKey="date"
              series={emotionSeries}
              curveType="natural"
              withLegend
              legendProps={{ verticalAlign: "bottom", height: 60 }}
            />
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default LifeInsightsDashboard;
