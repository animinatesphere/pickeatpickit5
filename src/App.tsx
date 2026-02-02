import Route from "./AppRoutes";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalThemeToggle from "./components/GlobalThemeToggle";

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Route />
        <GlobalThemeToggle />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

