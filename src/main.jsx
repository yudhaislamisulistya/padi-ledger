import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../templates/js/layout.js'
import '../templates/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
