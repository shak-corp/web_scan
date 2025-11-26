import PgBoss from "pg-boss";
import { runNmapScan } from "../scanners/nmap";
import { crawlSite } from "../crawler/crawler";
import { appendAuditLog } from "../db/audit";
import { PrismaClient } from "@prisma/client";
import { io } from "../realtime/socket";
const prisma = new PrismaClient();

const boss = new PgBoss(process.env.DATABASE_URL!);

export async function startWorkers() {
  await boss.start();

  boss.work("scan:nmap", { teamSize: 2, retryLimit: 3 }, async job => {
    const { userId, targets, options } = job.data;
    const jobId = job.id;
    await appendAuditLog({
      eventType: "scan_requested",
      userId, details: `Nmap scan for ${targets.join(", ")}. Options: ${options.join(" ")}`, refId: jobId,
    });
    io.to(`user-${userId}`).emit("log", { jobId, msg: `Starting Nmap scan job` });
    try {
      const result = await runNmapScan(targets, options);
      await prisma.scanJob.update({ where: { id: Number(jobId) }, data: { status: "done", result } });
      io.to(`user-${userId}`).emit("log", { jobId, msg: `Nmap scan complete` });
      await appendAuditLog({ eventType: "scan_complete", userId, details: `Scan done: ${jobId}`, refId: jobId });
      return PgBoss.complete(job.id);
    } catch (err: any) {
      io.to(`user-${userId}`).emit("log", { jobId, msg: `Nmap scan error: ${String(err)}` });
      await appendAuditLog({ eventType: "scan_error", userId, details: `Nmap error: ${String(err)}`, refId: jobId });
      throw err;
    }
  });

  boss.work("crawl:site", { teamSize: 2 }, async job => {
    const { userId, config } = job.data;
    const jobId = job.id;
    io.to(`user-${userId}`).emit("log", { jobId, msg: `Starting crawl job: ${config.startUrl}` });
    try {
      await crawlSite(config, async onPage => {
        await prisma.crawlTask.update({
          where: { id: Number(jobId) },
          data: { result: onPage },
        });
        io.to(`user-${userId}`).emit("log", { jobId, msg: `Crawled: ${onPage.url}` });
      });
      await prisma.crawlTask.update({ where: { id: Number(jobId) }, data: { finishedAt: new Date() } });
      io.to(`user-${userId}`).emit("log", { jobId, msg: `Crawl job complete` });
      return PgBoss.complete(job.id);
    } catch (err: any) {
      io.to(`user-${userId}`).emit("log", { jobId, msg: `Crawl job error: ${String(err)}` });
      throw err;
    }
  });
}
