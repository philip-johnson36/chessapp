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
function CreatorBoard() {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [oldfen, setOldfen] = useState(chess.fen());
  const [pgn, setPgn] = useState(chess.pgn());
  const [lastMove, setLastMove] = useState("");
  const [positions, setPositions] = useState([]);
  const [picture, setPicture] = useState("");

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleMove = (move) => {
    let madeMove = chess.move(move)
    if (madeMove) {
      setPgn(chess.pgn());
      setOldfen(fen);
      setFen(chess.fen());
      setLastMove(madeMove.san)
      
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
    console.log("notes form api", notesFromAPI2);
    setPositions(notesFromAPI2);
  }

  async function savePosition(){
    let matchingPosition = positions.filter((position)=>{
        console.log("same?", position.fen, oldfen, position.fen===oldfen);
        return position.fen===oldfen
    })
    console.log("matching position", matchingPosition)
    if(matchingPosition.length){
        let position = matchingPosition[0];
        console.log("position", position, position.id)
        if(!position.moves.includes(lastMove)){
            console.log("updating!");
            position.moves.push(lastMove);
            await API.graphql({
                query: updatePositionMutation,
                variables: { input: {
                    id: position.id,
                    moves: position.moves,
                    fen: position.fen,
                    author: position.author,
                    image: position.image

                } },
              });
              fetchPositions();
        }
    }
    else{
        createPosition();
    }
    

  }

  async function createPosition() {
    let autha = await Auth.currentUserInfo();
    console.log("author", autha);
    let data = {
      fen: oldfen,
      moves: [lastMove],
      author: autha.id,
      image: picture.name
    };
    console.log("data", data);
    if (!!data.image) await Storage.put(data.fen, picture).then((response=>console.log("storage put", response)));
    await API.graphql({
      query: createPositionMutation,
      variables: { input: data },
    });
    fetchPositions();
  }



  return (
    <div className="flex-center">
      <h1>Random Chess</h1>
      <Chessboard
        width={400}
        position={fen}
        onDrop={(move) => {
              handleMove({
                from: move.sourceSquare,
                to: move.targetSquare
              });
            }
        }
      />
      <p>{pgn}</p>
      <button onClick={savePosition}>Save Position</button>
      <input type="file" onChange={(e)=>{
        setPicture(e.target.files[0]);
        console.log("new picture!", e.target.files[0])
        }}/>
    </div>
  );
};

export default CreatorBoard;