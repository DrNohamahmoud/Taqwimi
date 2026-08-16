/**
 * Helper to dispatch user status & activity notification to backend -> email: Noha.mahmoud@cu.edu.eg
 */
export async function notifyUserActivity(
  userEmail: string,
  actionType: "login" | "session_start" | "question_generated" | "audit_performed" | "export_report",
  details?: string,
  metadata?: {
    loginCount?: number;
    questionCount?: number;
  }
) {
  if (!userEmail) return;

  try {
    const response = await fetch("/api/notify-user-activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail,
        actionType,
        details,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        },
      }),
    });

    if (!response.ok) {
      console.warn("Could not dispatch user activity notification to server");
    }
  } catch (error) {
    console.error("Failed to call /api/notify-user-activity:", error);
  }
}
