"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreateEmpowermentProgramInput } from "@/app/programs/actions";

const programTypeOptions: Array<CreateEmpowermentProgramInput["program_type"]> = [
  "youth_leadership",
  "rice_food_distributions",
  "agricultural_skills",
  "philanthropy_empowerment",
  "other",
];

function programTypeLabel(type: CreateEmpowermentProgramInput["program_type"]) {
  switch (type) {
    case "youth_leadership":
      return "Youth Leadership";
    case "rice_food_distributions":
      return "Rice & Food";
    case "agricultural_skills":
      return "Agricultural Skills";
    case "philanthropy_empowerment":
      return "Empowerment";
    default:
      return "Other";
  }
}

export function ProgramFilters({
  initialProgramType,
  initialLga,
  initialDate,
}: {
  initialProgramType?: CreateEmpowermentProgramInput["program_type"] | "";
  initialLga?: string | "";
  initialDate?: string | "";
}) {
  const router = useRouter();
  const [programType, setProgramType] = useState(initialProgramType || "all");
  const [lga, setLga] = useState(initialLga || "");
  const [date, setDate] = useState(initialDate || "");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-4 backdrop-blur">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Program Type</Label>
          <Select
            value={programType}
            onValueChange={(v) => setProgramType(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programTypeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {programTypeLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>LGA</Label>
          <Input
            value={lga}
            onChange={(e) => setLga(e.target.value)}
            placeholder="e.g. Owerri Municipal"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          type="button"
          disabled={isPending}
          onClick={() => {
            const params = new URLSearchParams();
            params.set("tab", "all");
            if (programType && programType !== "all") {
              params.set("program_type", programType);
            }
            if (lga) params.set("lga", lga);
            if (date) params.set("date", date);
            startTransition(() => {
              router.push(`/programs?${params.toString()}`);
            });
          }}
          className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-zinc-900"
        >
          Apply filters
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            startTransition(() => router.push("/programs?tab=all"));
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

