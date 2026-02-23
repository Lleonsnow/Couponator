"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <input
        type="search"
        placeholder="Поиск купонов и промокодов..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-slate-200 bg-white py-3 pl-4 pr-12 sm:py-5 sm:pl-6 sm:pr-14 text-sm sm:text-base shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20 min-h-[44px] sm:min-h-0"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white">
        &#128269;
      </span>
    </div>
  );
}
