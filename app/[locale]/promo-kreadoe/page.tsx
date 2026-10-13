"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sectionHeading = {
  fontFamily: "Nunito, sans-serif",
  fontWeight: 800,
  fontSize: 22,
  marginTop: 32,
  marginBottom: 12,
  color: "var(--ink)",
};

type Lang = "en" | "nl" | "fr" | "de";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "nl", label: "Nederlands" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

const CONTENT: Record<
  Lang,
  {
    title: string;
    lastUpdated: string;
    intro: string;
    s1Heading: string;
    s1Text: string;
    s2Heading: string;
    s2Text: string;
    s3Heading: string;
    s3Text: string;
    s4Heading: string;
    s4Text: string;
    s5Heading: string;
    s5Text: string;
    footerNote: string;
  }
> = {
  
    nl: {
        title: "CREABEA15 Actie — Voorwaarden",
        lastUpdated: "Laatst bijgewerkt: oktober 2026",
        intro:
          "Deze voorwaarden gelden voor de CREABEA15-actie, gepresenteerd op de KreaDoe-vakbeurs en beschikbaar op creabeastudio.com.",
        s1Heading: "1. De 15% korting",
        s1Text:
          "Gebruik code CREABEA15 bij het afrekenen op creabeastudio.com voor 15% korting op je bestelling. De code geldt voor alle producten op de site en is geldig van 21 t/m 31 oktober 2026. Je mag de code meerdere keren gebruiken, op meerdere bestellingen.",
        s2Heading: "2. De gratis Guangna marker",
        s2Text:
          "Na het plaatsen van een bestelling op creabeastudio.com met CREABEA15, ontvang je van ons per e-mail een aparte kortingscode voor gebruik op guangna.eu, inwisselbaar voor één gratis marker (willekeurige kleur). Deze vervolgcode is beperkt tot één gratis marker per e-mailadres — meerdere bestellingen op creabeastudio.com geven geen recht op meer dan één gratis marker op guangna.eu. De code voor guangna.eu is geldig t/m 31 december 2026.",
        s3Heading: "3. Hoe we contact opnemen",
        s3Text:
          "We gebruiken het e-mailadres dat je bij het afrekenen hebt opgegeven (via onze betaalverwerker, Lemon Squeezy) om je na je bestelling de kortingscode voor guangna.eu te sturen.",
        s4Heading: "4. Algemeen",
        s4Text:
          "Deze actie wordt aangeboden door CreaBeaStudio en staat los van enig aanbod, voorraad of beleid op guangna.eu. We behouden ons het recht voor deze actie op elk moment te beëindigen of aan te passen. Voor onze algemene voorwaarden, zie onze pagina Algemene Voorwaarden.",
        s5Heading: "5. Vragen",
        s5Text: "Heb je vragen over deze actie? Neem contact met ons op via hello@creabeastudio.com.",
        footerNote: "CreaBeaStudio — Color your memories.",
      },
    en: {
    title: "CREABEA15 Promotion — Terms",
    lastUpdated: "Last updated: October 2026",
    intro:
      "These terms apply to the CREABEA15 promotion, presented at the KreaDoe trade fair and available on creabeastudio.com.",
    s1Heading: "1. The 15% discount",
    s1Text:
      "Use code CREABEA15 at checkout on creabeastudio.com to receive 15% off your order. The code applies to all products on the site and is valid from 21 through 31 October 2026. You're welcome to use the code more than once, on more than one order.",
    s2Heading: "2. The free Guangna marker",
    s2Text:
      "After you complete an order on creabeastudio.com using CREABEA15, we will email you a separate discount code for use on guangna.eu, redeemable for one free marker (random color). This follow-up code is limited to one free marker per email address — placing multiple orders on creabeastudio.com does not entitle you to more than one free marker on guangna.eu. The guangna.eu code is valid through 31 December 2026.",
    s3Heading: "3. How we contact you",
    s3Text:
      "We use the email address provided at checkout (via our payment provider, Lemon Squeezy) to send you the guangna.eu discount code after your order is placed.",
    s4Heading: "4. General",
    s4Text:
      "This promotion is offered by CreaBeaStudio and is separate from any offer, stock, or policy on guangna.eu. We reserve the right to end or adjust this promotion at any time. For our general terms and conditions, see our Terms & Conditions page.",
    s5Heading: "5. Questions",
    s5Text: "If you have any questions about this promotion, contact us at hello@creabeastudio.com.",
    footerNote: "CreaBeaStudio — Color your memories.",
  },
  fr: {
    title: "Promotion CREABEA15 — Conditions",
    lastUpdated: "Dernière mise à jour : octobre 2026",
    intro:
      "Ces conditions s'appliquent à la promotion CREABEA15, présentée au salon KreaDoe et disponible sur creabeastudio.com.",
    s1Heading: "1. La réduction de 15 %",
    s1Text:
      "Utilisez le code CREABEA15 lors du paiement sur creabeastudio.com pour bénéficier de 15 % de réduction sur votre commande. Le code s'applique à tous les produits du site et est valable du 21 au 31 octobre 2026. Vous pouvez utiliser le code plusieurs fois, sur plusieurs commandes.",
    s2Heading: "2. Le marqueur Guangna gratuit",
    s2Text:
      "Après avoir passé une commande sur creabeastudio.com avec CREABEA15, nous vous enverrons par e-mail un code de réduction distinct utilisable sur guangna.eu, échangeable contre un marqueur gratuit (couleur aléatoire). Ce code est limité à un marqueur gratuit par adresse e-mail — passer plusieurs commandes sur creabeastudio.com ne donne pas droit à plus d'un marqueur gratuit sur guangna.eu. Le code guangna.eu est valable jusqu'au 31 décembre 2026.",
    s3Heading: "3. Comment nous vous contactons",
    s3Text:
      "Nous utilisons l'adresse e-mail fournie lors du paiement (via notre prestataire de paiement, Lemon Squeezy) pour vous envoyer le code de réduction guangna.eu après votre commande.",
    s4Heading: "4. Général",
    s4Text:
      "Cette promotion est proposée par CreaBeaStudio et est indépendante de toute offre, stock ou politique sur guangna.eu. Nous nous réservons le droit de mettre fin à cette promotion ou de la modifier à tout moment. Pour nos conditions générales, consultez notre page Conditions Générales.",
    s5Heading: "5. Questions",
    s5Text: "Pour toute question concernant cette promotion, contactez-nous à hello@creabeastudio.com.",
    footerNote: "CreaBeaStudio — Color your memories.",
  },
  de: {
    title: "CREABEA15-Aktion — Bedingungen",
    lastUpdated: "Zuletzt aktualisiert: Oktober 2026",
    intro:
      "Diese Bedingungen gelten für die CREABEA15-Aktion, vorgestellt auf der KreaDoe-Messe und verfügbar auf creabeastudio.com.",
    s1Heading: "1. Der 15%-Rabatt",
    s1Text:
      "Verwende den Code CREABEA15 beim Checkout auf creabeastudio.com, um 15% Rabatt auf deine Bestellung zu erhalten. Der Code gilt für alle Produkte auf der Website und ist gültig vom 21. bis 31. Oktober 2026. Du kannst den Code mehrmals verwenden, auch bei mehreren Bestellungen.",
    s2Heading: "2. Der kostenlose Guangna-Marker",
    s2Text:
      "Nachdem du eine Bestellung auf creabeastudio.com mit CREABEA15 abgeschlossen hast, senden wir dir per E-Mail einen separaten Rabattcode für guangna.eu, einlösbar für einen kostenlosen Marker (zufällige Farbe). Dieser Folgecode ist auf einen kostenlosen Marker pro E-Mail-Adresse begrenzt — mehrere Bestellungen auf creabeastudio.com berechtigen nicht zu mehr als einem kostenlosen Marker auf guangna.eu. Der guangna.eu-Code ist gültig bis 31. Dezember 2026.",
    s3Heading: "3. Wie wir dich kontaktieren",
    s3Text:
      "Wir verwenden die beim Checkout angegebene E-Mail-Adresse (über unseren Zahlungsanbieter Lemon Squeezy), um dir nach deiner Bestellung den guangna.eu-Rabattcode zuzusenden.",
    s4Heading: "4. Allgemeines",
    s4Text:
      "Diese Aktion wird von CreaBeaStudio angeboten und ist unabhängig von jeglichem Angebot, Lagerbestand oder jeglicher Richtlinie auf guangna.eu. Wir behalten uns das Recht vor, diese Aktion jederzeit zu beenden oder anzupassen. Unsere allgemeinen Geschäftsbedingungen findest du auf unserer Seite Allgemeine Geschäftsbedingungen.",
    s5Heading: "5. Fragen",
    s5Text: "Bei Fragen zu dieser Aktion kontaktiere uns unter hello@creabeastudio.com.",
    footerNote: "CreaBeaStudio — Color your memories.",
  },
};

