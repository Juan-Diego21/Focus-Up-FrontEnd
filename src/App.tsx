// Importaciones de contextos y componentes
import { RequireAuth } from "./components/auth/RequireAuth";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importaciones de páginas públicas
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ForgotPasswordCodePage } from "./pages/ForgotPasswordCodePage";
import { ForgotPasswordResetPage } from "./pages/ForgotPasswordResetPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { SurveyPage } from "./pages/SurveyPage";

// Importaciones de páginas protegidas
import { DashboardPage } from "./pages/DashboardPage";
import { StudyMethodsLibraryPage } from "./pages/StudyMethodsLibraryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PomodoroIntroView } from "./pages/PomodoroIntroView";
import { PomodoroExecutionView } from "./pages/PomodoroExecutionView";
import { MindMapsInfoPage } from "./pages/MindMapsInfoPage";
import MindMapsStepsPage from "./pages/MindMapsStepsPage";
import { SpacedRepetitionIntroView } from "./pages/SpacedRepetitionIntroView";
import { SpacedRepetitionStepsView } from "./pages/SpacedRepetitionStepsView";
import { ActiveRecallIntroView } from "./pages/ActiveRecallIntroView";
import { ActiveRecallStepsView } from "./pages/ActiveRecallStepsView";
import { FeynmanIntroView } from "./pages/FeynmanIntroView";
import { FeynmanStepsView } from "./pages/FeynmanStepsView";
import { CornellIntroView } from "./pages/CornellIntroView";
import { CornellStepsView } from "./pages/CornellStepsView";
import { ReportsPage } from "./pages/ReportsPage";
import { MusicAlbumsPage } from "./pages/MusicAlbumsPage";
import { MusicSongsPage } from "./pages/MusicSongsPage";

// Componente principal de la aplicación
function App() {
  return (
    <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password-code" element={<ForgotPasswordCodePage />} />
        <Route path="/forgot-password-reset" element={<ForgotPasswordResetPage />} />

        {/* Rutas protegidas */}
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/study-methods" element={<RequireAuth><StudyMethodsLibraryPage /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
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
    </div>
  );
}

export default App;
