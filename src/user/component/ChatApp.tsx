// ─── ChatApp.tsx ──────────────────────────────────────────────────────────────
// src/user/component/ChatApp.tsx
import ChatShell from "../../component/ChatShell";
import { Navbar } from "../../component/Navbar";

export default function ChatApp() {
  return <ChatShell nav={<Navbar />} theme="light" />;
}
