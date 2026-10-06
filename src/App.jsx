import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { ThemeProvider } from '@/context/ThemeContext'
import { StudentsProvider } from '@/context/StudentsContext'
import { ClassesProvider } from '@/context/ClassesContext'
import { SubjectsProvider } from '@/context/SubjectsContext'
import { TeachersProvider } from '@/context/TeachersContext'
import { FeesProvider } from '@/context/FeesContext'
import { ExamResultsProvider } from '@/context/ExamResultsContext'
import { AttendanceProvider } from '@/context/AttendanceContext'
import { TeacherAttendanceProvider } from '@/context/TeacherAttendanceContext'
import { SchoolSettingsProvider } from '@/context/SchoolSettingsContext'
import { AnnouncementsProvider } from '@/context/AnnouncementsContext'
import { SearchProvider } from '@/context/SearchContext'
import { RoomsProvider } from '@/context/RoomsContext'
import { ToastProvider } from '@/context/ToastContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import CatchAllRedirect from '@/components/CatchAllRedirect'
import DashboardLayout from '@/layouts/DashboardLayout'
import StudentLayout from '@/layouts/StudentLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import StudentsPage from '@/pages/StudentsPage'
import TeachersPage from '@/pages/TeachersPage'
import AttendancePage from '@/pages/AttendancePage'
import FeesPage from '@/pages/FeesPage'
import ExamResultsPage from '@/pages/ExamResultsPage'
import StudentResultsPage from '@/pages/StudentResultsPage'
import SettingsPage from '@/pages/SettingsPage'
import AnnouncementsPage from '@/pages/AnnouncementsPage'
import RoomsPage from '@/pages/RoomsPage'
import GraduatesPage from '@/pages/GraduatesPage'
import StudentRoomPage from '@/pages/StudentRoomPage'
import HomeworkPage from '@/pages/HomeworkPage'
import StudentHomeworkPage from '@/pages/StudentHomeworkPage'
import LandingPage from './pages/LandingPage'

// Providers-ka xogta (backend + mock ilaa la isku xiro) dhammaantood waa in ay ka sarreeyaan Routes-ka,
// si xogtu u wadaagto pages-ka oo dhan (Students, Attendance, Fees, Exam
// results) — ma aha mid kasta oo state gaar ah leh.
function AppProviders({ children }) {
  return (
    <ToastProvider>
      <SchoolSettingsProvider>
        <StudentsProvider>
          <ClassesProvider>
            <SubjectsProvider>
              <TeachersProvider>
                <FeesProvider>
                  <ExamResultsProvider>
                    <AttendanceProvider>
                      <TeacherAttendanceProvider>
                        <AnnouncementsProvider>
                          <SearchProvider>
                            <RoomsProvider>{children}</RoomsProvider>
                          </SearchProvider>
                        </AnnouncementsProvider>
                      </TeacherAttendanceProvider>
                    </AttendanceProvider>
                  </ExamResultsProvider>
                </FeesProvider>
              </TeachersProvider>
            </SubjectsProvider>
          </ClassesProvider>
        </StudentsProvider>
      </SchoolSettingsProvider>
    </ToastProvider>
  )
}

// GO'DOOMIN IISKUUL KASTA: AppProviders waxaa loo furaa `key={user.id}`,
// sidaas darteed marka user kale login sameeyo (ama la ka baxo), state-ka
// contexts-ka oo dhan waa la baabi'inayaa — iskuul B ma arki karo wax
// ku hadhay xusuusta browser-ka ee iskuul A.
function Shell() {
  const { user } = useAuth()
  return (
    <AppProviders key={user?.id ?? 'anon'}>
        <BrowserRouter>
          <Routes>
              <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage/>} />

            <Route
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/exam-results" element={<ExamResultsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/graduates" element={<GraduatesPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/homework" element={<HomeworkPage />} />
            </Route>

            {/* Fees: admin + macalinka fee manager-ka ah */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']} feeAccess>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/fees" element={<FeesPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/my-results" element={<StudentResultsPage />} />
              <Route path="/my-homework" element={<StudentHomeworkPage />} />
              <Route path="/my-announcements" element={<AnnouncementsPage />} />
              <Route path="/my-room" element={<StudentRoomPage />} />
            </Route>

            <Route path="*" element={<CatchAllRedirect />} />
          </Routes>
        </BrowserRouter>
    </AppProviders>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
