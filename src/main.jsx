import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'// src/index.js or src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
