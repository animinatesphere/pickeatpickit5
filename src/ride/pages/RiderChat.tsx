// ─── RiderChat.tsx ────────────────────────────────────────────────────────────
// src/ride/pages/RiderChat.tsx
import ChatShell from "../../component/ChatShell";
import { RiderNav } from "../component/RiderNav";

export default function RiderChat() {
  return <ChatShell nav={<RiderNav />} theme="dark" />;
}
