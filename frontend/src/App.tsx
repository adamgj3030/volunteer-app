import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { Toaster } from 'sonner';
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
import RegisterPage from './pages/Register.tsx'
import VolunteerMatchingPage from './pages/MatchVolunteers.tsx'
import NotificationsTesting from './pages/NotificationsTesting.tsx';
import NotificationListener from './components/NotificationListener.tsx';
import EventMatching from './pages/EventMatching.tsx';
import { ProtectedRoute }  from '@/components/ProtectedRoute';

function App() {

  return (
    <Router>
      <Navbar />
      <Toaster richColors position="bottom-right"/>
      <NotificationListener />
      <main>
        <Routes>
              <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Volunteer pages (no more ProtectedRoute) */}
      <Route path="/volunteer"           element={<VolunteerLanding />} />
      <Route path="/volunteer/task"      element={<TaskList />} />
      <Route path="/volunteer/manage"    element={<ProfileForm />} />
      <Route path="/volunteer/matching"  element={<EventMatching />} />

      {/* Admin pages */}
      <Route path="/admin"               element={<AdminLanding />} />
      <Route path="/admin/approval"      element={<AdminManage />} />
      <Route path="/admin/history"       element={<VolunteerHistory />} />
      <Route path="/admin/event/creation" element={<EventForm />} />
      <Route path="/admin/matching"      element={<VolunteerMatchingPage />} />

      {/* Misc */}
      <Route path="/notifications"       element={<NotificationsTesting />} />
          {/* <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/register" element={<RegisterPage/>}></Route>
          <Route path="/volunteer" element={<ProtectedRoute allow={['ADMIN', 'VOLUNTEER']}><VolunteerLanding/></ProtectedRoute>} />
          <Route path="/volunteer/task" element={<ProtectedRoute allow={['ADMIN', 'VOLUNTEER']}><TaskList/></ProtectedRoute>} />
          <Route path="/volunteer/manage" element={<ProtectedRoute allow={['ADMIN', 'VOLUNTEER']}><ProfileForm/></ProtectedRoute>} />
          <Route path="/volunteer/matching" element={<ProtectedRoute allow={['ADMIN', 'VOLUNTEER']}><EventMatching /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allow={['ADMIN']} redirectTo="/login"><AdminLanding /></ProtectedRoute>} />
          <Route path="/admin/approval" element={<ProtectedRoute allow={['ADMIN']} redirectTo="/login"><AdminManage /></ProtectedRoute>} />
          <Route path="/admin/history" element={<ProtectedRoute allow={['ADMIN']} redirectTo="/login"><VolunteerHistory /></ProtectedRoute>} />
          <Route path="/admin/event/creation" element={<ProtectedRoute allow={['ADMIN']} redirectTo="/login"><EventForm /></ProtectedRoute>} />
          <Route path="/admin/matching" element={<ProtectedRoute allow={['ADMIN']} redirectTo="/login"><VolunteerMatchingPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allow={[]} redirectTo="/login"><NotificationsTesting /></ProtectedRoute>} /> */}
        </Routes>
      </main>
    </Router>
  )
}

export default App