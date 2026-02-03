import { neon } from "@neondatabase/serverless";

// Initialize Neon SQL client with connection string
// DATABASE_URL must be set in Vercel environment variables
const connectionString = process.env.DATABASE_URL;

// Export SQL client - will throw error if DATABASE_URL is not set
export const sql = connectionString ? neon(connectionString) : null;

// Helper to check if database is connected
export function isDatabaseConnected(): boolean {
  return sql !== null;
}

// Log connection status on server startup
if (typeof window === "undefined") {
  if (isDatabaseConnected()) {
    console.log("[SmartDash] Database connection configured successfully");
  } else {
    console.log("[SmartDash] DATABASE_URL not configured - using mock data");
    console.log(
      "[SmartDash] Add your Neon connection string in Vercel Dashboard > Settings > Environment Variables",
    );
  }
}
