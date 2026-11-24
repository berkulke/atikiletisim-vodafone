import cron, { type ScheduledTask } from "node-cron";
import { syncVodafoneCampaigns } from "./campaign-sync";

const globalForScheduler = globalThis as unknown as {
  campaignCronTask: ScheduledTask | undefined;
};

export function startCampaignSyncScheduler(): void {
  if (globalForScheduler.campaignCronTask) {
    return;
  }

  const expression = process.env.CAMPAIGN_SYNC_CRON || "0 */6 * * *";
  if (!cron.validate(expression)) {
    return;
  }

  globalForScheduler.campaignCronTask = cron.schedule(expression, async () => {
    try {
      await syncVodafoneCampaigns();
    } catch (error) {
      console.error("[CampaignScheduler] Sync failed:", error);
    }
  });
}
