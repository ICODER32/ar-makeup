// components/LipstickEffect.js
import React, { useRef, useEffect, useState } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

const LipstickEffect = () => {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const detect = async () => {
    if (detector && imageRef.current && canvasRef.current) {
      const image = imageRef.current;
      const faces = await detector.estimateFaces(image);

      if (faces.length > 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions to match the image
        canvas.width = image.width;
        canvas.height = image.height;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(image, 0, 0, image.width, image.height);

        faces.forEach((face) => {
          const keypoints = face.keypoints;

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
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Semi-transparent red color

          const drawLips = (points) => {
            ctx.beginPath();
            points.forEach((point, index) => {
              if (index === 0) ctx.moveTo(point.x, point.y);
              else ctx.lineTo(point.x, point.y);
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
    if (imageSrc) {
      detect();
    }
  }, [imageSrc, detector]);

  return (
    <>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {imageSrc && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img ref={imageRef} src={imageSrc} alt="uploaded" style={{ display: 'none' }} onLoad={detect} />
          <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        </div>
      )}
    </>
  );
};

export default LipstickEffect;
