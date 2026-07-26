"use client";
import { useState, useEffect, useRef, useMemo } from "react";

// Shared "pick a Guangna set" input, replacing the plain <select> that
// used to list every SET_OPTIONS entry natively. That list has grown
// past 45+ entries (Classic Brush, Dual tip, Macaron, and now the 15
// High Gloss entries), so a native dropdown means a lot of scrolling.
// This mirrors the same filtered-suggestion pattern already used for
// code lookup in GuangnaReferenceGuide and LanguoConverter: a text
// input, a short filtered dropdown, onMouseDown selection (fires before
// the input's onBlur, so the click registers before the list closes).
//
// It's intentionally options-agnostic -- callers pass in whatever
// {label,key} pairs they want shown (e.g. GuangnaReferenceGuide maps
// SET_OPTIONS through its own setDisplayLabel() first), so this
// component has no opinion on how labels are built.

export type SetOption = { label: string; key: string };

type Props = {
  value: string;                 // selected option's key; "" = none selected
  onChange: (key: string) => void;
  options: SetOption[];
  noneLabel: string;             // shown as placeholder + as the "clear" row
  placeholder?: string;          // overrides noneLabel as the empty-input placeholder, if given
  maxSuggestions?: number;
  style?: React.CSSProperties;   // applied to the wrapping <div>, e.g. for marginBottom
};

export default function SetAutocomplete({
  value, onChange, options, noneLabel, placeholder, maxSuggestions = 10, style,
}: Props) {
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the displayed text in sync whenever `value` changes from
  // outside this component (e.g. a page-level reset, or switching
  // between two converter modes that share the same mySet state).
  useEffect(() => {
    const match = options.find(o => o.key === value);
    setInputText(match ? match.label : "");
  }, [value, options]);

  const suggestions = useMemo(() => {
    const q = inputText.trim().toLowerCase();
    if (!q) return options.slice(0, maxSuggestions);
    return options
      .filter(o => o.label.toLowerCase().includes(q) || o.key.toLowerCase().includes(q))
      .slice(0, maxSuggestions);
  }, [inputText, options, maxSuggestions]);

  const selectOption = (opt: SetOption | null) => {
    if (opt) {
      setInputText(opt.label);
      onChange(opt.key);
    } else {
      setInputText("");
      onChange("");
    }
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: "relative", ...style }}>
      <input
        type="text"
        value={inputText}
        onChange={e => {
          setInputText(e.target.value);
          setShowSuggestions(true);
          // Typing over a previously-selected value clears the actual
          // selection immediately, so stale results/matches don't
          // linger under a half-edited set name.
          if (value) onChange("");
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => { blurTimeout.current = setTimeout(() => setShowSuggestions(false), 120); }}
        placeholder={placeholder ?? noneLabel}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid var(--border)", fontSize: 13, background: "white" }}
        autoComplete="off"
      />
      {showSuggestions && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 10,
          background: "white", border: "2px solid var(--border)", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", maxHeight: 260, overflowY: "auto",
        }}>
          <button
            onMouseDown={() => { if (blurTimeout.current) clearTimeout(blurTimeout.current); selectOption(null); }}
            style={{
              display: "block", width: "100%", textAlign: "left", padding: "9px 14px",
              border: "none", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: "var(--muted)", fontStyle: "italic",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--cream)")}
            onMouseLeave={e => (e.currentTarget.style.background = "white")}
          >
            {noneLabel}
          </button>
          {suggestions.map(opt => (
            <button
              key={opt.key}
              onMouseDown={() => { if (blurTimeout.current) clearTimeout(blurTimeout.current); selectOption(opt); }}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "9px 14px",
                border: "none", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--cream)")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}
            >
              {opt.label}
            </button>
          ))}
          {suggestions.length === 0 && (
            <div style={{ padding: "9px 14px", fontSize: 13, color: "var(--muted)" }}>No matches</div>
          )}
        </div>
      )}
    </div>
  );
}
