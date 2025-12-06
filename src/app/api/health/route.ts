import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version?: string;
  checks: {
    database: {
      status: "healthy" | "unhealthy";
      latencyMs?: number;
      error?: string;
    };
    environment: {
      status: "healthy" | "unhealthy";
      nodeEnv: string;
    };
  };
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  // Database health check
  let dbStatus: HealthStatus["checks"]["database"];
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    dbStatus = { status: "healthy", latencyMs: dbLatency };
  } catch (error) {
    dbStatus = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }

  // Environment check
  const envStatus: HealthStatus["checks"]["environment"] = {
    status: "healthy",
    nodeEnv: process.env.NODE_ENV || "development",
  };

  // Overall status
  const isHealthy = dbStatus.status === "healthy";

  const response: HealthStatus = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    checks: {
      database: dbStatus,
      environment: envStatus,
    },
  };

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
  });
}
