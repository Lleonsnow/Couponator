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
        className="w-full rounded-full border border-slate-200 bg-white py-5 pl-6 pr-14 text-base shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white">
        &#128269;
      </span>
    </div>
  );
}
