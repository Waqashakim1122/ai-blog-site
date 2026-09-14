import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your information, including our use of cookies and advertising.`,
  alternates: { canonical: "/privacy-policy" },
};

const LAST_UPDATED = "September 14, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Privacy Policy", href: "/privacy-policy" }]}
      />

      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <div className="prose-article mt-8">
        <p>
          This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) collects, uses, and shares information when you visit or interact
          with this website (the &quot;Site&quot;). By using the Site, you agree to the
          collection and use of information in accordance with this policy.
        </p>

        <h2>Information we collect</h2>
        <p>
          We collect as little personal information as possible. The information we may collect
          falls into these categories:
        </p>
        <ul>
          <li>
            <strong>Information you provide directly:</strong> When you use our{" "}
            <a href="/contact">contact form</a>, we collect your name, email address, and the
            content of your message so we can respond to you.
          </li>
          <li>
            <strong>Usage data:</strong> Like most websites, we automatically collect standard
            log information such as your browser type, device type, pages visited, referring
            URL, and the date and time of your visit. This is typically collected through
            analytics tools.
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> We use cookies and similar
            tracking technologies to operate the Site, remember your preferences (such as dark
            mode), analyze traffic, and — where you have consented — serve personalized
            advertising.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          Cookies are small text files stored on your device. We use the following categories of
          cookies:
        </p>
        <ul>
          <li>
            <strong>Essential cookies:</strong> required for core site functionality, such as
            remembering your cookie consent choice and theme preference.
          </li>
          <li>
            <strong>Analytics cookies:</strong> help us understand how visitors use the Site so
            we can improve it.
          </li>
          <li>
            <strong>Advertising cookies:</strong> used by us and third-party advertising
            partners, including Google, to serve ads that are relevant to you and to measure the
            performance of those ads.
          </li>
        </ul>
        <p>
          You can control or delete cookies through your browser settings, and you can accept or
          decline non-essential cookies using the cookie banner shown when you first visit the
          Site. Declining cookies may limit some functionality.
        </p>

        <h2>Advertising and third-party vendors</h2>
        <p>
          We may display advertisements served by Google AdSense and other third-party
          advertising networks. These third parties may use cookies, web beacons, and similar
          technologies to collect information about your visits to this and other websites in
          order to provide advertisements about goods and services of interest to you.
        </p>
        <p>
          Google uses cookies, including the DoubleClick DART cookie, to serve ads based on your
          prior visits to this Site and other sites on the internet. You can opt out of
          personalized advertising by visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>{" "}
          or the{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Digital Advertising Alliance opt-out page
          </a>
          . We do not control the cookies or tracking technologies used by third-party
          advertisers, and this Privacy Policy does not cover their practices — please review
          each third party&apos;s own privacy policy for details.
        </p>

        <h2>How we use information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Operate, maintain, and improve the Site</li>
          <li>Respond to your inquiries and contact form submissions</li>
          <li>Understand how visitors use the Site through aggregated analytics</li>
          <li>Serve and measure advertising, where permitted by your cookie choices</li>
          <li>Detect, prevent, and address technical issues or abuse</li>
        </ul>

        <h2>Data sharing</h2>
        <p>
          We do not sell your personal information. We may share information with service
          providers who help us operate the Site (such as hosting and analytics providers) and
          with advertising partners as described above. We may also disclose information if
          required by law or to protect our rights, users, or the public.
        </p>

        <h2>Data retention</h2>
        <p>
          We retain contact form submissions for as long as needed to respond to your inquiry and
          for a reasonable period afterward for record-keeping. Analytics and advertising data is
          retained according to the policies of the third-party providers that process it.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, delete, or
          restrict the use of your personal information, and to object to or opt out of certain
          processing, including personalized advertising. To exercise any of these rights,
          contact us using the details below.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          The Site is not directed at children under 13, and we do not knowingly collect
          personal information from children under 13. If you believe a child has provided us
          with personal information, please contact us so we can remove it.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this
          page with an updated &quot;Last updated&quot; date. We encourage you to review this
          policy periodically.
        </p>

        <h2>Contact us</h2>
        <p>
          If you have questions about this Privacy Policy, please reach out through our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}
