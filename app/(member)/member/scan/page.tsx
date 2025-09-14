"use client";
import { useState } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {CheckmarkBadge01Icon, PinLocation01Icon} from "@hugeicons/core-free-icons"

const qrOptions = [
  {
    token: "qr_04328547b7d89733efbcfbab7dc2b4d2",
    name: "Tom Anderson",
  },
  {
    token: "qr_0ad8b70ad173584f3eb4795ed0d01dc9",
    name: "David Wilson",
  },
  {
    token: "qr_043ioujofkd9834b7d89733efbcfbab7dc2b4d2",
    name: "Muhammad Ihsan Sy",
  },
];

export default function MemberScan() {
  const [selected, setSelected] = useState(qrOptions[0]);

  // Dummy data
  const clubName = "InnerSport YK";
  const daysLeft = 20;
  const validUntil = "17 March 2023";

  return (
    <div className="min-h-screen bg-gradient-to-br  flex flex-col items-center relative pb-8">
      {/* Logo & Notification */}
      <div className="flex justify-between items-center w-full px-6 pt-6">
        <span className="font-extrabold text-white text-xl tracking-wide drop-shadow">
          <Image src="/logo/innersport-logo.svg" alt="Logo" width={200} height={200} />
        </span>
        <div className="relative">
          <button className="bg-white/10 rounded-full p-2 border border-white/10 shadow-lg">
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v.01"/>
              <path d="M12 8v4"/>
            </svg>
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 bg-lime-400 rounded-full border-2 border-slate-900"></span>
        </div>
      </div>

      {/* Dropdown QR Switcher */}
      <div className="w-[92%] max-w-sm mt-8 mb-3">
        <label className="block text-xs text-gray-400 mb-1">Select Member QR</label>
        <Select
          value={selected.token}
          onValueChange={val => {
            const found = qrOptions.find(opt => opt.token === val);
            if (found) setSelected(found);
          }}
        >
          <SelectTrigger className="w-full bg-white/10 border border-white/10 rounded-lg text-white focus:ring-lime-400">
            <SelectValue placeholder="Select QR" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10 text-white">
            {qrOptions.map(opt => (
              <SelectItem key={opt.token} value={opt.token} className="text-white">
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Greeting */}
      <div className="w-full px-6 mb-3">
        <h2 className="text-white text-xl font-semibold drop-shadow">
          Hello, <span className="font-bold text-lime-400">{selected.name}!</span>
        </h2>
      </div>

      {/* QR Card */}
      <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-5 mt-2 mb-6 w-[92%] max-w-sm flex flex-col items-center">
        <div className="w-52 h-52 flex items-center justify-center bg-white rounded-xl shadow-lg">
          <QRCode value={selected.token} size={180} bgColor="#fff" fgColor="#222" />
        </div>
        <div className="text-center text-xs text-gray-400 mt-3">Swipe Up to Close the Barcode</div>
      </div>

      {/* Club Location Card */}
      <div className="w-[92%] max-w-sm bg-white/10 border border-white/10 backdrop-blur-xl rounded-xl flex items-center px-5 py-3 mb-4 gap-2 shadow-lg">
        <HugeiconsIcon strokeWidth={1.2} icon={PinLocation01Icon} size={24} color="#84cc16" />

        <span className="text-white/90 text-base">
          Your location: <span className="font-bold text-lime-400">{clubName}</span>
        </span>
      </div>

      {/* Membership Info Card */}
      <div className="w-[92%] max-w-sm bg-white/10 border border-white/10 backdrop-blur-xl rounded-xl flex items-center px-5 py-4 shadow-lg relative">
        <div className="flex-1">
          <div className="text-white font-bold text-lg mb-1">{daysLeft} Days Left</div>
          <div className="text-xs text-gray-400 mb-2">
            Valid until: <span className="font-semibold text-white/80">{validUntil}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full mb-3">
            <div className="h-2 bg-lime-400 rounded-full transition-all" style={{ width: `${(daysLeft / 30) * 100}%` }} />
          </div>
          <button className="bg-lime-400 hover:bg-lime-300 text-slate-900 font-bold px-5 py-1.5 rounded-lg text-sm shadow transition-all">
            Upgrade
          </button>
        </div>

      </div>
    </div>
  );
}