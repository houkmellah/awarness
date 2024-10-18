import React from "react";
import { MultiSelect } from "@mantine/core";

const MultiSelectPeople = ({ listPeople, form }) => {
  const convertedArray = listPeople.map((item) => ({
    value: item._id,
    label: `${item.firstName} ${item.secondName} ${item.nickName}`.trim(),
  }));
  return (
    <MultiSelect
      data={convertedArray}
      {...form.getInputProps("people")}
      searchable
      label="People"
      w="67%"
    />
  );
};

export default MultiSelectPeople;
