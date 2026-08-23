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

function translateOrFallback(t, key, fallback) {
  const value = t?.(key);
  return value && value !== key ? value : fallback;
}

export function getWorkerStatusLabel(status, t) {
  if (status === "assigned" || status === "worker-assigned") {
    return translateOrFallback(t, "dashboard.assigned", "Assigned");
  }
  if (status === "on-the-way") {
    return translateOrFallback(t, "dashboard.onTheWay", "On the way");
  }
  if (status === "in-progress") {
    return translateOrFallback(t, "dashboard.inProgress", "In progress");
  }
  if (status === "claim-pending") {
    return translateOrFallback(t, "dashboard.claimPending", "Claim pending");
  }
  if (status === "completed") {
    return translateOrFallback(t, "dashboard.completed", "Completed");
  }
  return translateOrFallback(t, "dashboard.active", "Active");
}
