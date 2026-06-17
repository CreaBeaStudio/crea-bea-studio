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
        height:64
      }}>
        <Link href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <Image src="/cat-logo.png" alt="CreaBeaStudio" width={100} height={100} 
style={{ objectFit:"contain", alignSelf:"flex-end" }}/>
          
          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:14, color:"var(--pink)" }}>♥</span>
            <span style={{ fontSize:22, color:"var(--muted)", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight:700, whiteSpace:"nowrap" }}>Color Your Memories</span>
            <span style={{ fontSize:14, color:"var(--pink)" }}>♥</span>
          </span>
        </Link>
        <div style={{ display:"flex", gap:4, alignItems:"center", flexWrap:"nowrap", marginLeft:200 }}>
          {[
            ["Home","/"],
            ["Create","/create"],
            ["Guangna Color Converter","/color-converter"],
            ["Examples","/examples"],
            ["Tips&Tricks","/tips"],
            ["FAQ","/faq"],
            ["Check out","/pricing"],
          ].map(([label,href])=>(
            <Link key={label} href={href} style={{
              textDecoration:"none", color:"var(--ink)", fontSize:17,
              fontWeight:500, padding:"6px 8px", borderRadius:8, whiteSpace:"nowrap"
            }}>
              {label}
            </Link>
          ))}
          
        </div>
      </div>
    </nav>
  );
}
