import Route from "./AppRoutes";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalThemeToggle from "./components/GlobalThemeToggle";
import { ChatFloatingBubble } from "./component/ChatFloatingBubble";

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Route />
        <GlobalThemeToggle />
        <ChatFloatingBubble />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

