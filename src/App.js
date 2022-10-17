
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
import CreatorBoard from "./CreatorBoard";
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
      

      <Button onClick={signOut}>Sign Out</Button>
      <Button onClick={() => switchActivity("train")}>Train</Button>
      <Button onClick={() => switchActivity("create")}>Create</Button>
      <Text> Instructions: <br/> To use creative mode, make the move you want to remember, then make sure the 
      correct picture is uploaded. Then, click "save position" to save the last move you made along with your mnemonic.
      <br/> To use testing mode, simply make a correct move when given a position. <br/>  </Text>

    </div>
  );


}

export default withAuthenticator(App);