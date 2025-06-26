import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import RegisterPage from './pages/Register.tsx'
import LandingPage from './pages/Landing'
import VolunteerMatchingPage from './pages/MatchVolunteers.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VolunteerMatchingPage />
  </StrictMode>,
)
