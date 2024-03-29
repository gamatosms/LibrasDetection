import React, { useRef, useState, useEffect  } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./style.scss";
import { drawHand } from "./drawing";
import * as fp from "fingerpose";
//importando imagens
import letraB from "./images/letraB.png";
import letraC from "./images/letraC.png";
import letraF from "./images/letraF.png";
import letraG from "./images/letraG.png";
import letraI from "./images/letraI.png";
import letraL from "./images/letraL.png";
import letraM from "./images/letraM.png";
import victory from "./images/letraV.png";
//importando gestos
import letraBGesture from "./gestures/letraB";
import letraCGesture from "./gestures/letraC";
import letraFGesture from "./gestures/letraF";
import letraGGesture from "./gestures/letraG";
import letraIGesture from "./gestures/letraI";
import letraLGesture from "./gestures/letraL";
import letraMGesture from "./gestures/letraM";


function Detection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
 
  const [emoji, setEmoji] = useState(null);
  const images = { victory: victory, letraL: letraL, letraM: letraM, letraC: letraC, letraB: letraB, letraF: letraF, letraG: letraG, letraI: letraI };


  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // verificar se possui dado
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // propriedades de video
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // altura e largura do video
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // altura e largura do canvas
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // faz a estimativa da detecção
      const hand = await net.estimateHands(video);
      // console.log(hand);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
            fp.Gestures.VictoryGesture,
            letraBGesture,
            letraCGesture,
            letraFGesture,
            letraGGesture,
            letraIGesture,
            letraLGesture,
            letraMGesture,
        ]);

        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          console.log(gesture.gestures[maxConfidence].name);
          setEmoji(gesture.gestures[maxConfidence].name);
          // console.log(emoji);
        }
      }
      // Desenho da mão
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
 
    
  };

  useEffect(()=>{runHandpose()},[]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: 100,
            marginRight: "auto",
            marginTop: 70,
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
            audio: false,
            borderRadius: 10
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: 100,
            marginRight: "auto",
            marginTop: 70,
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 800,
              bottom: 220,
              right: 0,
              textAlign: "center",
              height: 300,
            }}
          />
        ) : (
          ""
        )}
      </header>
    </div>
  );
}

export default Detection;