export default function PromoKreadoePage() {
  const [lang, setLang] = useState<Lang>("en");
  const c = CONTENT[lang];

  return (
    <>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 800, margin: "0 auto", lineHeight: 1.7, color: "#333" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                padding: "8px 16px",
                borderRadius: 999,
                border: lang === code ? "2px solid var(--pink)" : "2px solid #E8D5C8",
                background: lang === code ? "var(--pink)" : "transparent",
                color: lang === code ? "#fff" : "var(--ink)",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <h1
          style={{
            fontFamily: "Nunito, sans-serif",
            color: "var(--pink)",
            fontWeight: 900,
            fontSize: "clamp(26px,4vw,38px)",
            marginBottom: 8,
          }}
        >
          {c.title}
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>{c.lastUpdated}</p>

        <p>{c.intro}</p>

        <h2 style={sectionHeading}>{c.s1Heading}</h2>
        <p>{c.s1Text}</p>

        <h2 style={sectionHeading}>{c.s2Heading}</h2>
        <p>{c.s2Text}</p>

        <h2 style={sectionHeading}>{c.s3Heading}</h2>
        <p>{c.s3Text}</p>

        <h2 style={sectionHeading}>{c.s4Heading}</h2>
        <p>{c.s4Text}</p>

        <h2 style={sectionHeading}>{c.s5Heading}</h2>
        <p>{c.s5Text}</p>

        <p style={{ marginTop: 32, fontSize: 13, color: "#999" }}>{c.footerNote}</p>
      </main>
      <Footer />
    </>
  );
}
