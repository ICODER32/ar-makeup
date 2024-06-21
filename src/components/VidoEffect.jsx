// components/LipstickEffect.js
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

const LipstickEffect = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs',
        maxFaces: 1,
      };
      const createdDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      setDetector(createdDetector);
    };
    loadModel();
  }, []);

  const detect = async () => {
    if (
      detector &&
      webcamRef.current &&
      canvasRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const faces = await detector.estimateFaces(video);

      if (faces.length > 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions to match the video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        faces.forEach((face) => {
          const keypoints = face.scaledMesh;

          // Correct lip landmarks indices
          const lipsUpperOuter = [
            keypoints[61],
            keypoints[185],
            keypoints[40],
            keypoints[39],
            keypoints[37],
            keypoints[0],
            keypoints[267],
            keypoints[269],
            keypoints[270],
            keypoints[409],
            keypoints[291]
          ];
          const lipsLowerOuter = [
            keypoints[61],
            keypoints[146],
            keypoints[91],
            keypoints[181],
            keypoints[84],
            keypoints[17],
            keypoints[314],
            keypoints[405],
            keypoints[321],
            keypoints[375],
            keypoints[291]
          ];
          const lipsUpperInner = [
            keypoints[78],
            keypoints[95],
            keypoints[88],
            keypoints[178],
            keypoints[87],
            keypoints[14],
            keypoints[317],
            keypoints[402],
            keypoints[318],
            keypoints[324]
          ];
          const lipsLowerInner = [
            keypoints[78],
            keypoints[191],
            keypoints[80],
            keypoints[81],
            keypoints[82],
            keypoints[13],
            keypoints[312],
            keypoints[311],
            keypoints[310],
            keypoints[415],
            keypoints[308]
          ];

          // Draw the lipstick on lips
          ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red color

          const drawLips = (points) => {
            ctx.beginPath();
            points.forEach((point, index) => {
              if (index === 0) ctx.moveTo(point[0], point[1]);
              else ctx.lineTo(point[0], point[1]);
            });
            ctx.closePath();
            ctx.fill();
          };

          drawLips(lipsUpperOuter);
          drawLips(lipsLowerOuter);
          drawLips(lipsUpperInner);
          drawLips(lipsLowerInner);
        });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(detect, 100);
    return () => clearInterval(interval);
  }, [detector]);

  return (
    <>
      <Webcam
        ref={webcamRef}
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 2 }}
      />
    </>
  );
};

export default LipstickEffect;
