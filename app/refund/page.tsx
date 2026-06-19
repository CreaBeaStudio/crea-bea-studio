import Navbar from "../../components/Navbar";

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 800, margin: "0 auto", lineHeight: 1.7, color: "#333" }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: "clamp(26px,4vw,38px)", marginBottom: 8 }}>
          Refund Policy
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Last updated June 18, 2026</p>

        <p>
          Because each Guangna by Number file is custom-made based on your uploaded photo, we are unable to offer refunds once production has started.
        </p>

        <h2 style={sectionHeading}>If Something&apos;s Wrong With Your Order</h2>
        <p>
          If you receive an incorrect file, experience a technical error, or are otherwise unhappy with the result, please contact us within 7 days of delivery at{" "}
          <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a>. We will work with you to fix the issue or, if appropriate, issue a refund.
        </p>

        <h2 style={sectionHeading}>Cancellations</h2>
        <p>
          If you wish to cancel an order, please contact us as soon as possible. If production has not yet started, we can cancel and refund your order in full. Once production has begun, cancellations are no longer possible.
        </p>

        <h2 style={sectionHeading}>Content Restrictions</h2>
        <p>
          If your uploaded photo contains content prohibited under our{" "}
          <a href="/terms">Terms of Service</a> (e.g. explicit, violent, or hateful content), your order will be cancelled and refunded automatically.
        </p>

        <h2 style={sectionHeading}>How Refunds Are Processed</h2>
        <p>
          Approved refunds will be issued to your original payment method via Stripe or Lemon Squeezy, typically within 5–10 business days.
        </p>

        <h2 style={sectionHeading}>Contact Us</h2>
        <p>
          CreaBeaStudio<br />
          Godfried van Rhenenlaan 27<br />
          Vollenhove 8325EV<br />
          Netherlands<br />
          Email: <a href="mailto:hello@creabeastudio.com">hello@creabeastudio.com</a>
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
