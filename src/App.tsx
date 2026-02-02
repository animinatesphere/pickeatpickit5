import Route from "./AppRoutes";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Route />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

