import React, { useState } from "react";
import "./App.css";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";

function App() {
  const [chess] = useState(
    new Chess()
  );

  const [fen, setFen] = useState(chess.fen());

  const handleMove = (move) => {
    if (chess.move(move)) {


      setFen(chess.fen());
    }
  };
  

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
    </div>
  );
};

export default App;