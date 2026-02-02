// import { Router } from "react-router-dom";
import Route from "./AppRoutes";
import { ToastProvider } from "./context/ToastContext";

const App = () => {
  return (
    <ToastProvider>
      <Route />
    </ToastProvider>
  );
};

export default App;

