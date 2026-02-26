"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { apiUrl } from "@/lib/api";

type Banner = { id: string; html: string };

export function BannerTop() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/banners?slot=TOP"))
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
    <div className="flex justify-center py-3 sm:py-4">
      <div className="max-w-[var(--container)] w-full flex justify-center [&_img]:max-w-full [&_img]:h-auto" dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  );
}
