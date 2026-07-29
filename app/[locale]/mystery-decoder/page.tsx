import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MysteryDecoderPacks from "../components/MysteryDecoderPacks";

// Save as app/[locale]/mystery-decoder/page.tsx
// Adjust the relative import paths above if your route folder is
// nested differently from where components/ sits.

export default function MysteryDecoderPage() {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 48px" }}>
        <MysteryDecoderPacks />
      </main>
      <Footer />
    </div>
  );
}