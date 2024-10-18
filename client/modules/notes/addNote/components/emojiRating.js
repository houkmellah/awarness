import { Rating, rem } from "@mantine/core";
import {
  IconMoodCry,
  IconMoodSad,
  IconMoodSmile,
  IconMoodHappy,
  IconMoodCrazyHappy,
} from "@tabler/icons-react";

const getIconStyle = (color) => ({
  width: rem(50),
  height: rem(50),
  color: color ? `var(--mantine-color-${color}-7)` : undefined,
});

const getEmptyIcon = (value) => {
  const iconStyle = getIconStyle();

  switch (value) {
    case 1:
      return <IconMoodCry style={iconStyle} />;
    case 2:
      return <IconMoodSad style={iconStyle} />;
    case 3:
      return <IconMoodSmile style={iconStyle} />;
    case 4:
      return <IconMoodHappy style={iconStyle} />;
    case 5:
      return <IconMoodCrazyHappy style={iconStyle} />;
    default:
      return null;
  }
};

const getFullIcon = (value) => {
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

function EmojiRating({ value, onChange }) {
  return (
    <Rating
      size={"30px"}
      emptySymbol={getEmptyIcon}
      fullSymbol={getFullIcon}
      highlightSelectedOnly
      value={value}
      onChange={onChange}
    />
  );
}

export default EmojiRating;
