import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Important disclaimers regarding the accuracy, independence, and use of content on ${SITE_NAME}.`,
  alternates: { canonical: "/disclaimer" },
};

const LAST_UPDATED = "September 14, 2026";

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Disclaimer", href: "/disclaimer" }]}
      />

      <h1 className="text-3xl font-bold tracking-tight">Disclaimer</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <div className="prose-article mt-8">
        <h2>General information only</h2>
        <p>
          The content published on {SITE_NAME} is intended for general informational and
          educational purposes only. While we strive for accuracy and cite primary sources where
          possible, artificial intelligence is a fast-moving field — model capabilities, pricing,
          availability, and company claims can change quickly and may be outdated by the time you
          read an article. Always verify important details directly with the relevant company or
          project before making decisions based on our coverage.
        </p>

        <h2>Not professional advice</h2>
        <p>
          Nothing on this Site constitutes financial, investment, legal, or professional advice.
          Any opinions or analysis expressed are those of the author at the time of writing and
          should not be relied upon as the sole basis for any decision. You should consult a
          qualified professional before making financial, business, or legal decisions related to
          AI products, companies, or technologies discussed on this Site.
        </p>

        <h2>Use of AI tools in our workflow</h2>
        <p>
          We use AI-assisted tools as part of our research and drafting process, similar to how a
          newsroom might use other software tools. Every published article is reviewed, edited,
          and fact-checked by a human editor before publication. We do not publish unedited,
          fully AI-generated content.
        </p>

        <h2>Editorial independence and affiliations</h2>
        <p>
          {SITE_NAME} is an independent publication and is not affiliated with, sponsored by, or
          endorsed by OpenAI, Anthropic, Google, Google DeepMind, Meta, Mistral AI, Hugging Face,
          or any other company mentioned in our coverage, unless explicitly stated in a specific
          article. Product names, logos, and brands mentioned on this Site are the property of
          their respective owners and are used for identification and editorial commentary
          purposes only.
        </p>

        <h2>Advertising disclosure</h2>
        <p>
          This Site may display advertisements served through Google AdSense and other
          third-party advertising networks. We may earn revenue from these advertisements.
          Advertising placement does not influence our editorial content, and sponsored or
          promotional content, if any, will be clearly labeled as such.
        </p>

        <h2>External links</h2>
        <p>
          Our articles may link to external websites for reference or further reading. We are not
          responsible for the content, accuracy, or privacy practices of external sites, and
          including a link does not imply our endorsement of that site or its content.
        </p>

        <h2>Errors and corrections</h2>
        <p>
          Despite our best efforts, errors may occasionally appear in our content. If you spot an
          inaccuracy, please let us know via our <a href="/contact">contact page</a> and we will
          review and correct it as promptly as possible.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          By using this Site, you agree that {SITE_NAME} and its authors and editors are not
          liable for any loss or damage arising from your reliance on information published here.
          Use of any information on this Site is at your own risk.
        </p>
      </div>
    </div>
  );
}
