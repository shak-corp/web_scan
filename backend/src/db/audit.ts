import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function appendAuditLog({
  eventType,
  userId,
  details,
  refId,
}: {
  eventType: string;
  userId?: number | null;
  details: string;
  refId?: number;
}) {
  return await prisma.auditLog.create({
    data: {
      eventType,
      userId: userId ?? null,
      details,
      refId: refId ?? null,
    },
  });
}

export async function getRecentAuditLogs(limit: number = 100) {
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
