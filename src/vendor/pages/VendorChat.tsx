// ─── VendorChat.tsx ───────────────────────────────────────────────────────────
// src/vendor/pages/VendorChat.tsx
import ChatShell from "../../component/ChatShell";
import { VendorNav } from "../component/VendorNav";

export default function VendorChat() {
  return <ChatShell nav={<VendorNav />} theme="light" />;
}
