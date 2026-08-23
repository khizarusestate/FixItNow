import fs from "node:fs";

const voicePath = "src/Components/VoiceCallPanel.jsx";
let voice = fs.readFileSync(voicePath, "utf8");
if (!voice.includes("statusRef")) {
  voice = voice.replace('  const callRef = useRef(null);\n', '  const callRef = useRef(null);\n  const statusRef = useRef("idle");\n\n  useEffect(() => {\n    statusRef.current = status;\n  }, [status]);\n');
}
voice = voice.replace('if (status === "incoming") await acceptIncoming(current);', 'if (statusRef.current === "incoming") await acceptIncoming(current);');
voice = voice.replace('  }, [acceptIncoming, cleanup, flushCandidates, startOutgoing, status]);', '  }, [acceptIncoming, cleanup, flushCandidates, startOutgoing]);');
fs.writeFileSync(voicePath, voice, "utf8");

const messengerPath = "src/Components/Messenger.jsx";
let messenger = fs.readFileSync(messengerPath, "utf8");
messenger = messenger.replace(/\n\s*const totalUnread = useMemo\([\s\S]*?\n\s*\);\n/, "\n");
fs.writeFileSync(messengerPath, messenger, "utf8");
console.log("Final voice lifecycle patch applied.");
