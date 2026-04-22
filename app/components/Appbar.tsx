"use client";

import { usePathname } from "next/navigation";
import { PrimaryButton } from "./core/Button";
import { useRouter } from "next/navigation";
import DepositModal from "./Deposit_button";

export const Appbar = () => {
  const route = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-white/10 bg-black/95 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-7">
          <button
            type="button"
            className="flex items-center gap-2.5"
            onClick={() => router.push("/")}
          >
            <div className="w-6 h-6 bg-black flex items-center justify-center rounded-sm border border-white/20">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="21" y1="24" x2="21" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <polyline points="16.5,14.5 21,10 25.5,14.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="11" y1="8" x2="11" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <polyline points="6.5,17.5 11,22 15.5,17.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              Exchange
            </span>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {[
              { label: "Markets",     path: "/markets",       match: "/markets" },
              { label: "TATA Market", path: "/trade/TATA_INR", match: "/trade/TATA_INR" },
            ].map(({ label, path, match }) => {
              const active = route.startsWith(match);
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => router.push(path)}
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                    active
                      ? "text-white bg-white/10"
                      : "text-white/45 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <DepositModal />
          <PrimaryButton>Withdraw</PrimaryButton>
        </div>
      </div>
    </header>
  );
};
