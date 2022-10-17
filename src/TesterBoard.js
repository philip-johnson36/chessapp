import React, { useEffect, useState } from "react";
import "./App.css";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";
import {
    Button,
    Flex,
    Heading,
    Text,
    TextField,
    View,
    withAuthenticator,
  } from "@aws-amplify/ui-react";
import { listPositions } from "./graphql/queries";
import {
  createPosition as createPositionMutation,
  updatePosition as updatePositionMutation,
  deletePosition as deletePositionMutation,
} from "./graphql/mutations";
import { API, Auth, Storage } from "aws-amplify";
function TesterBoard() {
  const [chess] = useState(new Chess());
  const [positions, setPositions] = useState([]);
  const [position, setPosition] = useState("");
  const [orient, setOrient] = useState('white')
  useEffect(() => {
    async function fetchData(){
      await fetchPositions();
      servePosition();
    }
    fetchData();

  }, []);

  const handleMove = (move) => {
    let madeMove = chess.move(move);
    if (madeMove && position.moves.includes(madeMove.san)) {
      let position2 = {...position};
      position2.fen = chess.fen();
      setPosition(position2);
      setTimeout(servePosition, 1000);
    }
    else{
      console.log("wrong!");
      chess.load(position.fen);
    }
  };


  async function fetchPositions() {
    const apiData = await API.graphql({ query: listPositions });
    const  notesFromAPI = apiData.data.listPositions.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.fen);
          note.image = url;
        }
        return note;
      })
  );
    let autha = await Auth.currentUserInfo();
    let notesFromAPI2 = notesFromAPI.filter((position)=>{
        //console.log(autha.id); console.log(position.author);
        return autha.id === position.author;
    })
    console.log("TEST notes form api", notesFromAPI2);
    setPositions(notesFromAPI2);
    return notesFromAPI2;
  }


  async function servePosition(){
    fetchPositions().then(
      (response) => {
        let pos = response[Math.floor(Math.random() * response.length)];
        console.log("serve", response);
        setPosition(pos);
        setOrient(pos.fen.split(" ")[1]==='w' ? 'white' : 'black')
        chess.load(pos.fen);
      }
    )

    
  }

  async function deletePosition(){
    let ID = position.id
    API.graphql({ query: deletePositionMutation, variables: { input: { id:ID } }}).then(
      () => {
        servePosition();
      }
    )
  }

  return (
    <div className="flex-center">
      <h1>Training</h1>
      <Chessboard
        width={400}
        position={position.fen}
        orientation={orient}
        onDrop={(move) => {
              handleMove({
                from: move.sourceSquare,
                to: move.targetSquare
              });

          }
        }
      />
      {position.image && (
      <img
        src={position.image}
        alt={`visual aid for ${position.fen}`}
        style={{ width: 400 }}
      />
    )}
    <br></br>
      <Button onClick={deletePosition}>Delete Position</Button>
      <Button onClick={servePosition}>Skip Position</Button>
    </div>
    
  );
};

export default TesterBoard;