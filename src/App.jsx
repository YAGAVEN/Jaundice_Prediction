import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ResultPage from './components/ResultPage';
import PredictForm from './components/PredictionForm';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PredictForm />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;
