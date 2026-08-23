import fs from "node:fs";
const p = "src/Components/VoiceCallPanel.jsx";
let s = fs.readFileSync(p, "utf8");
const old = '      const pc = pcRef.current;\n      if (!pc || !data.signal) return;';
const next = '      if (!data.signal) return;\n      if (data.signal.type === "ice-candidate" && !pcRef.current) {\n        pendingCandidatesRef.current.push(data.signal.candidate);\n        return;\n      }\n      const pc = pcRef.current;\n      if (!pc) return;';
if (!s.includes(old)) throw new Error("ICE candidate handling anchor not found");
s = s.replace(old, next);
fs.writeFileSync(p, s, "utf8");
console.log("ICE candidate ordering patch applied.");
