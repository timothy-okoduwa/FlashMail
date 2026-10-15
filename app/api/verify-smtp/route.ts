import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface VerifySmtpRequest {
  smtpHost?: string;
  smtpPort?: number | string;
  smtpSecure?: boolean | "auto" | "ssl" | "starttls" | "none";
  smtpUser?: string;
  smtpPass?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifySmtpRequest = await req.json();
    const {
      smtpHost: hostInput,
      smtpPort: portInput,
      smtpSecure: secureInput = "auto",
      smtpUser: userInput,
      smtpPass: passInput,
    } = body;

    const smtpHost = hostInput?.trim() || process.env.SMTP_HOST?.trim();
    const smtpPort = Number(portInput) || Number(process.env.SMTP_PORT) || 587;
    const smtpUser = userInput?.trim() || process.env.SMTP_USER?.trim();
    const smtpPass = passInput?.trim() || process.env.SMTP_PASS?.trim();

    if (!smtpHost) {
      return NextResponse.json(
        { error: "SMTP Host is required (e.g. smtp.gmail.com, email-smtp.us-east-1.amazonaws.com)." },
        { status: 400 }
      );
    }

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: "SMTP Username and Password are required." },
        { status: 400 }
      );
    }

    // Determine SSL vs TLS (STARTTLS)
    let isSecure = false;
    let requireTls = false;

    if (secureInput === "ssl" || secureInput === true || smtpPort === 465) {
      isSecure = true;
    } else if (secureInput === "starttls" || smtpPort === 587) {
      isSecure = false;
      requireTls = true;
    } else if (secureInput === "none") {
      isSecure = false;
      requireTls = false;
    } else {
      // Auto
      isSecure = smtpPort === 465;
      requireTls = smtpPort === 587 || smtpPort === 2525;
    }

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
      connectionTimeout: 10000,
      greetingTimeout: 7000,
      socketTimeout: 12000,
    });

    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: `Verified! Successfully connected and authenticated to ${smtpHost}:${smtpPort} (${isSecure ? "SSL/TLS" : requireTls ? "STARTTLS" : "Plain/Opportunistic"}).`,
      details: {
        host: smtpHost,
        port: smtpPort,
        mode: isSecure ? "SSL (Port 465)" : requireTls ? "STARTTLS (Port 587/2525)" : "Standard",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "SMTP Connection/Auth Failed";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
