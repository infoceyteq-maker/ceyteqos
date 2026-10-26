"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Six neumorphic inset digit boxes with auto-advance, backspace navigation
 * and paste support. The joined value is submitted via a hidden input named
 * "token". When `autoSubmit` is on, completing all six digits submits.
 */
export function OtpInput({ autoSubmit = false }: { autoSubmit?: boolean }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const submittedFor = useRef<string>("");

  const value = digits.join("");

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!autoSubmit || value.length !== 6 || submittedFor.current === value) return;
    submittedFor.current = value;
    const form = refs.current[0]?.closest("form");
    const t = setTimeout(() => form?.requestSubmit(), 250);
    return () => clearTimeout(t);
  }, [value, autoSubmit]);

  function setDigit(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigits((d) => d.map((v, i) => (i === index ? "" : v)));
      return;
    }
    // Typing or pasting multiple digits fills forward from this box.
    setDigits((d) => {
      const next = [...d];
      cleaned.split("").slice(0, 6 - index).forEach((ch, offset) => {
        next[index + offset] = ch;
      });
      return next;
    });
    const nextIndex = Math.min(index + cleaned.length, 5);
    refs.current[nextIndex]?.focus();
    refs.current[nextIndex]?.select();
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigits((d) => d.map((v, i) => (i === index ? "" : v)));
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        setDigits((d) => d.map((v, i) => (i === index - 1 ? "" : v)));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      refs.current[index + 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    setDigits(Array(6).fill("").map((_, i) => text[i] ?? ""));
    refs.current[Math.min(text.length, 5)]?.focus();
  }

  return (
    <div>
      <input type="hidden" name="token" value={value} />
      <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={onPaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={digit}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of 6`}
            className="input-inset h-14 w-11 rounded-2xl text-center font-display text-2xl font-bold text-navy caret-radium sm:h-16 sm:w-14 sm:text-3xl"
          />
        ))}
      </div>
    </div>
  );
}
