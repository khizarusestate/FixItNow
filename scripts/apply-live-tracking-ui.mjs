import fs from "node:fs";

const file = "src/Components/MyBookings.jsx";
let source = fs.readFileSync(file, "utf8");

const importLine = 'import LiveWorkerTracking from "./shared/LiveWorkerTracking.jsx";';
if (!source.includes(importLine)) {
  const anchor = 'import CompletionTicks from "./CompletionTicks";';
  if (!source.includes(anchor)) {
    throw new Error("Could not find CompletionTicks import anchor in MyBookings.jsx");
  }
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

const trackingBlock = `                        {b.worker && ["worker-assigned", "in-progress"].includes(b.status) && (\n                          <LiveWorkerTracking bookingId={b.id} />\n                        )}\n\n                        {/* Notes Section */}`;

if (!source.includes("<LiveWorkerTracking")) {
  if (!source.includes("                        {/* Notes Section */}")) {
    throw new Error("Could not find expandable Notes Section anchor in MyBookings.jsx");
  }
  source = source.replace(
    "                        {/* Notes Section */}",
    trackingBlock,
  );
}

fs.writeFileSync(file, source);
console.log(`Live tracking UI patch applied to ${file}`);
