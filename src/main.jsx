import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppLaunchScreen from './Components/AppLaunchScreen.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppLaunchScreen />
    <App />
  </StrictMode>,
)
