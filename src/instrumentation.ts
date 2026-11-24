export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCampaignSyncScheduler } = await import("@/lib/sync/scheduler");
    startCampaignSyncScheduler();
  }
}
