import Navbar from "../../components/Navbar";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 800, margin: "0 auto", lineHeight: 1.7, color: "#333" }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: "clamp(26px,4vw,38px)", marginBottom: 8 }}>
          Privacy Notice
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Last updated June 18, 2026</p>

        <p>
          This Privacy Notice for CreaBeaStudio (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you:
        </p>
        <ul>
          <li>Visit our website at <a href="http://www.creabeastudio.com">www.creabeastudio.com</a> or any website of ours that links to this Privacy Notice</li>
          <li>Use Digital coloring pages. CreaBeaStudio provides a service that enables users to upload photos, which are processed and converted into custom coloring pages. These files are delivered digitally for personal use.</li>
          <li>Engage with us in other related ways, including any marketing or events</li>
        </ul>

        <p>
          Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a>.
        </p>

        <h2 style={sectionHeading}>Summary of Key Points</h2>
        <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services.</p>
        <p><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</p>
        <p><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</p>
        <p><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</p>
        <p><strong>What are your rights?</strong> Depending on where you are located geographically, applicable privacy law may give you certain rights regarding your personal information.</p>

        <h2 style={sectionHeading}>1. What Information Do We Collect?</h2>
        <p>
          We collect personal information that you voluntarily provide to us, including:
        </p>
        <ul>
          <li>Email addresses</li>
        </ul>
        <p>
          <strong>Sensitive Information.</strong> We do not process sensitive information.
        </p>
        <p>
          <strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases. All payment data is handled and stored by Stripe and Lemon Squeezy. You may find their privacy notices here:{" "}
          <a href="https://stripe.com/en-my/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a> and{" "}
          <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">Lemon Squeezy Privacy Policy</a>.
        </p>

        <h2 style={sectionHeading}>2. How Do We Process Your Information?</h2>
        <p>
          We process your personal information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information when necessary to save or protect an individual&apos;s vital interest, such as to prevent harm.
        </p>

        <h2 style={sectionHeading}>3. What Legal Bases Do We Rely On?</h2>
        <p>If you are located in the EU or UK, we rely on the following legal bases:</p>
        <ul>
          <li><strong>Consent</strong> — you can withdraw your consent at any time.</li>
          <li><strong>Legal Obligations</strong> — to comply with law enforcement or regulatory requirements.</li>
          <li><strong>Vital Interests</strong> — to protect your or a third party&apos;s vital interests.</li>
        </ul>

        <h2 style={sectionHeading}>4. When and With Whom Do We Share Your Information?</h2>
        <p>
          We may share information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
        </p>

        <h2 style={sectionHeading}>5. How Long Do We Keep Your Information?</h2>
        <p>
          Uploaded photos are stored securely and used only to create your personalized files. We keep them for a maximum of 30 days so you can access and download your results. After that, they are permanently deleted.
        </p>

        <h2 style={sectionHeading}>6. Do We Collect Information From Minors?</h2>
        <p>
          We do not knowingly collect, solicit data from, or market to children under 18 years of age. By using the Services, you represent that you are at least 18 years old, or are the parent or guardian of such a minor and consent to their use of the Services.
        </p>

        <h2 style={sectionHeading}>7. What Are Your Privacy Rights?</h2>
        <p>
          In some regions (EEA, UK, Switzerland, Canada), you have rights including the right to access, rectify, or erase your personal information; restrict processing; and data portability. Contact us at{" "}
          <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a> to exercise these rights.
        </p>
        <p>
          If you are located in the EEA or UK and believe we are unlawfully processing your information, you have the right to complain to your Member State or UK data protection authority. If in Switzerland, you may contact the Federal Data Protection and Information Commissioner.
        </p>

        <h2 style={sectionHeading}>8. Do-Not-Track Signals</h2>
        <p>
          We do not currently respond to Do-Not-Track browser signals, as no uniform technology standard for recognizing such signals has been finalized.
        </p>

        <h2 style={sectionHeading}>9. US Residents&apos; Privacy Rights</h2>
        <p>
          If you are a resident of California, Colorado, Connecticut, and other listed US states, you may have the right to access, correct, delete, or obtain a copy of your personal information, and to opt out of certain processing. We have not sold or shared personal information with third parties for commercial purposes in the preceding 12 months, and will not do so in the future. To exercise these rights, email{" "}
          <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a>.
        </p>

        <h2 style={sectionHeading}>10. Other Regions</h2>
        <p>
          We process information in accordance with Australia&apos;s Privacy Act 1988 and New Zealand&apos;s Privacy Act 2020 where applicable.
        </p>

        <h2 style={sectionHeading}>11. Updates to This Notice</h2>
        <p>
          We may update this Privacy Notice from time to time, indicated by the &quot;Last updated&quot; date above.
        </p>

        <h2 style={sectionHeading}>12. Contact Us</h2>
        <p>
          CreaBeaStudio<br />
          Godfried van Rhenenlaan 27<br />
          Vollenhove, Overijssel 8325EV<br />
          Netherlands<br />
          Email: <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a>
        </p>
        <p>
          EEA/Switzerland representative: M van Veldhuizen — <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a> — +31 631054925
        </p>

        <h2 style={sectionHeading}>13. Review, Update, or Delete Your Data</h2>
        <p>
          To request access to, correction of, or deletion of your personal information, please email us at{" "}
          <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a>.
        </p>

        <p style={{ marginTop: 32, fontSize: 13, color: "#999" }}>
          This Privacy Notice was created using Termly&apos;s Privacy Policy Generator.
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
