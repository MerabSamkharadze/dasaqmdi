"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase } from "lucide-react";

export function AuthSearchBar({
  placeholder,
  buttonLabel,
  locationPlaceholder,
}: {
  placeholder: string;
  buttonLabel: string;
  locationPlaceholder: string;
}) {
  const router = useRouter();
  const queryRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const q = queryRef.current?.value.trim();
    const city = cityRef.current?.value.trim();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full rounded-2xl bg-white/10 backdrop-blur-sm p-2"
    >
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            ref={queryRef}
            placeholder={placeholder}
            className="w-full h-10 rounded-xl bg-white/10 border border-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white/15 focus:border-white/40 focus:ring-[1.5px] focus:ring-white/20 transition-all duration-150"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              ref={cityRef}
              placeholder={locationPlaceholder}
              className="w-full h-10 rounded-xl bg-white/10 border border-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white/15 focus:border-white/40 focus:ring-[1.5px] focus:ring-white/20 transition-all duration-150"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-5 rounded-xl btn-gradient text-sm transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="h-4 w-4 inline-block mr-1.5" />
            {buttonLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
