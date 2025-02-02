import React from "react";
import AddAndUpdateFear from "../../modules/fears/addAndUpdateFear";
import ListFears from "../../modules/fears/listFairs";

const fears = () => {
  return (
    <>
      <AddAndUpdateFear />
      <ListFears />
    </>
  );
};

export default fears;
