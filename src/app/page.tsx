"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Globe2, ShieldCheck, Clock, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/brand/logo-mark";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/fade-in";
import { STOCK_IMAGES } from "@/lib/stock-images";

const FAQS = [
  {
    q: "What is a tracking number, and where do I find it?",
    a: "It's the unique code the merchant gave you when your order shipped — usually in your order confirmation or shipping notification email. On ShipTrack it looks like STK-7F3K9QP2A1.",
  },
  {
    q: "When will my tracking information appear?",
    a: "As soon as the merchant creates the shipment and generates a label, you'll see a \"Shipment Created\" event. Updates continue to appear as the package moves.",
  },
  {
    q: "Why isn't my tracking number working?",
    a: "Double-check for typos — tracking numbers don't include spaces. If it still doesn't work, the merchant may not have created the shipment yet, or the number may belong to a different courier.",
  },
  {
    q: "Can I contact the merchant about my shipment?",
    a: "Yes — every tracking result page has a \"Message the merchant\" form at the bottom. Your message is routed straight to the merchant who shipped your order.",
  },
];

const STATS = [
  { icon: Globe2, value: "150+", label: "Countries served", accent: "text-gold" },
  { icon: PackageCheck, value: "2.4M+", label: "Shipments tracked", accent: "text-primary" },
  { icon: Clock, value: "24/7", label: "Live tracking updates", accent: "text-gold" },
  { icon: ShieldCheck, value: "99.9%", label: "On-time delivery rate", accent: "text-primary" },
];

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <section className="relative flex min-h-screen flex-col overflow-hidden">
          <Image
            src={STOCK_IMAGES.containerPort}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/70 to-ink/50" />

          <header className="relative z-10">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
              <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold text-white">
                <LogoMark />
                ShipTrack
              </Link>
              <Button render={<Link href="/login" />}>Sign in</Button>
            </div>
          </header>

          <FadeIn className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 sm:px-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gold ring-1 ring-white/15 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Live global tracking
            </span>
            <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Track &amp; Trace
            </h1>
            <p className="mt-3 max-w-xl text-white/80">
              Enter a tracking number to see live status, location, and delivery estimates — no
              account needed.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) router.push(`/track/${encodeURIComponent(value.trim().toUpperCase())}`);
              }}
              className="mt-8 flex flex-col gap-3 rounded-xl bg-card/95 p-3 shadow-lg backdrop-blur-sm sm:flex-row sm:p-4"
            >
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter your tracking number"
                className="h-12 flex-1 bg-card font-mono text-base uppercase shadow-sm"
                autoFocus
              />
              <Button type="submit" size="lg" className="h-12 sm:px-8">
                <Search className="h-4 w-4" />
                Track
              </Button>
            </form>
            <p className="mt-2 text-xs text-white/70">e.g. STK-7F3K9QP2A1</p>
          </FadeIn>

          <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <StaggerGroup className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-8">
              {STATS.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="flex flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
                    <stat.icon className={`h-5 w-5 ${stat.accent}`} />
                    <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/70">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-border border-t border-border">
              {FAQS.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {item.q}
                    <Plus className="h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Link href="/" className="flex items-center gap-2.5 font-heading text-base font-semibold">
            <LogoMark mono />
            ShipTrack
          </Link>
          <p className="text-sm text-ink-foreground/70">
            &copy; 2001 ShipTrack. Real-time shipment tracking, worldwide.
          </p>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/" className="text-ink-foreground/70 hover:text-ink-foreground">
              Track a shipment
            </Link>
            <Link href="/login" className="text-ink-foreground/70 hover:text-ink-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
