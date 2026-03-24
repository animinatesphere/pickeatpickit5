import Route from "./AppRoutes";
import { ToastProvider } from "./context/ToastContext";
// import { ChatFloatingBubble } from "./component/ChatFloatingBubble";

const App = () => {
  return (
    <ToastProvider>
      <Route />
      {/* <ChatFloatingBubble /> */}
    </ToastProvider>
  );
};

export default App;
