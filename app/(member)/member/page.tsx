import { BannerSlider } from "@/components/member/banner-slider";
import { HugeiconsIcon } from "@hugeicons/react";
import {CheckmarkBadge01Icon} from "@hugeicons/core-free-icons"

export default function MemberHome() {
  return (
    <div className="p-0 pb-4 min-h-screen">
      <div>
        <BannerSlider />
        {/* Card status club */}
        <div className="px-4 -mt-10 relative z-10">
          <div className="flex items-center bg-background rounded-lg shadow-sm p-2 gap-3 border border-muted/40">
            <div className="bg-primary/10 rounded-full p-2 flex items-center justify-center">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={24} color="#84cc16" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base text-foreground truncate">
                InnerSport ViLas YK
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-muted-foreground font-medium">
                  Sepi
                </span>
              </div>
            </div>
            <button className="ml-2 text-muted-foreground hover:text-primary transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6l6 6-6 6"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Section berikutnya: info membership, quick action, dsb */}
      </div>
    </div>
  );
}
