"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Mail,
  Send,
  Code,
  Eye,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Download,
  AlertCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  Upload,
  FileText,
  Trash2,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  Palette,
  ChevronRight,
  ShieldCheck,
  Zap,
  Server,
  Lock,
  EyeOff,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DEFAULT_TEMPLATES, EmailTemplate } from "@/lib/templates";

interface DeliveryResult {
  email: string;
  status: "sent" | "failed";
  id?: string;
  error?: string;
}

export default function BulkEmailStudio() {
  // Settings & Credentials state (saved in localStorage for no-sign-up friction)
  const [resendApiKey, setResendApiKey] = useState("");
  const [senderEmail, setSenderEmail] = useState("hello@oilsecbeninternationalshop.top");
  const [senderName, setSenderName] = useState("Oilsec Ben International");
  const [replyToEmail, setReplyToEmail] = useState("oilsecbeninternationalshop@smvmail.com");
  const [deliveryMode, setDeliveryMode] = useState<"resend-sdk" | "custom-smtp">("resend-sdk");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Universal Custom SMTP State (All Ports: 465, 587, 25, 2525; SSL & TLS)
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState<"auto" | "ssl" | "starttls" | "none">("auto");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Email Content State
  const [subject, setSubject] = useState(DEFAULT_TEMPLATES[0].defaultSubject);
  const [htmlContent, setHtmlContent] = useState(DEFAULT_TEMPLATES[0].html);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);

  // Recipients State
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [parsedRecipients, setParsedRecipients] = useState<string[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Studio UI state
  const [activeTab, setActiveTab] = useState<"editor" | "presets">("editor");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState<DeliveryResult[]>([]);
  const [sendSummary, setSendSummary] = useState<{ total: number; sent: number; failed: number } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Test Email Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Real-time Deliverability & Spam Filter Score Inspector
  const deliverabilityReport = useMemo(() => {
    const issues: { text: string; severity: "high" | "medium" | "low" }[] = [];
    let score = 100;

    // 1. Check subject line for promotional/spam triggers
    if (/🚀|🔥|💰|💸|🤑|⚡/.test(subject)) {
      issues.push({ text: "Promotional emojis (🚀, 🔥, ⚡) in subject line trigger Gmail's Spam filter.", severity: "high" });
      score -= 20;
    }
    if (/\b(double your|make money|guaranteed|risk-free|100% free|urgent|act now|special offer)\b/i.test(subject)) {
      issues.push({ text: "Subject line contains high-risk marketing buzzwords.", severity: "high" });
      score -= 25;
    }
    if (subject.length > 5 && subject === subject.toUpperCase() && /[A-Z]/.test(subject)) {
      issues.push({ text: "Subject is in ALL CAPS.", severity: "medium" });
      score -= 15;
    }

    // 2. Check HTML body for spam triggers
    if (/\[(Add your|client's|your name|company name|date & time|your compelling)\]/i.test(htmlContent)) {
      issues.push({ text: "Unfilled template brackets (e.g. [client's name]) detected.", severity: "high" });
      score -= 25;
    }
    if (/example\.com/i.test(htmlContent)) {
      issues.push({ text: "Placeholder domain 'example.com' found. Replace with your real domain.", severity: "high" });
      score -= 20;
    }
    if (/href="#"/i.test(htmlContent)) {
      issues.push({ text: "Dead link href='#' found. Empty links trigger phishing checks.", severity: "medium" });
      score -= 10;
    }

    if (/href=["']https?:\/\/oilsecbeninternationalshop\.top["']/i.test(htmlContent)) {
      issues.push({ text: "Link to 'oilsecbeninternationalshop.top' found. This domain has no DNS A-record (NXDOMAIN), causing Gmail security crawlers to flag it as spam. Use mailto: or add an A-record.", severity: "high" });
      score -= 30;
    }

    return {
      score: Math.max(score, 15),
      issues,
      status: score >= 90 ? "Excellent (Inbox Ready)" : score >= 75 ? "Moderate Risk" : "High Spam Risk",
    };
  }, [subject, htmlContent]);

  // One-click Auto-Clean Spam Triggers
  const handleAutoCleanSpamTriggers = () => {
    // Clean subject
    setSubject((prev) =>
      prev
        .replace(/🚀|🔥|💰|💸|🤑|⚡/g, "")
        .replace(/\b(double your productivity today|make money|act now)\b/gi, "important update and details")
        .trim()
    );

    // Clean body
    setHtmlContent((prev) =>
      prev
        .replace(/https?:\/\/example\.com/g, "mailto:hello@oilsecbeninternationalshop.top")
        .replace(/https?:\/\/oilsecbeninternationalshop\.top/g, "mailto:hello@oilsecbeninternationalshop.top")
        .replace(/href="#"/g, 'href="mailto:hello@oilsecbeninternationalshop.top"')
        .replace(/\[Add your value proposition here\]/g, "Accelerate Your Operations")
        .replace(/\[client's name\]/g, "Timothy")
        .replace(/\[your name\]/g, "Timothy Lee")
        .replace(/\[company name\]/g, "Oilsec Ben International")
    );
  };

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    try {
      const savedResendKey = localStorage.getItem("flashmail_resend_api_key");
      const savedSender = localStorage.getItem("flashmail_sender_email");
      const savedSenderName = localStorage.getItem("flashmail_sender_name");
      const savedReplyTo = localStorage.getItem("flashmail_reply_to_email");
      const savedMode = localStorage.getItem("flashmail_delivery_mode") as "resend-sdk" | "custom-smtp" | "nodemailer";
      const savedSmtpHost = localStorage.getItem("flashmail_smtp_host");
      const savedSmtpPort = localStorage.getItem("flashmail_smtp_port");
      const savedSmtpSecure = localStorage.getItem("flashmail_smtp_secure") as "auto" | "ssl" | "starttls" | "none";
      const savedSmtpUser = localStorage.getItem("flashmail_smtp_user");
      const savedSmtpPass = localStorage.getItem("flashmail_smtp_pass");

      if (savedResendKey) setResendApiKey(savedResendKey);
      if (savedSender) setSenderEmail(savedSender);
      if (savedSenderName) setSenderName(savedSenderName);
      if (savedReplyTo) setReplyToEmail(savedReplyTo);
      if (savedMode) setDeliveryMode(savedMode === "nodemailer" ? "custom-smtp" : savedMode);
      if (savedSmtpHost) setSmtpHost(savedSmtpHost);
      if (savedSmtpPort) setSmtpPort(savedSmtpPort);
      if (savedSmtpSecure) setSmtpSecure(savedSmtpSecure);
      if (savedSmtpUser) setSmtpUser(savedSmtpUser);
      if (savedSmtpPass) setSmtpPass(savedSmtpPass);
    } catch {
      // Ignore local storage errors
    }
  }, []);

  // Save settings helper
  const handleSaveSettings = () => {
    try {
      localStorage.setItem("flashmail_resend_api_key", resendApiKey);
      localStorage.setItem("flashmail_sender_email", senderEmail);
      localStorage.setItem("flashmail_sender_name", senderName);
      localStorage.setItem("flashmail_reply_to_email", replyToEmail);
      localStorage.setItem("flashmail_delivery_mode", deliveryMode);
      localStorage.setItem("flashmail_smtp_host", smtpHost);
      localStorage.setItem("flashmail_smtp_port", smtpPort);
      localStorage.setItem("flashmail_smtp_secure", smtpSecure);
      localStorage.setItem("flashmail_smtp_user", smtpUser);
      localStorage.setItem("flashmail_smtp_pass", smtpPass);
    } catch {
      // Ignore
    }
    setShowSettingsModal(false);
  };

  // Test SMTP Connection helper
  const handleTestSmtpConnection = async () => {
    if (!smtpHost.trim()) {
      setSmtpTestResult({ success: false, message: "Please enter an SMTP Host." });
      return;
    }
    if (!smtpUser.trim() || !smtpPass.trim()) {
      setSmtpTestResult({ success: false, message: "Please enter your SMTP Username and Password." });
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await fetch("/api/verify-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpSecure,
          smtpUser,
          smtpPass,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSmtpTestResult({ success: false, message: data.error || "SMTP connection failed." });
      } else {
        setSmtpTestResult({ success: true, message: data.message || "Connected successfully!" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error testing SMTP.";
      setSmtpTestResult({ success: false, message: msg });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Recipient parsing logic (supports commas, newlines, spaces, semicolons)
  useEffect(() => {
    if (!recipientsRaw.trim()) {
      setParsedRecipients([]);
      setDuplicateCount(0);
      return;
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = recipientsRaw.match(emailRegex) || [];
    const normalized = matches.map((e) => e.trim().toLowerCase());
    const unique = Array.from(new Set(normalized));

    setDuplicateCount(normalized.length - unique.length);
    setParsedRecipients(unique);
  }, [recipientsRaw]);

  // Handle template selection
  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplateId(template.id);
    setHtmlContent(template.html);
    setSubject(template.defaultSubject);
    setActiveTab("editor");
  };

  // Quick insert snippets for HTML editor
  const handleInsertSnippet = (snippet: string) => {
    setHtmlContent((prev) => prev + "\n" + snippet);
  };

  // Copy HTML to clipboard
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Download HTML file
  const handleDownloadHtml = () => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject.toLowerCase().replace(/[^a-z0-9]/g, "-") || "email-template"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // File drop / upload for CSV/TXT recipient lists
  const handleRecipientsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRecipientsRaw((prev) => (prev ? prev + "\n" + content : content));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Send Single Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      setTestResult("Please enter a valid email address.");
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resendApiKey: resendApiKey || undefined,
          senderEmail: senderEmail,
          senderName: senderName,
          replyTo: replyToEmail || undefined,
          subject: subject,
          htmlContent: htmlContent,
          recipients: [testEmailAddress],
          deliveryMode: deliveryMode,
          smtpHost: smtpHost || undefined,
          smtpPort: smtpPort || undefined,
          smtpSecure: smtpSecure || undefined,
          smtpUser: smtpUser || undefined,
          smtpPass: smtpPass || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send test email.");
      }

      setTestResult(`Success! Test email sent to ${testEmailAddress}`);
      setTimeout(() => setShowTestModal(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to deliver test email.";
      setTestResult(`Error: ${msg}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Send Bulk Emails
  const handleSendBulk = async () => {
    setShowConfirmModal(false);
    setIsSending(true);
    setErrorMessage(null);
    setSendProgress(10);
    setSendResults([]);
    setSendSummary(null);

    try {
      const res = await fetch("/api/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resendApiKey: resendApiKey || undefined,
          senderEmail: senderEmail,
          senderName: senderName,
          replyTo: replyToEmail || undefined,
          subject: subject,
          htmlContent: htmlContent,
          recipients: parsedRecipients,
          deliveryMode: deliveryMode,
          smtpHost: smtpHost || undefined,
          smtpPort: smtpPort || undefined,
          smtpSecure: smtpSecure || undefined,
          smtpUser: smtpUser || undefined,
          smtpPass: smtpPass || undefined,
        }),
      });

      setSendProgress(90);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send bulk emails.");
      }

      setSendResults(data.results || []);
      setSendSummary({
        total: data.total || parsedRecipients.length,
        sent: data.sentCount || 0,
        failed: data.failedCount || 0,
      });
      setSendProgress(100);

      if (data.sentCount > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to deliver bulk emails.";
      setErrorMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0d1424]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">FlashMail</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  100+ Bulk Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Zero sign-up &bull; Resend SDK & Nodemailer &bull; Live Preview & Deliverability Shield
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Status Tag */}
            <div
              onClick={() => setShowSettingsModal(true)}
              className="cursor-pointer hidden md:flex items-center px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition"
              title="Click to configure sending engine & credentials"
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  deliveryMode === "custom-smtp"
                    ? smtpHost && smtpUser
                      ? "bg-emerald-400 ring-2 ring-emerald-400/20"
                      : "bg-amber-400 animate-pulse"
                    : resendApiKey
                    ? "bg-emerald-400 ring-2 ring-emerald-400/20"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              {deliveryMode === "custom-smtp"
                ? smtpHost
                  ? `SMTP: ${smtpHost}:${smtpPort || 587}`
                  : "Custom SMTP (Setup Required)"
                : resendApiKey
                ? "Resend Key Active"
                : "No Key Set (Using Env)"}
            </div>

            {/* Test Send Button */}
            <button
              onClick={() => setShowTestModal(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span>Send Test</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
              title="Configure API Keys & Sender Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls, Recipients & Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Section 1: Recipients Management */}
          <div className="bg-[#11192b] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-sm text-slate-100">Recipients (Up to 100+)</h2>
              </div>

              <div className="flex items-center space-x-2">
                <label className="cursor-pointer text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800/50 px-2.5 py-1 rounded-md transition-all flex items-center space-x-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload CSV / TXT</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleRecipientsFileUpload}
                    className="hidden"
                  />
                </label>
                {recipientsRaw && (
                  <button
                    onClick={() => setRecipientsRaw("")}
                    className="text-xs text-rose-400 hover:text-rose-300 p-1"
                    title="Clear recipients"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={recipientsRaw}
              onChange={(e) => setRecipientsRaw(e.target.value)}
              placeholder="Paste email addresses separated by commas, newlines, or spaces...&#10;e.g.:&#10;sarah.connor@example.com, john.doe@acme.com&#10;alex@startup.io&#10;hello@company.org"
              rows={3}
              className="w-full bg-[#090d18] border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y"
            />

            {/* Recipient Stats Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-medium">
                  {parsedRecipients.length} Valid Recipients
                </span>
                {duplicateCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full">
                    {duplicateCount} Duplicates Skipped
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setRecipientsRaw(
                    "founder@startup.io, jane.smith@techcorp.com, partner@venture.vc, ceo@growthbrand.co, client@solution.org"
                  );
                }}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Insert 5 Sample Emails
              </button>
            </div>
          </div>

          {/* Section 2: Subject & Sender Bar */}
          <div className="bg-[#11192b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter an engaging email subject..."
                className="w-full bg-[#090d18] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#090d18] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Sending From</span>
                  <span className="font-mono text-slate-200 truncate max-w-[200px] block">
                    {senderName ? `${senderName} <${senderEmail}>` : senderEmail}
                  </span>
                </div>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold"
                >
                  Edit
                </button>
              </div>

              <div className="bg-[#090d18] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Delivery Mode</span>
                  <span className="font-semibold text-slate-200">
                    {deliveryMode === "resend-sdk" ? "Resend Batch SDK" : "Nodemailer SMTP"}
                  </span>
                </div>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold"
                >
                  Switch
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Deliverability Health Inspector */}
          <div
            className={`border rounded-2xl p-4 transition-all shadow-lg ${
              deliverabilityReport.score >= 90
                ? "bg-emerald-950/20 border-emerald-500/30"
                : deliverabilityReport.score >= 75
                ? "bg-amber-950/20 border-amber-500/40"
                : "bg-rose-950/20 border-rose-500/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck
                  className={`w-4 h-4 ${
                    deliverabilityReport.score >= 90
                      ? "text-emerald-400"
                      : deliverabilityReport.score >= 75
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                />
                <span className="text-xs font-bold text-slate-200">
                  Inbox Deliverability Score:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    deliverabilityReport.score >= 90
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : deliverabilityReport.score >= 75
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {deliverabilityReport.score}/100 &bull; {deliverabilityReport.status}
                </span>
              </div>

              {deliverabilityReport.issues.length > 0 && (
                <button
                  onClick={handleAutoCleanSpamTriggers}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg shadow transition flex items-center space-x-1"
                >
                  <span>⚡ Auto-Clean Triggers</span>
                </button>
              )}
            </div>

            {deliverabilityReport.issues.length > 0 ? (
              <div className="space-y-1 mt-2 text-[11px]">
                {deliverabilityReport.issues.map((iss, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 text-slate-300">
                    <span className="text-amber-400 shrink-0 font-bold">•</span>
                    <span>{iss.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-emerald-300/80">
                ✓ No promotional triggers, empty links, or placeholder brackets found. Optimized for Primary Inbox delivery.
              </p>
            )}
          </div>

          {/* Section 3: Template Studio Tabs */}
          <div className="bg-[#11192b] border border-slate-800 rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
            {/* Tabs Header */}
            <div className="border-b border-slate-800 bg-[#0c1220] px-4 pt-3 flex items-center justify-between">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === "editor"
                      ? "bg-[#11192b] text-indigo-400 border-t border-x border-slate-700/80 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>HTML Editor</span>
                </button>

                <button
                  onClick={() => setActiveTab("presets")}
                  className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === "presets"
                      ? "bg-[#11192b] text-indigo-400 border-t border-x border-slate-700/80 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Preset Templates (3)</span>
                </button>
              </div>

              <div className="flex items-center space-x-1.5 pb-2">
                <button
                  onClick={handleCopyHtml}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title="Copy Raw HTML"
                >
                  {copiedHtml ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title="Download .html file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab 1: HTML Code Editor */}
            {activeTab === "editor" && (
              <div className="p-4 flex-1 flex flex-col space-y-3">
                {/* Editor Quick Snippet Bar */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500 mr-1">Insert Element:</span>
                  <button
                    onClick={() =>
                      handleInsertSnippet(
                        `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 24px auto;"><tr><td align="center" bgcolor="#008779" style="border-radius: 8px;"><a href="mailto:hello@oilsecbeninternationalshop.top?subject=Inquiry" style="display: inline-block; background-color: #008779; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-family: sans-serif;">Click Here &rarr;</a></td></tr></table>`
                      )
                    }
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  >
                    + Table Button
                  </button>
                  <button
                    onClick={() =>
                      handleInsertSnippet(
                        `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0;"><tr><td style="padding: 20px;"><p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; font-family: sans-serif;">Highlight box or callout text goes inside this table cell.</p></td></tr></table>`
                      )
                    }
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  >
                    + Table Box (Card)
                  </button>
                  <button
                    onClick={() =>
                      handleInsertSnippet(
                        `<h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 16px 0 8px 0; font-family: sans-serif;">New Headline</h2>`
                      )
                    }
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  >
                    + Heading
                  </button>
                  <button
                    onClick={() =>
                      handleInsertSnippet(
                        `<p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; font-family: sans-serif;">Your custom paragraph text goes here.</p>`
                      )
                    }
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  >
                    + Paragraph
                  </button>
                  <button
                    onClick={() =>
                      handleInsertSnippet(
                        `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;"><tr><td style="border-top: 1px solid #e5e7eb; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr></table>`
                      )
                    }
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  >
                    + Table Divider
                  </button>
                  <button
                    onClick={() =>
                      handleInsertSnippet(
                        `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;"><tr><td align="center" style="font-size: 12px; color: #9ca3af; font-family: sans-serif;"><a href="mailto:unsubscribe@oilsecbeninternationalshop.top?subject=Unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &bull; <span style="color: #6b7280; margin-left: 6px;">Confidential Communication</span></td></tr></table>`
                      )
                    }
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  >
                    + Table Footer
                  </button>
                </div>

                <div className="relative flex-1 min-h-[360px]">
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full h-full min-h-[360px] bg-[#090d18] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-y"
                    placeholder="Paste or write your full HTML email code here..."
                    spellCheck={false}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Standard inline-styled HTML for Gmail, Apple Mail & Outlook</span>
                  <span>{htmlContent.length} characters</span>
                </div>
              </div>
            )}

            {/* Tab 2: Presets Selector */}
            {activeTab === "presets" && (
              <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="text-xs text-slate-400 mb-1">
                  Choose from 3 professionally designed templates ready to customize and send right away:
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {DEFAULT_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between ${
                        selectedTemplateId === tmpl.id
                          ? "bg-indigo-950/30 border-indigo-500/80 ring-1 ring-indigo-500/40"
                          : "bg-[#090d18] border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-slate-100">
                            {tmpl.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {tmpl.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 max-w-md">
                          {tmpl.description}
                        </p>
                        <p className="text-[11px] text-indigo-400 font-mono mt-1">
                          Default Subject: &ldquo;{tmpl.defaultSubject}&rdquo;
                        </p>
                      </div>

                      <div className="p-2 text-indigo-400 shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Big Send Action Button */}
          <div className="pt-2">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isSending || parsedRecipients.length === 0}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-40 text-white font-bold text-sm tracking-wide rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Blasting Bulk Emails in Progress...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>
                    Send Bulk Email to {parsedRecipients.length} Recipient
                    {parsedRecipients.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview & Logs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Live Preview Card */}
          <div className="bg-[#11192b] border border-slate-800 rounded-2xl shadow-xl flex flex-col h-full min-h-[580px] overflow-hidden">
            {/* Preview Toolbar */}
            <div className="border-b border-slate-800 bg-[#0c1220] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-xs text-slate-200">
                  Live Email Result
                </span>
              </div>

              {/* Viewport switch: Desktop / Mobile */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-2 py-1 rounded text-xs transition flex items-center space-x-1 ${
                    previewDevice === "desktop"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Desktop Preview (600px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-2 py-1 rounded text-xs transition flex items-center space-x-1 ${
                    previewDevice === "mobile"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Email Canvas Viewport */}
            <div className="flex-1 bg-[#070b14] p-4 flex items-center justify-center overflow-auto">
              <div
                className={`transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-white ${
                  previewDevice === "desktop"
                    ? "w-full max-w-[620px] h-[550px]"
                    : "w-[360px] h-[550px] border-4 border-slate-700"
                }`}
              >
                <iframe
                  title="Live Email Preview"
                  srcDoc={htmlContent}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>

          {/* Delivery Logs & Summary Panel */}
          {(isSending || sendSummary || errorMessage) && (
            <div className="bg-[#11192b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Delivery Report
                </span>
                {isSending && (
                  <span className="text-[11px] text-indigo-400 flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Processing batches...</span>
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sendProgress}%` }}
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {sendSummary && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                    <div className="text-slate-400 text-[10px]">Total</div>
                    <div className="text-sm font-bold text-slate-100">{sendSummary.total}</div>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg">
                    <div className="text-emerald-400 text-[10px]">Sent</div>
                    <div className="text-sm font-bold text-emerald-300">{sendSummary.sent}</div>
                  </div>
                  <div className="bg-rose-950/40 border border-rose-800/40 p-2 rounded-lg">
                    <div className="text-rose-400 text-[10px]">Failed</div>
                    <div className="text-sm font-bold text-rose-300">{sendSummary.failed}</div>
                  </div>
                </div>
              )}

              {/* Detailed logs */}
              {sendResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs pr-1 font-mono">
                  {sendResults.map((r, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        r.status === "sent"
                          ? "bg-emerald-950/20 border-emerald-800/30 text-emerald-300"
                          : "bg-rose-950/20 border-rose-800/30 text-rose-300"
                      }`}
                    >
                      <div className="truncate max-w-[240px] flex items-center space-x-1.5">
                        {r.status === "sent" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        )}
                        <span>{r.email}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {r.status === "sent" ? "Delivered" : r.error || "Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Ready to send bulk email?</h3>
                <p className="text-xs text-slate-400">Please review delivery details below</p>
              </div>
            </div>

            <div className="bg-[#090d18] border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Recipients:</span>
                <span className="font-bold text-slate-100">{parsedRecipients.length} addresses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="font-medium text-slate-200 truncate max-w-[200px]">{subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">From Address:</span>
                <span className="font-mono text-slate-200">{senderEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mode:</span>
                <span className="font-semibold text-indigo-400">
                  {deliveryMode === "resend-sdk" ? "Resend Batch SDK" : "Nodemailer (Resend SMTP)"}
                </span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBulk}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Confirm & Launch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Send Quick Test</h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Send a single copy of this email to your inbox to inspect how it renders on your device before blasting to 100+ users.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#090d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  testResult.startsWith("Success")
                    ? "bg-emerald-950/50 border border-emerald-800 text-emerald-300"
                    : "bg-rose-950/50 border border-rose-800 text-rose-300"
                }`}
              >
                {testResult}
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowTestModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Close
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTest || !testEmailAddress}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Test Email</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (API Keys & Universal Custom SMTP Settings) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Engine &amp; Delivery Settings</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-[10px] text-cyan-400 font-medium bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  100% In-Browser &bull; Zero .env Required
                </span>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Delivery Engine Selector */}
              <div>
                <label className="font-semibold text-slate-200 block mb-1.5">
                  Choose Sending Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => {
                      setDeliveryMode("resend-sdk");
                      setSmtpTestResult(null);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      deliveryMode === "resend-sdk"
                        ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                        : "bg-[#090d18] border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Resend Batch SDK</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Fires up to 100 emails/request via Resend API key.
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setDeliveryMode("custom-smtp");
                      setSmtpTestResult(null);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      deliveryMode === "custom-smtp"
                        ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                        : "bg-[#090d18] border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1.5">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Universal SMTP</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Works with ANY host, all ports (465 SSL, 587 TLS, 25, 2525).
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode A: Resend API Key */}
              {deliveryMode === "resend-sdk" && (
                <div className="p-3.5 bg-[#090d18] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-200 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Resend API Key</span>
                    </label>
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Get API Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxx"
                    className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Saved in your browser local storage. Never stored in an external database.
                  </p>
                </div>
              )}

              {/* Mode B: Universal Custom SMTP Settings */}
              {deliveryMode === "custom-smtp" && (
                <div className="p-4 bg-[#090d18] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SMTP Server Configuration</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      SSL &bull; TLS &bull; STARTTLS
                    </span>
                  </div>

                  {/* Quick autofill presets */}
                  <div>
                    <span className="text-[10px] text-slate-400 mr-1.5">Quick Presets:</span>
                    <div className="inline-flex flex-wrap gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpHost("smtp.gmail.com");
                          setSmtpPort("587");
                          setSmtpSecure("starttls");
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition"
                      >
                        Gmail (587)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpHost("email-smtp.us-east-2.amazonaws.com");
                          setSmtpPort("587");
                          setSmtpSecure("starttls");
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition"
                      >
                        AWS SES (587)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpHost("smtp.sendgrid.net");
                          setSmtpPort("587");
                          setSmtpSecure("starttls");
                          if (!smtpUser) setSmtpUser("apikey");
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition"
                      >
                        SendGrid (587)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpHost("smtp.resend.com");
                          setSmtpPort("465");
                          setSmtpSecure("ssl");
                          if (!smtpUser) setSmtpUser("resend");
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition"
                      >
                        Resend SMTP (465)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpPort("465");
                          setSmtpSecure("ssl");
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition"
                      >
                        Port 465 (SSL)
                      </button>
                    </div>
                  </div>

                  {/* Host, Port & Security */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-6">
                      <label className="font-medium text-slate-300 block mb-1">
                        SMTP Host / Server
                      </label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="e.g. smtp.gmail.com or mail.yourdomain.com"
                        className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-medium text-slate-300 block mb-1">
                        Port
                      </label>
                      <input
                        type="text"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="587, 465, 25"
                        className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-medium text-slate-300 block mb-1">
                        Encryption
                      </label>
                      <select
                        value={smtpSecure}
                        onChange={(e) => setSmtpSecure(e.target.value as "auto" | "ssl" | "starttls" | "none")}
                        className="w-full bg-[#111827] border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                      >
                        <option value="auto">Auto Detect</option>
                        <option value="ssl">SSL / TLS (465)</option>
                        <option value="starttls">STARTTLS (587)</option>
                        <option value="none">Plain (25/2525)</option>
                      </select>
                    </div>
                  </div>

                  {/* Username & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-medium text-slate-300 block mb-1">
                        SMTP Username / Email
                      </label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="user@domain.com or IAM User"
                        className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-slate-300">
                          SMTP Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                        >
                          {showSmtpPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showSmtpPass ? "Hide" : "Show"}</span>
                        </button>
                      </div>
                      <input
                        type={showSmtpPass ? "text" : "password"}
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        placeholder="Password or App Password"
                        className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Test Connection Button & Status */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleTestSmtpConnection}
                      disabled={isTestingSmtp}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs flex items-center space-x-1.5 transition"
                    >
                      {isTestingSmtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing SMTP Handshake...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Test SMTP Connection</span>
                        </>
                      )}
                    </button>

                    <span className="text-[10px] text-slate-400">
                      Verifies DNS, socket handshake, and login
                    </span>
                  </div>

                  {/* SMTP Test Feedback Banner */}
                  {smtpTestResult && (
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2 ${
                        smtpTestResult.success
                          ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                          : "bg-rose-950/40 border-rose-500/50 text-rose-300"
                      }`}
                    >
                      {smtpTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-snug">{smtpTestResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Sender Details */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-medium text-slate-200 block mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Acme Growth"
                    className="w-full bg-[#090d18] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-200 block mb-1">
                    Sender Email (From:)
                  </label>
                  <input
                    type="text"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="hello@yourdomain.com"
                    className={`w-full bg-[#090d18] border rounded-xl px-3 py-2 font-mono text-slate-200 placeholder-slate-600 focus:outline-none text-xs ${
                      senderEmail && !senderEmail.includes("@")
                        ? "border-amber-500 focus:border-amber-400"
                        : "border-slate-700 focus:border-indigo-500"
                    }`}
                  />
                  {senderEmail && !senderEmail.includes("@") && (
                    <p className="text-[10px] text-amber-400 mt-1 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Missing &quot;@&quot; (e.g. hello@{senderEmail})</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Reply-To Email */}
              <div>
                <label className="font-medium text-slate-200 block mb-1">
                  Reply-To Email (Where recipient replies will go)
                </label>
                <input
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  placeholder="timmyleeokoduwa7@gmail.com"
                  className="w-full bg-[#090d18] border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset all browser-saved settings back to defaults?")) {
                    localStorage.removeItem("flashmail_resend_api_key");
                    localStorage.removeItem("flashmail_smtp_host");
                    localStorage.removeItem("flashmail_smtp_port");
                    localStorage.removeItem("flashmail_smtp_secure");
                    localStorage.removeItem("flashmail_smtp_user");
                    localStorage.removeItem("flashmail_smtp_pass");
                    localStorage.removeItem("flashmail_delivery_mode");
                    setResendApiKey("");
                    setSmtpHost("");
                    setSmtpPort("587");
                    setSmtpSecure("auto");
                    setSmtpUser("");
                    setSmtpPass("");
                    setSmtpTestResult(null);
                  }
                }}
                className="py-2.5 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 font-medium text-xs rounded-xl border border-slate-700/60 transition"
                title="Clear saved engine credentials"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
