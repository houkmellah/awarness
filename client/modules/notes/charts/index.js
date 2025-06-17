import React from "react";
import { BarChart, LineChart } from "@mantine/charts";
import { Stack, Title, Paper, Text, Loader, Center } from "@mantine/core";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../auth/store";
import EmptyList from "../../ui/emptyList";
import { apiUrl } from "../../utils/config";
import useEmotionsStore from "../../emotions/store";
import { format } from 'date-fns';
import { lifeAspects } from "../../utils/data";

const RATING_COLORS = {
  1: "var(--mantine-color-red-7)",
  2: "var(--mantine-color-orange-7)",
  3: "var(--mantine-color-yellow-7)",
  4: "var(--mantine-color-lime-7)",
  5: "var(--mantine-color-green-7)",
};

//TODO: externaliser cet objet
const categoryColors = {
  doute: "blue",
  refus: "red",
  colère: "orange",
  stress: "yellow",
  agréable: "green",
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
  const { emotions } = useEmotionsStore();
  const fetchNotes = async () => {
    const { data } = await axios.get(`${apiUrl}/notes`, {
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
    if (note.lifeAspect && note.rating && Array.isArray(note.lifeAspect)) {
      note.lifeAspect.forEach((aspect) => {
        if (!acc[aspect]) {
          acc[aspect] = { aspect: aspect };
          sortedRatings.forEach((rating) => {
            acc[aspect][RATING_LABELS[rating]] = 0;
          });
          acc[aspect].total = 0;
        }
        const ratingKey = RATING_LABELS[note.rating];
        acc[aspect][ratingKey]++;
        acc[aspect].total++;
      });
    }
    return acc;
  }, {});

  const lifeAspectChartData = Object.values(lifeAspectData)
    .sort((a, b) => b.total - a.total)
    .map(({ total, ...rest }) => rest);

  const series = sortedRatings.map((rating) => ({
    name: RATING_LABELS[rating],
    color: RATING_COLORS[rating],
  }));

  // Restructurer les données pour le graphique d'évolution des émotions
  const emotionTimelineData = notes
    .filter((note) => note.date && note.rating)
    .reduce((acc, note) => {
      const dateObj = new Date(note.date);  // Créer un objet Date
      const date = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) {
        acc[date] = { 
          date,
          originalDate: dateObj, // Stocker la date originale pour le tri
        };
        sortedRatings.forEach((rating) => {
          acc[date][RATING_LABELS[rating]] = 0;
        });
      }
      acc[date][RATING_LABELS[note.rating]]++;
      return acc;
    }, {});

  const emotionTimelineChartData = Object.values(emotionTimelineData)
    .sort((a, b) => a.originalDate - b.originalDate)
    .map(({ originalDate, ...rest }) => rest); // Retirer originalDate avant l'affichage

  const emotionSeries = sortedRatings.map((rating) => ({
    name: RATING_LABELS[rating],
    color: RATING_COLORS[rating],
  }));

  const peopleData = notes.reduce((acc, note) => {
    if (note.people && Array.isArray(note.people)) {
      note.people.forEach((person) => {
        const personName = `${person.firstName} ${person.secondName}`.trim();
        if (!acc[personName]) {
          acc[personName] = { person: personName, total: 0 };
          sortedRatings.forEach((rating) => {
            acc[personName][RATING_LABELS[rating]] = 0;
          });
        }
        const ratingKey = RATING_LABELS[note.rating];
        acc[personName][ratingKey]++;
        acc[personName].total++;
      });
    }
    return acc;
  }, {});

  const peopleChartData = Object.values(peopleData)
    .sort((a, b) => b.total - a.total)  // Trier par total décroissant
    .slice(0, 15)  // Ne garder que les 15 premiers
    .map(({ total, ...rest }) => rest);  // Retirer le total avant l'affichage

  const emotionsData = notes.reduce((acc, note) => {
    if (note.emotions && Array.isArray(note.emotions)) {
      note.emotions.forEach((emotionId) => {
        const emotion = emotions.find((e) => e._id === emotionId);
        if (emotion) {
          const emotionName = emotion.name;
          if (!acc[emotionName]) {
            acc[emotionName] = {
              emotion: emotionName,
              category: emotion.category,
              count: 0,
            };
          }
          acc[emotionName].count++;
        }
      });
    }
    return acc;
  }, {});

  const emotionsChartData = Object.values(emotionsData).sort((a, b) => {
    // D'abord trier par catégorie
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    // Si même catégorie, trier par nom d'émotion
    return a.emotion.localeCompare(b.emotion);
  });

  // Avant le rendu du graphique, préparez les données avec les couleurs
  const coloredEmotionsData = emotionsChartData.map((item) => {
    const category = emotions.find((e) => e.name === item.emotion)?.category;
    return {
      ...item,
      color: categoryColors[category] || "gray",
    };
  });

  // Calculer la moyenne des émotions
  const emotionsAverage =
    coloredEmotionsData.length > 0
      ? Math.round(
          coloredEmotionsData.reduce((sum, item) => sum + item.count, 0) /
            coloredEmotionsData.length
        )
      : 0;

  const getWeeklyLifeAspectData = (notes) => {
    const weeklyData = notes.reduce((acc, note) => {
      if (note.lifeAspect && note.date) {
        const date = new Date(note.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!acc[weekKey]) {
          acc[weekKey] = {
            week: weekKey,
            aspects: {}
          };
        }

        note.lifeAspect.forEach(aspect => {
          if (!acc[weekKey].aspects[aspect]) {
            acc[weekKey].aspects[aspect] = 0;
          }
          acc[weekKey].aspects[aspect]++;
        });
      }
      return acc;
    }, {});

    return Object.values(weeklyData)
      .map(weekData => ({
        week: format(new Date(weekData.week), 'dd MMM'),
        ...weekData.aspects
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week));
  };

  return (
    <Stack spacing="xl">
      <Paper withBorder>
        {lifeAspectChartData?.length > 0 && (
          <Stack shadow="xs" p="md" gap="">
            <Title order={3}>Distribution of Life Aspects and Emotions</Title>
            <BarChart
              type="stacked"
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
      {peopleChartData.length > 0 && (
        <Paper withBorder>
          <Stack shadow="xs" p="md" gap="">
            <Title order={3}>Distribution des Émotions par Personne</Title>
            <BarChart
              type="stacked"
              h={300}
              data={peopleChartData}
              dataKey="person"
              series={series}
              tickLine="y"
              yAxisProps={{ domain: [0, "auto"] }}
            />
          </Stack>
        </Paper>
      )}
      {emotionsChartData.length > 0 && (
        <Paper withBorder>
          <Stack shadow="xs" p="md" gap="">
            <Title order={3}>Distribution des Émotions</Title>
            <BarChart
              h={300}
              data={coloredEmotionsData}
              dataKey="emotion"
              referenceLines={[
                {
                  y: emotionsAverage,
                  color: "red.5",
                  label: `Moyenne: ${emotionsAverage}`,
                  labelPosition: "insideTopRight",
                },
              ]}
              xAxisProps={{
                angle: -45,
                textAnchor: "end",
                height: 80,

              }}
              series={[
                {
                  name: "count",
                  dataKey: "count",
                  colors: coloredEmotionsData.map((item) => item.color),
                },
              ]}
              tickLine="y"
              yAxisProps={{ domain: [0, "auto"] }}
              valueFormatter={(value) => `${value} fois`}
            />
          </Stack>
        </Paper>
      )}
      {lifeAspectChartData.length > 0 && (
        <Paper withBorder>
          <Stack shadow="xs" p="md" gap="">
            <Title order={3}>Évolution Hebdomadaire des Aspects de Vie</Title>
            <LineChart
              h={300}
              data={getWeeklyLifeAspectData(notes)}
              dataKey="week"
              series={lifeAspects.map(aspect => ({
                name: aspect.value,
                color: `var(--mantine-color-${aspect.color}-7)`,
              }))}
              curveType="natural"
              withLegend
              legendProps={{ verticalAlign: "bottom", height: 80 }}
              xAxisProps={{
                angle: -45,
                textAnchor: "end",
                height: 60,
              }}
              yAxisProps={{ domain: [0, "auto"] }}
              valueFormatter={(value) => `${value} fois`}
            />
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default LifeInsightsDashboard;
