import React from "react";
import withAuth from "../modules/auth/withAuth";
import HomePage from "../modules/homePage";

const Index = () => {
  return (
    <HomePage />
  );
};

export default withAuth(Index);
