"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

/** Optionnel : autoriser les images Amazon (voir next.config.js) */
function isAmazonHost(u) {
  try {
    const { hostname } = new URL(u);
    return /(^|\.)m\.media-amazon\.com$/i.test(hostname) || /(^|\.)images-na\.ssl-images-amazon\.com$/i.test(hostname);
  } catch {
    return false;
  }
}

export default function ImageGallery({ images = [], main = null, alt = "" }) {
  // Concatène main + gallery, dédoublonne et nettoie :
  const all = useMemo(() => {
    const arr = [main, ...(Array.isArray(images) ? images : [])].filter(Boolean);
    const uniq = Array.from(new Set(arr));
    return uniq;
  }, [images, main]);

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // zoom & pan
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  const total = all.length;
  const current = total ? all[idx] : null;

  const openAt = useCallback((i) => {
    setIdx(i);
    setOpen(true);
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % total);
    setScale(1);
    setTx(0);
    setTy(0);
  }, [total]);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + total) % total);
    setScale(1);
    setTx(0);
    setTy(0);
  }, [total]);

  const zoomIn = useCallback(() => setScale((s) => Math.min(4, +(s + 0.25).toFixed(2))), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(1, +(s - 0.25).toFixed(2))), []);
  const resetZoom = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const onPointerDown = (e) => {
    if (scale <= 1) return;
    draggingRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    setTx((v) => v + dx);
    setTy((v) => v + dy);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onDoubleClick = () => {
    setScale((s) => (s === 1 ? 2 : 1));
    if (scale === 1) {
      setTx(0);
      setTy(0);
    }
  };

  // raccourcis clavier
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, prev, next]);

  if (!total) return null;

  return (
    <div className="mb-8">
      {/* Vignettes carrées */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {all.map((src, i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            className="relative w-full aspect-square rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Open image ${i + 1}`}
          >
            <Image
              src={src}
              alt={alt || `Gallery image ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className="object-cover object-center"
              unoptimized={isAmazonHost(src)} // évite erreurs si Next ne connaît pas le domaine
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open && current && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <div className="text-sm opacity-80">
              {idx + 1} / {total}
            </div>
            <div className="space-x-2">
              <button
                onClick={zoomOut}
                className="px-3 py-1 bg-white/10 rounded hover:bg-white/20"
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                onClick={resetZoom}
                className="px-3 py-1 bg-white/10 rounded hover:bg-white/20"
                aria-label="Reset zoom"
              >
                100%
              </button>
              <button
                onClick={zoomIn}
                className="px-3 py-1 bg-white/10 rounded hover:bg-white/20"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                onClick={close}
                className="ml-2 px-3 py-1 bg-white/20 rounded hover:bg-white/30"
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>

          {/* Image area */}
          <div className="relative flex-1 overflow-hidden">
            {/* Prev */}
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10"
              aria-label="Previous image"
            >
              ‹
            </button>

            {/* Next */}
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10"
              aria-label="Next image"
            >
              ›
            </button>

            {/* Zoomable container */}
            <div
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onDoubleClick={onDoubleClick}
            >
              <div
                className="relative w-full h-full"
                style={{
                  transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
                  transition: draggingRef.current ? "none" : "transform 120ms ease-out",
                }}
              >
                <Image
                  src={current}
                  alt={alt || `Enlarged image ${idx + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain object-center"
                  priority
                  unoptimized={isAmazonHost(current)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
