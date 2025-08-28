import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PredictForm() {
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.slice(0, 2 - photos.length).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos([...photos, ...newPhotos]);
    event.target.value = '';
  };

  const handleDeletePhoto = (index) => {
    URL.revokeObjectURL(photos[index].url);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    if (photos.length < 2) fileInputRef.current.click();
  };

  // Camera functions
  const startCamera = async () => {
    if (photos.length >= 2) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      alert('Unable to access camera');
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const newPhoto = {
        file: new File([blob], `captured_${Date.now()}.png`, { type: 'image/png' }),
        url: URL.createObjectURL(blob),
      };
      setPhotos((prev) => (prev.length < 2 ? [...prev, newPhoto] : prev));
    });
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // Submit to backend
  const handleSubmit = async () => {
    if (photos.length !== 2) {
      alert('Please provide both a face and an eye photo.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('face', photos[0].file);
      formData.append('eye', photos[1].file);

      const res = await axios.post('http://127.0.0.1:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { severity_class, severity_percent } = res.data;

      navigate('/result', {
        state: {
          severity: severity_class,
          percentage: severity_percent,
        },
      });
    } catch (error) {
      console.error(error);
      alert('Prediction failed. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Jaundice Prediction</h2>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={openFileDialog}
          disabled={photos.length >= 2}
          style={{ marginRight: 8, padding: '8px 12px' }}
        >
          Upload Photos
        </button>
        <button
          onClick={startCamera}
          disabled={photos.length >= 2 || cameraActive}
          style={{ padding: '8px 12px' }}
        >
          {cameraActive ? 'Camera Active' : 'Open Camera'}
        </button>
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
      </div>

      {cameraActive && (
        <div style={{ marginTop: 16 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
          />
          <div>
            <button onClick={capturePhoto} style={{ padding: '8px 12px', marginRight: 8 }}>
              Capture Photo
            </button>
            <button onClick={stopCamera} style={{ padding: '8px 12px' }}>
              Close Camera
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {photos.map((photo, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: 120,
              height: 120,
              border: '1px solid #ccc',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <img
              src={photo.url}
              alt={`upload-${idx}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              onClick={() => handleDeletePhoto(idx)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              title="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 24,
          width: '100%',
          padding: 12,
          fontSize: 16,
          backgroundColor: '#f5a742',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Predict
      </button>
    </div>
  );
}

export default PredictForm;
