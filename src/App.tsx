// Importaciones de contextos y componentes
import { RequireAuth } from "./components/auth/RequireAuth";
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from "./contexts/AuthContext";
import { FirstLoginModal } from "./components/FirstLoginModal";
import { Suspense, lazy } from 'react';

// Implementación de code splitting basado en rutas para mejorar el rendimiento inicial
// Todas las páginas ahora se cargan de forma lazy para reducir el tamaño del bundle inicial
// Se eliminaron las importaciones síncronas y se reemplazaron por lazy loading

// Páginas públicas con lazy loading
const LoginPage = lazy(() => import("./pages/LoginPage").then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(module => ({ default: module.RegisterPage })));
const RegisterStep2 = lazy(() => import("./pages/RegisterStep2").then(module => ({ default: module.RegisterStep2 })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then(module => ({ default: module.ForgotPasswordPage })));
const ForgotPasswordCodePage = lazy(() => import("./pages/ForgotPasswordCodePage").then(module => ({ default: module.ForgotPasswordCodePage })));
const ForgotPasswordResetPage = lazy(() => import("./pages/ForgotPasswordResetPage").then(module => ({ default: module.ForgotPasswordResetPage })));

// Páginas protegidas con lazy loading
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(module => ({ default: module.DashboardPage })));
const StudyMethodsLibraryPage = lazy(() => import("./pages/StudyMethodsLibraryPage").then(module => ({ default: module.StudyMethodsLibraryPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then(module => ({ default: module.ProfilePage })));
const PomodoroIntroView = lazy(() => import("./pages/PomodoroIntroView").then(module => ({ default: module.PomodoroIntroView })));
const PomodoroExecutionView = lazy(() => import("./pages/PomodoroExecutionView").then(module => ({ default: module.PomodoroExecutionView })));
const MindMapsInfoPage = lazy(() => import("./pages/MindMapsInfoPage").then(module => ({ default: module.MindMapsInfoPage })));
const MindMapsStepsPage = lazy(() => import("./pages/MindMapsStepsPage"));
const SpacedRepetitionIntroView = lazy(() => import("./pages/SpacedRepetitionIntroView").then(module => ({ default: module.SpacedRepetitionIntroView })));
const SpacedRepetitionStepsView = lazy(() => import("./pages/SpacedRepetitionStepsView").then(module => ({ default: module.SpacedRepetitionStepsView })));
const ActiveRecallIntroView = lazy(() => import("./pages/ActiveRecallIntroView").then(module => ({ default: module.ActiveRecallIntroView })));
const ActiveRecallStepsView = lazy(() => import("./pages/ActiveRecallStepsView").then(module => ({ default: module.ActiveRecallStepsView })));
const FeynmanIntroView = lazy(() => import("./pages/FeynmanIntroView").then(module => ({ default: module.FeynmanIntroView })));
const FeynmanStepsView = lazy(() => import("./pages/FeynmanStepsView").then(module => ({ default: module.FeynmanStepsView })));
const CornellIntroView = lazy(() => import("./pages/CornellIntroView").then(module => ({ default: module.CornellIntroView })));
const CornellStepsView = lazy(() => import("./pages/CornellStepsView").then(module => ({ default: module.CornellStepsView })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then(module => ({ default: module.ReportsPage })));
const StartSession = lazy(() => import("./pages/sessions/StartSession").then(module => ({ default: module.StartSession })));
const MusicAlbumsPage = lazy(() => import("./pages/MusicAlbumsPage").then(module => ({ default: module.MusicAlbumsPage })));
const MusicSongsPage = lazy(() => import("./pages/MusicSongsPage").then(module => ({ default: module.MusicSongsPage })));
const EventsPage = lazy(() => import("./pages/EventsPage").then(module => ({ default: module.EventsPage })));
const NotificationPage = lazy(() => import("./pages/NotificationPage").then(module => ({ default: module.NotificationPage })));

// Componente principal de la aplicación
function App() {
  const { showFirstLoginModal, setShowFirstLoginModal } = useAuth();
  const navigate = useNavigate();

  const handleAcceptSurvey = () => {
    setShowFirstLoginModal(false);
    navigate("/profile");
  };

  const handleDeclineSurvey = () => {
    setShowFirstLoginModal(false);
    navigate("/dashboard");
  };

  return (
    <div className="App">
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onAccept={handleAcceptSurvey}
        onDecline={handleDeclineSurvey}
      />
      {/* Suspense para manejar la carga lazy de componentes */}
      {/* Esto permite mostrar un indicador de carga mientras se cargan las páginas */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717]">
          <div className="text-white text-lg">Cargando...</div>
        </div>
      }>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/step2" element={<RegisterStep2 />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password-code" element={<ForgotPasswordCodePage />} />
          <Route path="/forgot-password-reset" element={<ForgotPasswordResetPage />} />

          {/* Rutas protegidas */}
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/study-methods" element={<RequireAuth><StudyMethodsLibraryPage /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
          <Route path="/start-session" element={<RequireAuth><StartSession /></RequireAuth>} />
          <Route path="/start-session/:sessionId" element={<RequireAuth><StartSession /></RequireAuth>} />
          <Route path="/events" element={<RequireAuth><EventsPage /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><NotificationPage /></RequireAuth>} />
          <Route path="/music/albums" element={<RequireAuth><MusicAlbumsPage /></RequireAuth>} />
          <Route path="/music/albums/:albumId" element={<RequireAuth><MusicSongsPage /></RequireAuth>} />

          {/* Rutas dinámicas con parámetros */}
          <Route path="/pomodoro/intro/:methodId" element={<RequireAuth><PomodoroIntroView /></RequireAuth>} />
          <Route path="/pomodoro/execute/:methodId" element={<RequireAuth><PomodoroExecutionView /></RequireAuth>} />
          <Route path="/mind-maps/intro/:methodId" element={<RequireAuth><MindMapsInfoPage /></RequireAuth>} />
          <Route path="/mind-maps/steps/:methodId" element={<RequireAuth><MindMapsStepsPage /></RequireAuth>} />
          <Route path="/spaced-repetition/intro/:methodId" element={<RequireAuth><SpacedRepetitionIntroView /></RequireAuth>} />
          <Route path="/spaced-repetition/steps/:methodId" element={<RequireAuth><SpacedRepetitionStepsView /></RequireAuth>} />
          <Route path="/active-recall/intro/:methodId" element={<RequireAuth><ActiveRecallIntroView /></RequireAuth>} />
          <Route path="/active-recall/steps/:methodId" element={<RequireAuth><ActiveRecallStepsView /></RequireAuth>} />
          <Route path="/feynman/intro/:methodId" element={<RequireAuth><FeynmanIntroView /></RequireAuth>} />
          <Route path="/feynman/steps/:methodId" element={<RequireAuth><FeynmanStepsView /></RequireAuth>} />
          <Route path="/cornell/intro/:methodId" element={<RequireAuth><CornellIntroView /></RequireAuth>} />
          <Route path="/cornell/steps/:methodId" element={<RequireAuth><CornellStepsView /></RequireAuth>} />

          {/* Ruta por defecto */}
          <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
