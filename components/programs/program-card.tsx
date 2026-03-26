"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type program_type =
  | "youth_leadership"
  | "rice_food_distributions"
  | "agricultural_skills"
  | "philanthropy_empowerment"
  | "other";

export type ProgramCardProps = {
  id: string;
  title: string;
  description: string;
  program_type: program_type;
  date: string; // ISO
  location: string;
  lga?: string | null;
  beneficiary_count: number;
  thumbnailUrl?: string | null;
};

function programTypeLabel(type: program_type) {
  switch (type) {
    case "youth_leadership":
      return "Youth Leadership";
    case "rice_food_distributions":
      return "Rice & Food Distributions";
    case "agricultural_skills":
      return "Agricultural Skills";
    case "philanthropy_empowerment":
      return "Empowerment / Philanthropy";
    default:
      return "Other";
  }
}

export function ProgramCard(props: ProgramCardProps) {
  const dateObj = new Date(props.date);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="group overflow-hidden rounded-3xl border border-amber-300/20 bg-zinc-900/40 backdrop-blur"
    >
      <div className="relative h-40 w-full bg-gradient-to-br from-emerald-950 via-zinc-950 to-amber-950">
        {props.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.thumbnailUrl}
            alt={props.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center">
            <div className="space-y-2">
              <div className="mx-auto h-10 w-10 rounded-2xl border border-amber-300/30 bg-amber-300/10" />
              <p className="text-xs text-zinc-300">
                No approved media yet
              </p>
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4">
          <Badge className="border-amber-300/40 bg-amber-300/10 text-amber-200">
            {programTypeLabel(props.program_type)}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-base font-extrabold text-white">
          {props.title}
        </h3>

        <p className="line-clamp-2 text-sm text-zinc-300">
          {props.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {dateObj.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {props.lga ? `${props.lga} • ` : ""}
            {props.location}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-zinc-400">
            Beneficiaries:{" "}
            <span className="font-bold text-amber-200">
              {props.beneficiary_count.toLocaleString()}
            </span>
          </div>
          <Link
            href={`/programs/${props.id}`}
            className="rounded-xl border border-amber-300/30 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-amber-200 transition group-hover:bg-zinc-900/60"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

