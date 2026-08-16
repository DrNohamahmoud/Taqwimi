import nodemailer from "nodemailer";

export interface UserNotificationPayload {
  userEmail: string;
  actionType: "login" | "session_start" | "question_generated" | "audit_performed" | "export_report";
  details?: string;
  metadata?: {
    loginCount?: number;
    questionCount?: number;
    userAgent?: string;
    ipAddress?: string;
    timestamp?: string;
  };
}

const TARGET_EMAIL = process.env.NOTIFICATION_RECIPIENT_EMAIL || "Noha.mahmoud@cu.edu.eg";

// In-memory log of recent user activity notifications
const recentActivityLogs: Array<{
  id: string;
  timestamp: string;
  userEmail: string;
  actionType: string;
  details: string;
  deliveryStatus: "delivered" | "simulated" | "pending";
}> = [];

export async function sendUserActivityNotification(payload: UserNotificationPayload) {
  const timestamp = new Date().toLocaleString("ar-EG", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const actionLabels: Record<string, string> = {
    login: "تسجيل دخول مستخدم جديد للمنصة 🔑",
    session_start: "بدء جلسة عمل جديدة 🚀",
    question_generated: "توليد بنود وأسئلة ذكية 📝",
    audit_performed: "إجراء تدقيق سيكومتري ولغوي ⚖️",
    export_report: "تصدير وثائق أو تقارير البنك 📄",
  };

  const actionTitle = actionLabels[payload.actionType] || "نشاط مستخدم على منصة تقويمي";

  const emailHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; direction: rtl; text-align: right; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6, #6366f1); color: #ffffff; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #dbeafe; }
        .content { padding: 24px; }
        .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
        .card { background: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; color: #475569; }
        .info-val { font-weight: 600; color: #0f172a; direction: ltr; }
        .footer { background: #0f172a; color: #94a3b8; text-align: center; padding: 16px; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>منظومة تقويمي (Taqwimi) 🎓</h1>
          <p>إشعار فوري بحالة ونشاط مستخدم جديد على المنصة</p>
        </div>
        <div class="content">
          <div class="badge">🔔 إشعار إداري أمني فوري</div>
          <h2 style="font-size: 17px; margin-top: 0; color: #1e293b;">تم رصد نشاط مستخدم جديد:</h2>
          
          <div class="card">
            <div class="info-row">
              <span class="info-label">📧 البريد الإلكتروني للمستخدم:</span>
              <span class="info-val">${payload.userEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">⚡ نوع الإجراء والنشاط:</span>
              <span style="font-weight: 700; color: #2563eb;">${actionTitle}</span>
            </div>
            <div class="info-row">
              <span class="info-label">⏰ توقيت الإجراء (توقيت القاهرة):</span>
              <span class="info-val" style="direction: rtl;">${timestamp}</span>
            </div>
            ${payload.metadata?.loginCount ? `
            <div class="info-row">
              <span class="info-label">🔢 إجمالي مرات الدخول للجلسة:</span>
              <span class="info-val">${payload.metadata.loginCount}</span>
            </div>` : ""}
            ${payload.details ? `
            <div class="info-row">
              <span class="info-label">📝 تفاصيل إضافية:</span>
              <span style="font-size: 12px; color: #334155;">${payload.details}</span>
            </div>` : ""}
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
            هذا الإشعار يتم إرساله تلقائياً إلى المشرفة الأكاديمية للمنصة <strong>أ.م.د/ نهى محمود أحمد</strong> على البريد (<code>${TARGET_EMAIL}</code>) لتوثيق وحصر كافة استخدامات وجلسات المنصة بدقة.
          </p>
        </div>
        <div class="footer">
          منصة تقويمي لتوليد وتدقيق وتحكيم بنود الاختبارات الأكاديمية © 2026<br>
          كلية الدراسات العليا للتربية - جامعة القاهرة
        </div>
      </div>
    </body>
    </html>
  `;

  let deliveryStatus: "delivered" | "simulated" | "pending" = "simulated";

  // Check if real SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"منصة تقويمي" <${smtpUser}>`,
        to: TARGET_EMAIL,
        subject: `[منصة تقويمي] إشعار حالة مستخدم: ${payload.userEmail} (${actionTitle})`,
        html: emailHtml,
      });
      deliveryStatus = "delivered";
      console.log(`[Notification] Real email sent to ${TARGET_EMAIL} for user ${payload.userEmail}`);
    } catch (smtpError) {
      console.error("[Notification] SMTP Send Error:", smtpError);
      deliveryStatus = "simulated";
    }
  } else {
    // In cloud environments without configured external SMTP secrets, we simulate and log securely
    console.log(`[Notification Log] Simulated notification to ${TARGET_EMAIL}: User [${payload.userEmail}] performed [${payload.actionType}] at ${timestamp}`);
  }

  // Store in recent in-memory log
  recentActivityLogs.unshift({
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp,
    userEmail: payload.userEmail,
    actionType: payload.actionType,
    details: payload.details || actionTitle,
    deliveryStatus,
  });

  // Keep max 50 recent logs
  if (recentActivityLogs.length > 50) {
    recentActivityLogs.pop();
  }

  return {
    success: true,
    recipient: TARGET_EMAIL,
    deliveryStatus,
    timestamp,
  };
}

export function getRecentNotifications() {
  return recentActivityLogs;
}
