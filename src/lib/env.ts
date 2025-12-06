import { z } from "zod";

// Check if we're on the server
const isServer = typeof window === "undefined";

// Check if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Server-side only environment variables
const serverEnvSchema = z.object({
  // Database (server-only)
  POSTGRES_PRISMA_URL: z.string().min(1, "POSTGRES_PRISMA_URL is required"),

  // NextAuth (server-only) - required in production
  NEXTAUTH_URL: isProduction
    ? z.string().url("NEXTAUTH_URL is required in production")
    : z.string().url().optional(),
  NEXTAUTH_SECRET: isProduction
    ? z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters in production")
    : z.string().min(32).optional(),
});

// Shared environment variables (available on both client and server)
const sharedEnvSchema = z.object({
  // Platform fee rates (percentages, 0-100)
  GRAB_FOOD_FEE_RATE: z
    .string()
    .default("30")
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(100)),
  LINE_MAN_FEE_RATE: z
    .string()
    .default("30")
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(100)),

  // Application
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Optional: App metadata
  APP_VERSION: z.string().optional(),
});

// Combined schema for server-side
const fullEnvSchema = serverEnvSchema.merge(sharedEnvSchema);

export type Env = z.infer<typeof fullEnvSchema>;
export type SharedEnv = z.infer<typeof sharedEnvSchema>;

function validateEnv(): SharedEnv {
  // On client-side, only validate shared env vars
  if (!isServer) {
    const parsed = sharedEnvSchema.safeParse({
      GRAB_FOOD_FEE_RATE: process.env.NEXT_PUBLIC_GRAB_FOOD_FEE_RATE || "30",
      LINE_MAN_FEE_RATE: process.env.NEXT_PUBLIC_LINE_MAN_FEE_RATE || "30",
      NODE_ENV: process.env.NODE_ENV,
      APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    });

    if (!parsed.success) {
      console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
      // Don't throw on client - use defaults
      return {
        GRAB_FOOD_FEE_RATE: 30,
        LINE_MAN_FEE_RATE: 30,
        NODE_ENV: "development",
        APP_VERSION: undefined,
      };
    }
    return parsed.data;
  }

  // On server-side, validate all env vars
  const parsed = fullEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    throw new Error("Invalid environment configuration. Check the logs above.");
  }

  return parsed.data;
}

// Validate on import
export const env = validateEnv();

// Export individual values for convenience
export const GRAB_FOOD_FEE_RATE = env.GRAB_FOOD_FEE_RATE;
export const LINE_MAN_FEE_RATE = env.LINE_MAN_FEE_RATE;
export const NODE_ENV = env.NODE_ENV;
