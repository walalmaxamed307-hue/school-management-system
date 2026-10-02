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
import LandingPage from '@/pages/LandingPage'
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

// Providers-ka xogta
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
                            <RoomsProvider>
                              {children}
                            </RoomsProvider>
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

// GO'DOOMIN IISKUUL KASTA
function Shell() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC PAGES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN + TEACHER */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <AppProviders key={user?.id ?? 'anon'}>
                <DashboardLayout />
              </AppProviders>
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

        {/* ADMIN ONLY */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppProviders key={user?.id ?? 'anon'}>
                <DashboardLayout />
              </AppProviders>
            </ProtectedRoute>
          }
        >
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/fees" element={<FeesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* TEACHER ONLY - HOMEWORK */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppProviders key={user?.id ?? 'anon'}>
                <DashboardLayout />
              </AppProviders>
            </ProtectedRoute>
          }
        >
          <Route path="/homework" element={<HomeworkPage />} />
        </Route>

        {/* STUDENT ONLY */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppProviders key={user?.id ?? 'anon'}>
                <StudentLayout />
              </AppProviders>
            </ProtectedRoute>
          }
        >
          <Route path="/my-results" element={<StudentResultsPage />} />
          <Route path="/my-homework" element={<StudentHomeworkPage />} />
          <Route path="/my-announcements" element={<AnnouncementsPage />} />
          <Route path="/my-room" element={<StudentRoomPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<CatchAllRedirect />} />

      </Routes>
    </BrowserRouter>
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