"use client";

import { FormEvent, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Contact() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition-all duration-200 placeholder:text-white/25 focus:border-accent/40 focus:ring-1 focus:ring-accent/20";

  return (
    <SectionWrapper id="contact">
      <div className="mx-auto max-w-2xl">
        <SectionHeader
          centered
          title="What bottleneck are you trying to solve?"
          description="Start a conversation. I'll get back to you at philxue814@gmail.com."
        />
      </div>

      <div className="mx-auto mt-12 max-w-xl">
        <GlassPanel>
          <form onSubmit={handleSubmit} className="space-y-5 p-8 md:p-10">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-muted">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="company" className="mb-2 block text-sm text-muted">
                Company (optional)
              </label>
              <input
                id="company"
                name="company"
                className={inputClass}
                placeholder="Your business"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-sm text-muted">
                What are you trying to solve?
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className={`${inputClass} resize-none`}
                placeholder="Describe your bottleneck or what you'd like to automate..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-shimmer btn-shimmer--primary w-full py-3.5 text-sm font-medium shadow-[0_4px_24px_rgba(196,30,58,0.25)] hover:shadow-[0_4px_24px_rgba(196,30,58,0.35)] disabled:opacity-50"
            >
              <span className="shrink-0">
                {status === "loading" ? "Sending..." : "Start a Conversation"}
              </span>
            </button>

            {status === "success" && (
              <p className="text-center text-sm text-accent">
                Message sent. I&apos;ll be in touch soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-sm text-accent-bright">{errorMsg}</p>
            )}
          </form>
        </GlassPanel>
      </div>
    </SectionWrapper>
  );
}