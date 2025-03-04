import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Forms.css'; // Import the CSS file

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    pass_phrase: '',
    photo: null,
  });

  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showTakePhoto, setShowTakePhoto] = useState(false);
  const [cameraActive, setCameraActive] = useState(false); // Track if the camera is active
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleCapture = () => {
    const constraints = {
      video: true,
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setShowTakePhoto(true); // Show the "Take Photo" button
        setCameraActive(true);  // Set camera as active
      })
      .catch((error) => {
        console.error('Error accessing camera: ', error);
      });
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      setFormData({
        ...formData,
        photo: blob,
      });
    }, 'image/png');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowLoading(true);

    const form = new FormData();
    form.append('first_name', formData.first_name);
    form.append('last_name', formData.last_name);
    form.append('username', formData.username);
    form.append('pass_phrase', formData.pass_phrase);
    if (formData.photo) {
      form.append('photo', formData.photo);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        body: form,
      });

      const text = await response.text();
      setMessage(text);

      if (response.ok) {
        setShowPopup(true); // Show success popup
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after 2 seconds
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred');
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="left-side">
        <img src="/images/3dsm.png" alt="3D SMART FACTORY" className="logo" />
        <p className="mantra">Une structure mixte qui va de la recherche à la création des activités socio-économiques en créant des Startups de différents domaines</p>
      </div>
      <div className="right-side">
        <div className="form-card">
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="pass_phrase"
              placeholder="Pass Phrase"
              value={formData.pass_phrase}
              onChange={handleChange}
              required
            />
            <button type="button" onClick={handleCapture}>Open Camera</button>
            {showTakePhoto && (
              <button type="button" onClick={takePhoto}>Take Photo</button>
            )}
            <button type="submit">Register</button>
          </form>

          {/* Loading Popup */}
          {showLoading && (
            <div className="loading-popup">
              <p>Processing, please wait...</p>
            </div>
          )}

          {/* Success Popup */}
          {showPopup && (
            <div className="message-popup">
              <p>{message}</p>
              <button className="close-btn" onClick={() => setShowPopup(false)}>X</button>
            </div>
          )}

          {/* Video and Canvas for capturing photo */}
          {cameraActive && (
            <video ref={videoRef} style={{ width: '100%', height: 'auto', marginTop: '20px' }}></video>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
