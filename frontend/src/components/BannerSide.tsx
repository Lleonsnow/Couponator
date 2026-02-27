"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { apiUrl } from "@/lib/api";

type Banner = { id: string; html: string };

export function BannerSide() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/banners?slot=SIDE"))
      .then((r) => r.json())
      .then((data: Banner[]) => {
        const arr = Array.isArray(data) ? data : [];
        if (arr.length === 0) return null;
        if (arr.length === 1) return arr[0];
        return arr[Math.floor(Math.random() * arr.length)];
      })
      .then(setBanner)
      .catch(() => setBanner(null));
  }, []);

  if (!banner || !banner.html.trim()) return null;

  const sanitized = DOMPurify.sanitize(banner.html, {
    ALLOWED_TAGS: ["a", "img"],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "width", "height", "border"],
  });

  return (
    <div className="flex w-full justify-center rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm [&_a]:block [&_img]:block" dangerouslySetInnerHTML={{ __html: sanitized }} />
  );
}
