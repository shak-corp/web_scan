import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function recordConsent({
  userId,
  acceptedAt,
  statement,
  ip,
  notes,
}: {
  userId?: number | null;
  acceptedAt: string | Date;
  statement: string;
  ip?: string;
  notes?: string;
}) {
  return await prisma.consent.create({
    data: {
      userId: userId ?? null,
      acceptedAt: acceptedAt instanceof Date ? acceptedAt : new Date(acceptedAt),
      statement,
      ip: ip ?? null,
      notes: notes ?? null,
    },
  });
}

export async function getConsents({ userId }: { userId?: number } = {}) {
  return prisma.consent.findMany({
    where: userId ? { userId } : {},
    orderBy: { acceptedAt: "desc" },
  });
}
