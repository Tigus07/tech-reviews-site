// app/hook/useAutoScroll.js
"use client";
import * as React from "react";

const DEFAULT_MS = 4000;

export default function useAutoScroll(ref, { interval = DEFAULT_MS } = {}) {
  const [paused, setPaused] = React.useState(false);
  const indexRef = React.useRef(0);

  const snapTo = (i) => {
    const rail = ref.current;
    if (!rail || !rail.firstElementChild) return;

    const first = rail.firstElementChild;
    const cardW = first.getBoundingClientRect().width;
    const gap =
      parseFloat(getComputedStyle(rail).columnGap || 0) ||
      parseFloat(getComputedStyle(rail).gap || 0) ||
      0;

    rail.scrollTo({
      left: Math.round(i) * Math.round(cardW + gap),
      behavior: "smooth",
    });
  };

  // Synchronise l'index quand l'utilisateur scrolle manuellement
  React.useEffect(() => {
    const rail = ref.current;
    if (!rail || !rail.firstElementChild) return;

    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const first = rail.firstElementChild;
        const cardW = first.getBoundingClientRect().width;
        const gap =
          parseFloat(getComputedStyle(rail).columnGap || 0) ||
          parseFloat(getComputedStyle(rail).gap || 0) ||
          0;
        const i = Math.round(rail.scrollLeft / Math.max(1, cardW + gap));
        indexRef.current = i;
      });
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      rail.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);

  // Avance auto
  React.useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    // Respecte prefers-reduced-motion
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) return;

    const count = rail.children.length || 0;
    const id = setInterval(() => {
      if (paused || !count) return;
      indexRef.current = (indexRef.current + 1) % count;
      snapTo(indexRef.current);
    }, Math.max(1500, interval));

    return () => clearInterval(id);
  }, [ref, paused, interval]);

  // Pause/reprise selon interactions (survol, drag, focus)
  React.useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    const pause = () => setPaused(true);
    const resume = () => setPaused(false);

    rail.addEventListener("mouseenter", pause);
    rail.addEventListener("mouseleave", resume);
    rail.addEventListener("pointerdown", pause);
    window.addEventListener("pointerup", resume);
    rail.addEventListener("focusin", pause);
    rail.addEventListener("focusout", resume);

    return () => {
      rail.removeEventListener("mouseenter", pause);
      rail.removeEventListener("mouseleave", resume);
      rail.removeEventListener("pointerdown", pause);
      window.removeEventListener("pointerup", resume);
      rail.removeEventListener("focusin", pause);
      rail.removeEventListener("focusout", resume);
    };
  }, [ref]);
}
