export const WORKER_ACTIVE_STATUSES = new Set([
  "assigned",
  "worker-assigned",
  "on-the-way",
  "in-progress",
]);

export function isWorkerActiveJob(job) {
  return WORKER_ACTIVE_STATUSES.has(job?.status);
}

export function isWorkerAssignedJob(job) {
  return job?.status === "assigned" || job?.status === "worker-assigned";
}

export function canWorkerMarkDone(job) {
  return Boolean(
    job &&
      !job.claimPending &&
      job.status === "in-progress" &&
      !job.workerMarkedDone,
  );
}

export function sortWorkerJobs(jobs = []) {
  return [...jobs].sort((a, b) => {
    const aActive = isWorkerActiveJob(a);
    const bActive = isWorkerActiveJob(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
  });
}

export function getWorkerStatusLabel(status, t) {
  if (status === "assigned" || status === "worker-assigned") {
    return t?.("dashboard.assigned") || "Assigned";
  }
  if (status === "on-the-way") {
    return t?.("dashboard.onTheWay") || "On the way";
  }
  if (status === "in-progress") {
    return t?.("dashboard.inProgress") || "In progress";
  }
  if (status === "claim-pending") {
    return t?.("dashboard.claimPending") || "Claim pending";
  }
  if (status === "completed") {
    return t?.("dashboard.completed") || "Completed";
  }
  return t?.("dashboard.active") || "Active";
}
