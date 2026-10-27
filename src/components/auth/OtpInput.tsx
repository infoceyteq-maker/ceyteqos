"use client";

import { useEffect, useRef, useState } from "react";

import { OTP_LENGTH } from "@/lib/otp";

/**
 * Neumorphic inset digit boxes (count = OTP_LENGTH) with auto-advance,
 * backspace navigation and paste support. The joined value is submitted
 * via a hidden input named "token". When `autoSubmit` is on, completing
 * all digits submits the form.
 */
export function OtpInput({ autoSubmit = false }: { autoSubmit?: boolean }) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const submittedFor = useRef<string>("");

  const value = digits.join("");
  const last = OTP_LENGTH - 1;

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!autoSubmit || value.length !== OTP_LENGTH || submittedFor.current === value) return;
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
      cleaned.split("").slice(0, OTP_LENGTH - index).forEach((ch, offset) => {
        next[index + offset] = ch;
      });
      return next;
    });
    const nextIndex = Math.min(index + cleaned.length, last);
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
    } else if (e.key === "ArrowRight" && index < last) {
      refs.current[index + 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    setDigits(Array(OTP_LENGTH).fill("").map((_, i) => text[i] ?? ""));
    refs.current[Math.min(text.length, last)]?.focus();
  }

  return (
    <div>
      <input type="hidden" name="token" value={value} />
      <div className="flex items-center justify-center gap-1.5 sm:gap-3" onPaste={onPaste}>
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
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            className="input-inset h-13 w-9.5 rounded-2xl text-center font-display text-xl font-bold text-navy caret-radium sm:h-16 sm:w-14 sm:text-3xl"
          />
        ))}
      </div>
    </div>
  );
}
