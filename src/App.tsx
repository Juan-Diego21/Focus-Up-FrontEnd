// Importaciones de contextos y componentes
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/auth/RequireAuth";

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
import { MindMapsStepsPage } from "./pages/MindMapsStepsPage";
import { SpacedRepetitionIntroView } from "./pages/SpacedRepetitionIntroView";
import { SpacedRepetitionStepsView } from "./pages/SpacedRepetitionStepsView";
import { ActiveRecallIntroView } from "./pages/ActiveRecallIntroView";
import { ActiveRecallStepsView } from "./pages/ActiveRecallStepsView";
import { FeynmanIntroView } from "./pages/FeynmanIntroView";
import { FeynmanStepsView } from "./pages/FeynmanStepsView";
import { CornellIntroView } from "./pages/CornellIntroView";
import { CornellStepsView } from "./pages/CornellStepsView";
import { ReportsPage } from "./pages/ReportsPage";

// Componente principal de la aplicación
function App() {
  // Función auxiliar para renderizar páginas protegidas
  const renderProtectedPage = (PageComponent: React.ComponentType) => (
    <RequireAuth>
      <PageComponent />
    </RequireAuth>
  );

  // Función auxiliar para obtener la ruta actual
  const getCurrentPath = () => window.location.pathname;

  // Función principal para renderizar la página basada en la ruta
  const renderPage = () => {
    const path = getCurrentPath();

    // Rutas públicas (no requieren autenticación)
    const publicRoutes: Record<string, React.ComponentType> = {
      "/login": LoginPage,
      "/register": RegisterPage,
      "/confirmation": ConfirmationPage,
      "/survey": SurveyPage,
      "/forgot-password": ForgotPasswordPage,
      "/forgot-password-code": ForgotPasswordCodePage,
      "/forgot-password-reset": ForgotPasswordResetPage,
    };

    // Verificar rutas públicas primero
    if (publicRoutes[path]) {
      const PageComponent = publicRoutes[path];
      return <PageComponent />;
    }

    // Rutas protegidas (requieren autenticación)
    const protectedRoutes: Record<string, React.ComponentType> = {
      "/profile": ProfilePage,
      "/study-methods": StudyMethodsLibraryPage,
      "/dashboard": DashboardPage,
      "/reports": ReportsPage,
    };

    // Verificar rutas protegidas directas
    if (protectedRoutes[path]) {
      const PageComponent = protectedRoutes[path];
      return renderProtectedPage(PageComponent);
    }

    // Manejar rutas dinámicas con parámetros
    if (path.startsWith("/pomodoro/intro/")) {
      return renderProtectedPage(PomodoroIntroView);
    }

    if (path.startsWith("/pomodoro/execute/")) {
      return renderProtectedPage(PomodoroExecutionView);
    }

    if (path.startsWith("/mind-maps/intro/")) {
      return renderProtectedPage(MindMapsInfoPage);
    }

    if (path.startsWith("/mind-maps/steps/")) {
      return renderProtectedPage(MindMapsStepsPage);
    }

    if (path.startsWith("/spaced-repetition/intro/")) {
      return renderProtectedPage(SpacedRepetitionIntroView);
    }

    if (path.startsWith("/spaced-repetition/steps/")) {
      return renderProtectedPage(SpacedRepetitionStepsView);
    }

    if (path.startsWith("/active-recall/intro/")) {
      return renderProtectedPage(ActiveRecallIntroView);
    }

    if (path.startsWith("/active-recall/steps/")) {
      return renderProtectedPage(ActiveRecallStepsView);
    }

    if (path.startsWith("/feynman/intro/")) {
      return renderProtectedPage(FeynmanIntroView);
    }

    if (path.startsWith("/feynman/steps/")) {
      return renderProtectedPage(FeynmanStepsView);
    }

    if (path.startsWith("/cornell/intro/")) {
      return renderProtectedPage(CornellIntroView);
    }

    if (path.startsWith("/cornell/steps/")) {
      return renderProtectedPage(CornellStepsView);
    }

    // Ruta por defecto (dashboard)
    return renderProtectedPage(DashboardPage);
  };

  return (
    <AuthProvider>
      <div className="App">
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;
