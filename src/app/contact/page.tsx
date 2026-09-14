import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${SITE_NAME} editorial team — tips, corrections, and feedback welcome.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]} />

      <h1 className="text-3xl font-bold tracking-tight">Contact us</h1>
      <p className="mt-3 text-muted">
        Have a tip, correction, partnership inquiry, or just feedback? Send us a message and
        we&apos;ll get back to you as soon as we can.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
