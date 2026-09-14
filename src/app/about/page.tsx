import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_NAME} covers AI model releases, tools, research, and industry news with clear, original, human-edited reporting.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }]} />

      <h1 className="text-3xl font-bold tracking-tight">About {SITE_NAME}</h1>

      <div className="prose-article mt-8">
        <p>
          {SITE_NAME} is an independent publication covering artificial intelligence: new model
          releases, developer tools, research breakthroughs, open-source projects, and the
          business decisions shaping the industry. We started this site because AI news moves
          fast and is often buried in hype, marketing language, or jargon that&apos;s hard to
          parse without deep technical background.
        </p>

        <h2>What we cover</h2>
        <p>
          Our beat spans the major AI labs and the wider ecosystem around them — from frontier
          model releases at OpenAI, Anthropic, and Google DeepMind, to the open-weight models and
          tools coming out of Meta, Mistral, and the Hugging Face community. We write about:
        </p>
        <ul>
          <li>New model releases and what actually changed under the hood</li>
          <li>Developer tools and products built on top of AI models</li>
          <li>Research papers and benchmarks, explained in plain language</li>
          <li>Open-source AI projects worth knowing about</li>
          <li>Funding, regulation, and other industry news</li>
        </ul>

        <h2>How we work</h2>
        <p>
          Every article on {SITE_NAME} is written and edited by our team before publication. We
          use AI tools to help with research and drafting, the same way any modern newsroom
          might use spell-checkers or research assistants, but every piece is reviewed, fact
          checked where possible, and rewritten for accuracy and clarity by a human editor before
          it goes live. We link to primary sources whenever we can and correct errors promptly
          when we find them.
        </p>

        <h2>Editorial independence</h2>
        <p>
          {SITE_NAME} is not affiliated with OpenAI, Anthropic, Google, Meta, or any other AI lab
          we cover. Our reporting and analysis reflect our own editorial judgment. This site may
          display advertising to support the cost of hosting and writing; advertising has no
          influence over our editorial content. See our{" "}
          <a href="/disclaimer">disclaimer</a> for more detail.
        </p>

        <h2>Get in touch</h2>
        <p>
          Have a tip, a correction, or feedback? Visit our <a href="/contact">contact page</a> —
          we read every message.
        </p>
      </div>
    </div>
  );
}
