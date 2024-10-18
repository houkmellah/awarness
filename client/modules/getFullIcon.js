import { Rating, rem } from "@mantine/core";
import {
  IconMoodCry,
  IconMoodSad,
  IconMoodSmile,
  IconMoodHappy,
  IconMoodCrazyHappy,
} from "@tabler/icons-react";

const getIconStyle = (color) => ({
  width: rem(30),
  height: rem(30),
  color: color ? `var(--mantine-color-${color}-7)` : undefined,
});

export const GetFullIcon = ({ value }) => {
  switch (value) {
    case 1:
      return <IconMoodCry style={getIconStyle("red")} />;
    case 2:
      return <IconMoodSad style={getIconStyle("orange")} />;
    case 3:
      return <IconMoodSmile style={getIconStyle("yellow")} />;
    case 4:
      return <IconMoodHappy style={getIconStyle("lime")} />;
    case 5:
      return <IconMoodCrazyHappy style={getIconStyle("green")} />;
    default:
      return null;
  }
};
