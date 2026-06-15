import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";

const EXAMPLES = [
  {
    photo: "/example-beach-couple.jpg",
    pbn:   "/example-beach-couple-pbn.jpg",
    label: "Beach Couple",
  },
  {
    photo: "/example-kids-dog.jpg",
    pbn:   "/example-kids-dog-pbn.jpg",
    label: "Kids & Dog",
  },
  {
    photo: "/example-wedding.jpg",
    pbn:   null,
    label: "Wedding",
  },
  {
    photo: "/example-family.jpg",
    pbn:   null,
    label: "Family",
  },
];

export default function Examples() {
  return (
    <>
      <Navbar />
      <main style={{ padding:"60px 24px", maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
        <h1 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,44px)", marginBottom:16 }}>
          📸 Examples
        </h1>
        <p style={{ color:"#666", fontSize:17, marginBottom:48, maxWidth:560, margin:"0 auto 48px" }}>
          See what CreaBea Studio creates from real photos. Every outline is uniquely generated for your image.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(480px,1fr))", gap:32, marginBottom:48 }}>
          {EXAMPLES.map(ex => (
            <div key={ex.label} style={{
              background:"white", borderRadius:20,
              boxShadow:"0 4px 20px rgba(0,0,0,0.08)",
              overflow:"hidden", textAlign:"left"
            }}>
              {ex.pbn ? (
                // Side-by-side: PBN on left, photo on right
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", height:260 }}>
                  <div style={{ position:"relative", overflow:"hidden" }}>
                    <Image src={ex.pbn} alt={`${ex.label} PBN outline`} fill style={{ objectFit:"cover" }}/>
                  </div>
                  <div style={{ position:"relative", overflow:"hidden" }}>
                    <Image src={ex.photo} alt={`${ex.label} original`} fill style={{ objectFit:"cover" }}/>
                  </div>
                </div>
              ) : (
                <div style={{ position:"relative", height:260, overflow:"hidden" }}>
                  <Image src={ex.photo} alt={ex.label} fill style={{ objectFit:"cover" }}/>
                </div>
              )}
              <div style={{ padding:"16px 20px" }}>
                <div style={{ fontWeight:700, fontSize:16 }}>{ex.label}</div>
                {ex.pbn && <div style={{ color:"var(--muted)", fontSize:13, marginTop:4 }}>Numbered outline + colour palette</div>}
              </div>
            </div>
          ))}
        </div>

        <Link href="/create" className="btn-primary" style={{ display:"inline-flex", fontSize:17, padding:"16px 40px" }}>
          Create yours now →
        </Link>
      </main>
    </>
  );
}
