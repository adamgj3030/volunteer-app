import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar.tsx'
import AdminManage from './pages/AdminManage.tsx';
import VolunteerLanding from './pages/UserLanding.tsx';
import AdminLanding from './pages/AdminLanding.tsx';
import VolunteerHistory from "./pages/VolunteerHistory.tsx";
import EventForm from "./pages/EventForm.tsx";
import TaskList from "./pages/TaskList.tsx";
import ProfileForm from "./pages/ProfileForm.tsx";
import Login from "./pages/Login.tsx";
import LandingPage from "./pages/LandingPage2.tsx";

function App() {

  return (
    <Router>
      <Navbar />
      <main className = "p-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/volunteer" element={<VolunteerLanding/>}></Route>
          <Route path="/volunteer/task" element={<TaskList/>}></Route>
          <Route path="/volunteer/manage" element={<ProfileForm/>}></Route>
          <Route path="/volunteer/history" element={<VolunteerHistory/>}></Route>
          <Route path="/admin" element={<AdminLanding/>}></Route>
          <Route path="/admin/approval" element={<AdminManage/>}></Route>
          <Route path="/admin/event/creation" element={<EventForm/>}></Route>
        </Routes>
      </main>
    </Router>
  )
}

export default App