import Navbar from "../components/Navbar";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 800, margin: "0 auto", lineHeight: 1.7, color: "#333" }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: "clamp(26px,4vw,38px)", marginBottom: 8 }}>
          Terms of Service
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Last updated June 18, 2026</p>

        <p>
          We are CreaBeaStudio (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;), a company registered in the Netherlands at Godfried van Rhenenlaan 27, Vollenhove 8325EV.
        </p>
        <p>
          We operate the website <a href="http://www.creabeastudio.com">www.creabeastudio.com</a> (the &quot;Site&quot;), as well as any other related products and services that refer or link to these legal terms (the &quot;Legal Terms&quot;) (collectively, the &quot;Services&quot;).
        </p>
        <p>
          CreaBeaStudio provides a service that enables users to upload photos, which are processed and converted into custom coloring pages. These files are delivered digitally for personal use.
        </p>
        <p>
          By accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. The Services are intended for users who are at least 18 years old.
        </p>

        <h2 style={sectionHeading}>1. Our Services</h2>
        <p>
          The Services are not tailored to comply with industry-specific regulations (HIPAA, FISMA, etc.). You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act.
        </p>

        <h2 style={sectionHeading}>2. Intellectual Property Rights</h2>
        <p>
          We own or license all intellectual property rights in our Services, including source code, designs, and content (&quot;Content&quot;) and trademarks (&quot;Marks&quot;). We grant you a non-exclusive, non-transferable, revocable license to access the Services for personal, non-commercial use only.
        </p>

        <h2 style={sectionHeading}>3. User Representations</h2>
        <p>
          By using the Services, you represent that: you have legal capacity to agree to these terms; you are not a minor; you will not access the Services through automated means; and your use will comply with applicable law.
        </p>

        <h2 style={sectionHeading}>4. Products</h2>
        <p>
          All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change.
        </p>

        <h2 style={sectionHeading}>5. Purchases and Payment</h2>
        <p>
          We accept Visa, Mastercard, American Express, and PayPal. All payments are in Euros. You agree to provide accurate billing information. We reserve the right to refuse or limit any order, and to correct pricing errors even after payment has been made.
        </p>

        <h2 style={sectionHeading}>6. Prohibited Activities</h2>
        <p>
          You agree not to misuse the Services, including (but not limited to) attempting to defraud us or other users, circumventing security features, uploading malicious code, or using automated tools to access the Services. Specific to our Services:
        </p>
        <ul>
          <li><strong>Content restrictions:</strong> We do not accept photos containing pornography, explicit nudity, extreme violence, gore, or hate speech. Orders containing such content will be cancelled and refunded immediately.</li>
          <li><strong>Photo rights:</strong> You must own the copyright or have explicit permission to use any photo you submit.</li>
          <li><strong>Usage limits:</strong> Files are for personal use only. Commercial use, resale, or redistribution is strictly prohibited.</li>
        </ul>

        <h2 style={sectionHeading}>7. User Generated Contributions</h2>
        <p>
          If the Services allow you to submit content (e.g. reviews, comments), you represent that your contributions are original, lawful, and do not infringe on third-party rights.
        </p>

        <h2 style={sectionHeading}>8. Contribution License</h2>
        <p>
          By posting contributions, you grant us a license to use, display, and distribute that content in connection with operating the Services. You retain ownership of your contributions.
        </p>

        <h2 style={sectionHeading}>9. Guidelines for Reviews</h2>
        <p>
          Reviews must be based on firsthand experience and must not contain offensive, discriminatory, or misleading content. We may accept, reject, or remove reviews at our discretion.
        </p>

        <h2 style={sectionHeading}>10. Third-Party Websites and Content</h2>
        <p>
          The Services may link to third-party websites or content not controlled by us. We are not responsible for the accuracy or practices of such third parties.
        </p>

        <h2 style={sectionHeading}>11. Services Management</h2>
        <p>
          We reserve the right to monitor the Services, restrict or remove content, and take legal action against violations of these Legal Terms.
        </p>

        <h2 style={sectionHeading}>12. Privacy Policy</h2>
        <p>
          Please review our <a href="/privacy">Privacy Notice</a>. By using the Services, you agree to be bound by it. The Services are hosted in the Netherlands and globally via the Vercel edge network; by using the Services from elsewhere, you consent to your data being transferred to and processed in those locations.
        </p>

        <h2 style={sectionHeading}>13. Term and Termination</h2>
        <p>
          We reserve the right to deny access to or use of the Services, to any person, for any reason, without notice or liability.
        </p>

        <h2 style={sectionHeading}>14. Modifications and Interruptions</h2>
        <p>
          We may change, modify, or discontinue the Services at any time without notice, and we are not liable for any resulting loss or inconvenience.
        </p>

        <h2 style={sectionHeading}>15. Governing Law</h2>
        <p>
          These Legal Terms are governed by the laws of the Netherlands. If you are an EU consumer, you retain protections under the law of your country of residence. Disputes fall under the non-exclusive jurisdiction of the courts of Amsterdam.
        </p>

        <h2 style={sectionHeading}>16. Dispute Resolution</h2>
        <p>
          The Parties agree to first attempt informal negotiation for at least 30 days. Remaining disputes shall be resolved by binding arbitration in Amsterdam, Netherlands, under the rules of the European Court of Arbitration, in Dutch.
        </p>

        <h2 style={sectionHeading}>17. Corrections</h2>
        <p>
          We reserve the right to correct any errors, inaccuracies, or omissions on the Services at any time without notice.
        </p>

        <h2 style={sectionHeading}>18. Disclaimer</h2>
        <p>
          The Services are provided &quot;as-is&quot; and &quot;as-available.&quot; We disclaim all warranties to the fullest extent permitted by law and assume no liability for errors, interruptions, or third-party content.
        </p>

        <h2 style={sectionHeading}>19. Limitations of Liability</h2>
        <p>
          Our liability to you for any cause will be limited to the lesser of the amount you paid to us in the month prior to the claim, or €50.
        </p>

        <h2 style={sectionHeading}>20. Indemnification</h2>
        <p>
          You agree to indemnify us against claims arising from your contributions, use of the Services, or breach of these Legal Terms.
        </p>

        <h2 style={sectionHeading}>21. User Data</h2>
        <p>
          We perform routine backups but are not liable for any loss or corruption of data you transmit through the Services.
        </p>

        <h2 style={sectionHeading}>22. Electronic Communications</h2>
        <p>
          By using the Services, you consent to receive electronic communications and agree that electronic signatures and records satisfy any legal writing requirement.
        </p>

        <h2 style={sectionHeading}>23. California Users and Residents</h2>
        <p>
          Unresolved complaints may be directed to the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs.
        </p>

        <h2 style={sectionHeading}>24. Miscellaneous</h2>
        <p>
          These Legal Terms constitute the entire agreement between you and us. If any provision is found unenforceable, the remaining provisions remain in effect.
        </p>

        <h2 style={sectionHeading}>25. Contact Us</h2>
        <p>
          CreaBeaStudio<br />
          Godfried van Rhenenlaan 27<br />
          Vollenhove 8325EV<br />
          Netherlands<br />
          Phone: +31 631054925<br />
          Email: <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a>
        </p>

        <p style={{ marginTop: 32, fontSize: 13, color: "#999" }}>
          This Terms of Service was created using Termly&apos;s Terms and Conditions Generator.
        </p>
      </main>
    </>
  );
}

const sectionHeading = {
  fontFamily: "Nunito, sans-serif",
  fontWeight: 800,
  fontSize: 22,
  marginTop: 32,
  marginBottom: 12,
  color: "var(--ink)",
};
