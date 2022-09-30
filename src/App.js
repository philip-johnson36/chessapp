
import React, { useState } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
}from "@aws-amplify/ui-react";
import CreatorBoard from "./creatorBoard";
import Chessboard from 'chessboardjsx';
import TesterBoard from "./TesterBoard";

const boardsContainer = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center"
};

function App({ signOut }) {

  const [activity, setActivity] = useState("create");
  const [board, setBoard] = useState(<CreatorBoard/>);

  const switchActivity = (newActivity) =>  {
    setActivity(newActivity)
    setBoard(newActivity=="create" ? <CreatorBoard/> : <TesterBoard/>)
  }
  return (
    <div className="App">
      <div style = {boardsContainer}>
        {board}
      </div>
      

      <button onClick={signOut}>Sign Out</button>
      <button onClick={() => switchActivity("test")}>Test</button>
      <button onClick={() => switchActivity("create")}>Create</button>
    </div>
  );


}

export default withAuthenticator(App);