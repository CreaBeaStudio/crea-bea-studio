"use client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav style={{
      background:"white", borderBottom:"1px solid var(--border)",
      position:"sticky", top:0, zIndex:100, padding:"0 24px",
    }}>
      <div style={{
        maxWidth:1200, margin:"0 auto",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", height:64
      }}>
        <Link href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
          <Image src="/cat-logo.png" alt="CreaBea Studio" width={44} height={44} style={{ objectFit:"contain" }} />
          <span style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:22, color:"var(--pink)" }}>
            Crea<span style={{ color:"#00B8B0" }}>Bea</span><span style={{ color:"var(--ink)" }}>Studio</span>
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:14, color:"var(--pink)" }}>♥</span>
            <span style={{ fontSize:13, color:"var(--muted)", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight:700 }}>Color Your Memories</span>
            <span style={{ fontSize:14, color:"var(--pink)" }}>♥</span>
          </span>
        </Link>
        <div style={{ display:"flex", gap:4, alignItems:"center", flexWrap:"wrap" }}>
          {[
            ["Home","/"],
            ["Create Guangna by Number","/create"],
            ["Guangna Color Converter","/color-converter"],
            ["Examples","/examples"],
            ["Tips&Tricks","/faq"],
            ["FAQ","/faq"],
          ].map(([label,href])=>(
            <Link key={label} href={href} style={{
              textDecoration:"none", color:"var(--ink)", fontSize:13,
              fontWeight:500, padding:"6px 8px", borderRadius:8, whiteSpace:"nowrap"
            }}>
              {label}
            </Link>
          ))}
          <a href="/create" className="btn-primary" style={{ padding:"8px 20px", fontSize:14 }}>
            Start Now →
          </a>
        </div>
      </div>
    </nav>
  );
}
