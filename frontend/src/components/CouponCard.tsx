import Link from "next/link";

type Props = {
  id: string;
  title: string;
  category: string;
  city: string;
  price: number;
  imageUrl: string;
};

export function CouponCard({ id, title, category, city, price, imageUrl }: Props) {
  return (
    <Link
      href={`/coupon/${id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1.5 hover:shadow-md"
    >
      <img
        src={imageUrl}
        alt=""
        className="aspect-video w-full object-cover bg-slate-100"
      />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 sm:mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-primary truncate">
            {category}
          </span>
          <span className="rounded-full bg-[var(--bg)] px-2.5 py-1 text-xs font-medium text-[var(--muted)] shrink-0">
            {city}
          </span>
        </div>
        <h3 className="mb-3 sm:mb-4 line-clamp-2 flex-1 text-sm sm:text-base font-semibold leading-snug">
          {title}
        </h3>
        <p className="mt-auto text-lg sm:text-xl font-extrabold">От {price} ₽</p>
      </div>
    </Link>
  );
}
