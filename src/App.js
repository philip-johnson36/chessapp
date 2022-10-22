
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

const boardsContainer = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center"
};
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
    let madeMove = chess.move(move);
    if (madeMove) {
      setPgn(chess.pgn());
      setOldfen(fen);
      setFen(chess.fen());
      setLastMove(madeMove.san);
    }
  };

  const goBack = () => {
    let hist = chess.history();
    if (hist.length < 1) return;
    chess.reset();
    for (let i = 0; i < hist.length - 1; i++) {
      handleMove(hist[i]);
      // console.log("handling", hist[i]);
    }
  };

  async function fetchPositions() {
    const apiData = await API.graphql({ query: listPositions });
    const notesFromAPI = apiData.data.listPositions.items;
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
    let notesFromAPI2 = notesFromAPI.filter((position) => {
      //console.log(autha.id); console.log(position.author);
      return autha.id === position.author;
    });
    // console.log("notes form api", notesFromAPI2);
    setPositions(notesFromAPI2);
  }

  async function savePosition() {
    let matchingPosition = positions.filter((position) => {
      // console.log("same?", position.fen, oldfen, position.fen === oldfen);
      return position.fen === oldfen;
    });
    // console.log("matching position", matchingPosition);
    if (matchingPosition.length) {
      let position = matchingPosition[0];
      // console.log("position", position, position.id);
      if (!position.moves.includes(lastMove)) {
        // console.log("updating!");
        position.moves.push(lastMove);
        await API.graphql({
          query: updatePositionMutation,
          variables: {
            input: {
              id: position.id,
              moves: position.moves,
              fen: position.fen,
              author: position.author,
              image: position.image,
            },
          },
        });
        fetchPositions();
      }
    } else {
      createPosition();
    }
  }

  async function createPosition() {
    let autha = await Auth.currentUserInfo();
    // console.log("author", autha);
    let data = {
      fen: oldfen,
      moves: [lastMove],
      author: autha.id,
      image: picture.name,
    };
    // console.log("data", data);
    if (!!data.image)
      await Storage.put(data.fen, picture).then((response) => {}
        // console.log("storage put", response)
      );
    await API.graphql({
      query: createPositionMutation,
      variables: { input: data },
    });
    fetchPositions();
  }

  return (
    <div className="flex-center">
      <h1>Create</h1>
      <Chessboard
        width={400}
        position={fen}
        onDrop={(move) => {
          handleMove({
            from: move.sourceSquare,
            to: move.targetSquare,
          });
        }}
      />
      <p>{pgn}</p>
      <Button onClick={savePosition}>Save Position</Button>
      <Button onClick={goBack}>Go Back a Move</Button>
      <br></br>
      <input
        type="file"
        onChange={(e) => {
          setPicture(e.target.files[0]);
          // console.log("new picture!", e.target.files[0]);
        }}
      />

    </div>
  );
}

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