import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar.tsx'
import AdminManage from './pages/AdminManage.tsx';
import VolunteerLanding from './pages/UserLanding.tsx';
import AdminLanding from './pages/AdminLanding.tsx';

import { useState } from 'react'



import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  return (
    <Router>
      <Navbar />
      <main className = "p-4">
        <Routes>
          <Route path="/"></Route>
          <Route path="/volunteer" element={<VolunteerLanding/>}></Route>
          <Route path="/register"></Route>
          <Route path="/admin" element={<AdminLanding/>}></Route>
          <Route path="/admin/manage" element={<AdminManage/>}></Route>
        </Routes>
      </main>
    </Router>
    
  )
}

export default App
