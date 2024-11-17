import React from "react";
import { MultiSelect } from "@mantine/core";
import Debugger from "../../debugger";

const MultiSelectPeople = ({ listPeople, form }) => {
  const convertedArray = listPeople.map((item) => ({
    value: item._id,
    label: `${item?.firstName || ''} ${item?.secondName || ''} ${item?.nickName || ''}`.trim(),
  }));

  const selectedPeopleIds = form.values.people?.map(person => person._id) || [];

  return (
    <>
    <MultiSelect
      data={convertedArray}
      value={selectedPeopleIds}
      onChange={(values) => {
        const selectedPeople = values.map(id => 
          listPeople.find(person => person._id === id)
        ).filter(Boolean);
        form.setFieldValue("people", selectedPeople);
      }}
      searchable
      label="People"
      w="67%"
    />
    </>
  );
};

export default MultiSelectPeople;