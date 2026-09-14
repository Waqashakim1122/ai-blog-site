import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms and conditions governing your use of ${SITE_NAME}.`,
  alternates: { canonical: "/terms-of-service" },
};

const LAST_UPDATED = "September 14, 2026";

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Terms of Service", href: "/terms-of-service" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <div className="prose-article mt-8">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of{" "}
          {SITE_NAME} (the &quot;Site&quot;). By accessing or using the Site, you agree to be
          bound by these Terms. If you do not agree, please do not use the Site.
        </p>

        <h2>Use of the Site</h2>
        <p>
          The Site and its content are provided for general informational purposes only. You may
          view, read, and share our articles for personal, non-commercial use. You agree to use
          the Site only for lawful purposes and in a way that does not infringe the rights of, or
          restrict or inhibit the use and enjoyment of, the Site by anyone else.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Unless otherwise noted, all content on the Site — including articles, graphics, logos,
          and the overall design — is the property of {SITE_NAME} or its licensors and is
          protected by copyright and other intellectual property laws. You may quote brief
          excerpts of our articles with proper attribution and a link back to the original post.
          Reproducing, republishing, or distributing substantial portions of our content without
          permission is prohibited.
        </p>

        <h2>No professional advice</h2>
        <p>
          Content on the Site is provided for informational purposes only and does not constitute
          professional, financial, legal, or investment advice. Statements about AI products,
          companies, or research reflect our understanding at the time of publication and may
          become outdated as the field evolves quickly. See our{" "}
          <a href="/disclaimer">Disclaimer</a> for more detail.
        </p>

        <h2>Third-party links and advertising</h2>
        <p>
          The Site may contain links to third-party websites and may display advertisements
          served by third-party ad networks, including Google AdSense. We do not control and are
          not responsible for the content, accuracy, or practices of third-party sites or
          advertisers. Inclusion of a link or ad does not imply endorsement.
        </p>

        <h2>User conduct</h2>
        <p>When using the Site (including the contact form), you agree not to:</p>
        <ul>
          <li>Submit false, misleading, or fraudulent information</li>
          <li>Attempt to disrupt, damage, or gain unauthorized access to the Site</li>
          <li>Use automated means to scrape or harvest content at scale without permission</li>
          <li>Transmit spam, malware, or unlawful content through the Site</li>
        </ul>

        <h2>Disclaimer of warranties</h2>
        <p>
          The Site is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
          warranties of any kind, whether express or implied. We do not warrant that the Site
          will be uninterrupted, error-free, or completely secure, or that content is always
          accurate, complete, or current.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {SITE_NAME} and its authors and editors will
          not be liable for any indirect, incidental, special, or consequential damages arising
          out of your use of, or inability to use, the Site or its content.
        </p>

        <h2>Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Site after changes
          are posted constitutes acceptance of the revised Terms. We will update the &quot;Last
          updated&quot; date above when changes are made.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about these Terms can be sent through our <a href="/contact">contact page</a>
          .
        </p>
      </div>
    </div>
  );
}
