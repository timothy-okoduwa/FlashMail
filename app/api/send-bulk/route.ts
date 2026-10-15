import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

interface SendBulkRequest {
  resendApiKey?: string;
  senderEmail?: string;
  senderName?: string;
  replyTo?: string;
  subject: string;
  htmlContent: string;
  recipients: string[];
  deliveryMode?: "resend-sdk" | "nodemailer" | "custom-smtp";
  // Universal Custom SMTP Settings:
  smtpHost?: string;
  smtpPort?: number | string;
  smtpSecure?: boolean | "auto" | "ssl" | "starttls" | "none";
  smtpUser?: string;
  smtpPass?: string;
}

interface DeliveryResult {
  email: string;
  status: "sent" | "failed";
  id?: string;
  error?: string;
}

// Helper to extract clean email address from string (e.g. "Name <email@domain.com>" -> "email@domain.com")
function extractEmailAddress(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const bracketMatch = trimmed.match(/<([^>]+)>/);
  const candidate = bracketMatch ? bracketMatch[1].trim() : trimmed;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(candidate) ? candidate.toLowerCase() : null;
}

// Convert HTML to clean plain text (Vital for spam score & deliverability)
function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&bull;/g, "•")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body: SendBulkRequest = await req.json();
    const {
      resendApiKey: customApiKey,
      senderEmail,
      senderName,
      replyTo,
      subject,
      htmlContent,
      recipients,
      deliveryMode = "resend-sdk",
      smtpHost: inputSmtpHost,
      smtpPort: inputSmtpPort,
      smtpSecure: inputSmtpSecure = "auto",
      smtpUser: inputSmtpUser,
      smtpPass: inputSmtpPass,
    } = body;

    const isCustomSmtp =
      deliveryMode === "custom-smtp" ||
      (deliveryMode === "nodemailer" && !!(inputSmtpHost || process.env.SMTP_HOST));

    const apiKey = customApiKey?.trim() || process.env.RESEND_API_KEY?.trim();

    // Validate engine credentials
    if (!isCustomSmtp) {
      if (!apiKey) {
        return NextResponse.json(
          {
            error: "Resend API Key is required. Please provide your API key in Settings or switch to Custom SMTP.",
          },
          { status: 400 }
        );
      }
    } else {
      const resolvedHost = inputSmtpHost?.trim() || process.env.SMTP_HOST?.trim();
      const resolvedUser = inputSmtpUser?.trim() || process.env.SMTP_USER?.trim();
      const resolvedPass = inputSmtpPass?.trim() || process.env.SMTP_PASS?.trim();

      if (!resolvedHost) {
        return NextResponse.json(
          { error: "SMTP Host is required for Custom SMTP sending (e.g. smtp.gmail.com, email-smtp.us-east-1.amazonaws.com)." },
          { status: 400 }
        );
      }
      if (!resolvedUser || !resolvedPass) {
        return NextResponse.json(
          { error: "SMTP Username and Password are required for Custom SMTP sending." },
          { status: 400 }
        );
      }
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject line is required." },
        { status: 400 }
      );
    }

    if (!htmlContent || !htmlContent.trim()) {
      return NextResponse.json(
        { error: "Email body/HTML content cannot be empty." },
        { status: 400 }
      );
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one recipient email address." },
        { status: 400 }
      );
    }

    // Clean, validate and deduplicate recipient list
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanRecipients = Array.from(
      new Set(
        recipients
          .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
          .filter((e) => emailRegex.test(e))
      )
    );

    if (cleanRecipients.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses found in the recipient list." },
        { status: 400 }
      );
    }

    // Validate browser-provided senderEmail and replyTo
    if (senderEmail && !extractEmailAddress(senderEmail)) {
      return NextResponse.json(
        { error: `Sender Email "${senderEmail}" is invalid. Please enter a full address with an "@" symbol (e.g. hello@yourdomain.com) in Settings.` },
        { status: 400 }
      );
    }

    if (replyTo && !extractEmailAddress(replyTo)) {
      return NextResponse.json(
        { error: `Reply-To Email "${replyTo}" is invalid. Please enter a valid address (e.g. name@gmail.com) in Settings.` },
        { status: 400 }
      );
    }

    // Extract & sanitize sender email address (100% from browser request)
    const defaultSender = isCustomSmtp
      ? (extractEmailAddress(inputSmtpUser) || "noreply@custom-smtp.com")
      : "onboarding@resend.dev";

    const parsedSender =
      extractEmailAddress(senderEmail) ||
      defaultSender;

    // Resend requires verified domains or onboarding@resend.dev (does not apply to custom SMTP)
    const isPublicWebmail = /@(gmail|yahoo|hotmail|outlook|icloud|aol)\.com$/i.test(parsedSender);
    
    let effectiveFromEmail = parsedSender;
    let effectiveReplyTo = extractEmailAddress(replyTo) || undefined;

    if (!isCustomSmtp && isPublicWebmail) {
      effectiveReplyTo = parsedSender;
      effectiveFromEmail = "onboarding@resend.dev";
    }

    const senderDomain = effectiveFromEmail.split("@")[1] || "domain.com";
    const cleanSenderName = (senderName?.trim() || "FlashMail")
      .replace(/[<>"']/g, "")
      .trim();

    // From header formatted cleanly according to RFC 5322
    const formattedFrom = `"${cleanSenderName}" <${effectiveFromEmail}>`;

    // Process HTML & sanitize unrendered template variables (e.g. {{unsubscribe_url}})
    const unsubscribeLink = `mailto:unsubscribe@${senderDomain}?subject=Unsubscribe`;
    const sanitizedHtml = htmlContent
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, unsubscribeLink)
      .replace(/href="#"/g, `href="${unsubscribeLink}"`);

    // Generate plain-text counterpart (Multi-part MIME prevents high SpamAssassin/Google spam scores)
    const plainTextContent = htmlToPlainText(sanitizedHtml);

    // Anti-Spam Headers (RFC compliant mailto unsubscribe)
    const antiSpamHeaders: Record<string, string> = {
      "List-Unsubscribe": `<${unsubscribeLink}>`,
    };

    console.log(`[FlashMail] Sending bulk dispatch: Mode=${isCustomSmtp ? "Custom-SMTP" : "Resend-SDK"} | Subject="${subject}" | From="${formattedFrom}" | Recipients=${cleanRecipients.length}`);

    const results: DeliveryResult[] = [];

    // ==========================================
    // Mode 1: Resend SDK (Batch API)
    // ==========================================
    if (!isCustomSmtp) {
      const resend = new Resend(apiKey);

      const CHUNK_SIZE = 100;
      for (let i = 0; i < cleanRecipients.length; i += CHUNK_SIZE) {
        const chunk = cleanRecipients.slice(i, i + CHUNK_SIZE);
        const batchPayload = chunk.map((toEmail) => ({
          from: formattedFrom,
          to: [toEmail],
          reply_to: effectiveReplyTo,
          subject: subject,
          html: sanitizedHtml,
          text: plainTextContent, // Multi-part plain text body
          headers: antiSpamHeaders,
        }));

        try {
          const { data, error } = await resend.batch.send(batchPayload);

          if (error) {
            console.error("Resend batch error:", error);
            chunk.forEach((email) => {
              results.push({
                email,
                status: "failed",
                error: error.message || "Failed to send batch via Resend SDK",
              });
            });
          } else if (data && data.data) {
            chunk.forEach((email, index) => {
              const resItem = data.data[index];
              if (resItem?.id) {
                results.push({
                  email,
                  status: "sent",
                  id: resItem.id,
                });
              } else {
                results.push({
                  email,
                  status: "failed",
                  error: "No delivery ID returned from Resend",
                });
              }
            });
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error in Resend batch";
          chunk.forEach((email) => {
            results.push({ email, status: "failed", error: message });
          });
        }

        if (i + CHUNK_SIZE < cleanRecipients.length) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    } 
    // ==========================================
    // Mode 2: Universal Custom SMTP (Nodemailer)
    // ==========================================
    else {
      const smtpHost = inputSmtpHost?.trim() || process.env.SMTP_HOST?.trim() || "smtp.resend.com";
      const smtpPort = Number(inputSmtpPort) || Number(process.env.SMTP_PORT) || 587;
      const smtpUser = inputSmtpUser?.trim() || process.env.SMTP_USER?.trim() || "resend";
      const smtpPass = inputSmtpPass?.trim() || process.env.SMTP_PASS?.trim() || apiKey || "";
      const secureSetting = inputSmtpSecure || process.env.SMTP_SECURE || "auto";

      // Calculate SSL vs STARTTLS based on port & settings
      let isSecure = false;
      let requireTls = false;

      if (secureSetting === "ssl" || secureSetting === true || smtpPort === 465) {
        isSecure = true;
      } else if (secureSetting === "starttls" || smtpPort === 587) {
        isSecure = false;
        requireTls = true;
      } else if (secureSetting === "none") {
        isSecure = false;
        requireTls = false;
      } else {
        // Auto: 465 is direct SSL; 587 and 2525 use STARTTLS; 25 is opportunistic
        isSecure = smtpPort === 465;
        requireTls = smtpPort === 587 || smtpPort === 2525;
      }

      console.log(`[FlashMail SMTP] Initializing transport: Host=${smtpHost}:${smtpPort} (Secure=${isSecure}, RequireTLS=${requireTls}, User=${smtpUser})`);

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        requireTLS: requireTls,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false, // Prevents certificate verification crashes on private relays
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });

      // Verify connection before dispatching batch
      try {
        await transporter.verify();
      } catch (smtpErr: unknown) {
        const msg = smtpErr instanceof Error ? smtpErr.message : "SMTP connection failed";
        return NextResponse.json(
          { error: `SMTP authentication or connection failed (${smtpHost}:${smtpPort}): ${msg}. Please check your host, port, username, password, and SSL/TLS settings.` },
          { status: 401 }
        );
      }

      // Send individually with explicit envelope & plain text multipart
      for (const email of cleanRecipients) {
        try {
          const info = await transporter.sendMail({
            from: formattedFrom,
            envelope: {
              from: effectiveFromEmail,
              to: email,
            },
            replyTo: effectiveReplyTo,
            to: email,
            subject: subject,
            html: sanitizedHtml,
            text: plainTextContent, // Multi-part plain text body
            headers: antiSpamHeaders,
          });

          results.push({
            email,
            status: "sent",
            id: info.messageId,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to send email via SMTP";
          results.push({
            email,
            status: "failed",
            error: msg,
          });
        }

        // Throttle pacing between SMTP sends (prevent rate limit drops on shared hosts)
        if (cleanRecipients.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      mode: isCustomSmtp ? "custom-smtp" : "resend-sdk",
      senderUsed: formattedFrom,
      replyToUsed: effectiveReplyTo,
      isWebmailFallback: !isCustomSmtp && isPublicWebmail,
      total: cleanRecipients.length,
      sentCount,
      failedCount,
      results,
    });
  } catch (error: unknown) {
    console.error("Bulk email route error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
