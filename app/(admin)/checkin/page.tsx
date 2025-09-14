"use client";

import { useState, useEffect, useCallback } from "react";
import type { Member } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { QRScanner } from "./qr-scanner";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// --- MemberSearchCheckin component ---
function MemberSearchCheckin({
  onCheckin,
  loading,
}: {
  onCheckin: (token: string) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setSearching(true);
    fetch(`/api/members?search=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => setResults(data?.members || []))
      .finally(() => setSearching(false));
  }, [query]);

  return (
    <div>
      <Input
        placeholder="Search by name, phone, or email..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        className="mb-2"
        disabled={loading}
      />
      {searching && (
        <div className="text-xs text-muted-foreground mb-2">Searching...</div>
      )}
      {results.length > 0 && !selected && (
        <div className="border rounded bg-white max-h-48 overflow-auto shadow-sm">
          {results.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 cursor-pointer"
              onClick={() => setSelected(member)}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={member.photo_url || ""} />
                <AvatarFallback>
                  {member.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{member.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {member.email || member.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- CheckinPage component ---
export default function CheckinPage() {
  const [loading, setLoading] = useState(false);
  const [checkinResult, setCheckinResult] = useState<any | null>(null);
  const [todaysCheckins, setTodaysCheckins] = useState<any[]>([]);
  const [tab, setTab] = useState<"qr" | "manual">("qr");

  const supabase = createClient();

  const loadTodaysCheckins = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data: checkins } = await supabase
      .from("attendance")
      .select(
        `
        id,
        checked_in_at,
        member:members(
          id,
          full_name,
          photo_url
        )
      `
      )
      .gte("checked_in_at", `${today}T00:00:00`)
      .lt("checked_in_at", `${today}T23:59:59`)
      .order("checked_in_at", { ascending: false });
    setTodaysCheckins(checkins || []);
  }, [supabase]);

  const handleCheckin = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (result.success) {
        setCheckinResult(result);
        if (result.checked_out_at) {
          toast.success(`${result.member.full_name} checked out successfully!`);
        } else {
          toast.success(`${result.member.full_name} checked in successfully!`);
        }
        setTimeout(() => loadTodaysCheckins(), 300);
      } else {
        setCheckinResult(result);
        toast.error(result.message || "Check-in failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load today's check-ins on mount
  useEffect(() => {
    loadTodaysCheckins();
  }, [loadTodaysCheckins]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Member Check-in</h1>
        <p className="text-muted-foreground">
          Scan QR codes or enter tokens manually
        </p>
      </div>

      {/* Check-in Result */}
      {checkinResult && (
        <Card
          className={`relative group bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl rounded-2xl mb-4 ${
            checkinResult.success ? "border-green-400/80" : "border-red-400/80"
          }`}
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "1.5px solid rgba(255,255,255,0.13)",
            boxShadow:
              "0 8px 40px 0 rgba(0,0,0,0.18), 0 2px 8px 0 rgba(184,255,0,0.06)",
          }}
        >
          <CardContent className="p-7 flex items-center gap-6">
            {checkinResult.success ? (
              <CheckCircle className="h-14 w-14 text-green-400 drop-shadow" />
            ) : (
              <XCircle className="h-14 w-14 text-red-400 drop-shadow" />
            )}
            <div className="space-y-2">
              {checkinResult.success ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={checkinResult.member?.photo_url || ""}
                      />
                      <AvatarFallback>
                        {checkinResult.member?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-lg text-white">
                      {checkinResult.member?.full_name}
                    </span>
                    <Badge
                      className={
                        checkinResult.status === "active"
                          ? "bg-green-500/90 text-black"
                          : "bg-gray-500/80 text-white"
                      }
                    >
                      {checkinResult.status === "active"
                        ? "Active Member"
                        : "Expired"}
                    </Badge>
                    {checkinResult.checked_in_at && (
                      <div className="flex items-center gap-1 text-base text-white/80">
                        <Clock className="h-5 w-5 text-primary" />
                        {new Date(
                          checkinResult.checked_in_at
                        ).toLocaleTimeString()}
                        <span className="ml-2">IN</span>
                      </div>
                    )}
                    {checkinResult.checked_out_at && (
                      <div className="flex items-center gap-1 text-base text-white/80">
                        <Clock className="h-5 w-5 text-primary" />
                        {new Date(
                          checkinResult.checked_out_at
                        ).toLocaleTimeString()}
                        <span className="ml-2">OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="text-white/80 text-base">
                    {checkinResult.checked_out_at
                      ? "Check-out successful. Sampai jumpa lagi!"
                      : checkinResult.message}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-red-400 drop-shadow">
                    Check-in Failed
                  </h3>
                  <p className="text-white/80 text-base mt-1">
                    {checkinResult.message}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in Methods (tabbed card) */}
      <Card
        className="relative group bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.18)",
          border: "1.5px solid rgba(255,255,255,0.13)",
          boxShadow:
            "0 8px 40px 0 rgba(0,0,0,0.18), 0 2px 8px 0 rgba(184,255,0,0.06)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <span>Member Check-in</span>
          </CardTitle>
          <CardDescription className="text-white/80">
            Scan QR code or search member manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="mb-4">
              <div className="flex gap-2 justify-center">
                <button
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    tab === "qr"
                      ? "bg-primary text-black shadow"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                  onClick={() => setTab("qr")}
                  type="button"
                >
                  QR Scan
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    tab === "manual"
                      ? "bg-primary text-black shadow"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                  onClick={() => setTab("manual")}
                  type="button"
                >
                  Manual Search
                </button>
              </div>
            </div>
            {tab === "qr" && (
              <div>
                <QRScanner onScan={handleCheckin} loading={loading} />
              </div>
            )}
            {tab === "manual" && (
              <div className="dark">
                <MemberSearchCheckin
                  onCheckin={handleCheckin}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Check-ins */}
      <Card
        className="relative group bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl rounded-2xl  overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.18)",
          border: "1.5px solid rgba(255,255,255,0.13)",
          boxShadow:
            "0 8px 40px 0 rgba(0,0,0,0.18), 0 2px 8px 0 rgba(184,255,0,0.06)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <span>Recent Check-ins</span>
          </CardTitle>
          <CardDescription className="text-base text-white/80 mb-2">
            Recent member check-ins
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todaysCheckins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70">No check-ins today</p>
              <Button
                variant="outline"
                onClick={loadTodaysCheckins}
                className="mt-2 rounded-lg border-white/20 bg-white/10 hover:bg-primary/10 text-white shadow"
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysCheckins.map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 shadow group hover:scale-[1.025] hover:shadow-2xl transition-all"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1.5px solid rgba(255,255,255,0.13)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/30 bg-white/10">
                      <AvatarImage src={checkin.member?.photo_url || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {checkin.member?.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white text-lg drop-shadow">
                        {checkin.member?.full_name}
                      </p>
                      <p className="text-sm text-white/70">
                        {new Date(checkin.checked_in_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-400 drop-shadow" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
