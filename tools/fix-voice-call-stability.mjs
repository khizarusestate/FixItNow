import fs from "node:fs";

const p = "src/Components/VoiceCallPanel.jsx";
let s = fs.readFileSync(p, "utf8");
if (!s.includes("statusRef")) {
  s = s.replace('  const callRef = useRef(null);\n', '  const callRef = useRef(null);\n  const statusRef = useRef("idle");\n\n  useEffect(() => {\n    statusRef.current = status;\n  }, [status]);\n');
}
s = s.replace('if (status === "incoming") await acceptIncoming(current);', 'if (statusRef.current === "incoming") await acceptIncoming(current);');
s = s.replace('  }, [acceptIncoming, cleanup, flushCandidates, startOutgoing, status]);', '  }, [acceptIncoming, cleanup, flushCandidates, startOutgoing]);');
fs.writeFileSync(p, s, "utf8");

const messenger = "src/Components/Messenger.jsx";
let m = fs.readFileSync(messenger, "utf8");
m = m.replace(/\n\s*const totalUnread = useMemo\([\s\S]*?\n\s*\);\n/, "\n");
fs.writeFileSync(messenger, m, "utf8");

console.log("Voice call stability patch applied.");
