"use client";

import { useState } from "react";
import { Copy, Download, Mic, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function SpeechGeneratorPage() {
  const [occasion, setOccasion] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("5 minutes");
  const [tone, setTone] = useState("Formal");
  const [extraContext, setExtraContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [speech, setSpeech] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasion.trim() || !topic.trim()) {
      setError("Please fill in Occasion and Topic");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setSpeech("");

    try {
      const res = await fetch("/api/generate-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          occasion,
          topic,
          duration,
          tone,
          extraContext: extraContext || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate speech");
      }
      setSpeech(data.speech);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!speech) return;
    await navigator.clipboard.writeText(speech);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    if (!speech) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Sir Stanley Chiedoziem Amuchie (Ezinwa)", margin, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Occasion: ${occasion}  |  Tone: ${tone}  |  Duration: ${duration}`, margin, 28);

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 32, pageWidth - margin, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(speech, maxLineWidth);
    doc.text(lines, margin, 40);

    doc.save(`speech-${occasion.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <section className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs text-amber-200">
            <Mic className="h-3 w-3" />
            Speech Generator
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            AI Speech Writer
          </h1>
          <p className="text-sm text-zinc-300">
            Generate speeches for Sir Stanley Chiedoziem Amuchie (Ezinwa)
            based on occasion, topic, and tone.
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/50 p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Speech Details
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion / Event</Label>
                <Input
                  id="occasion"
                  placeholder="e.g. Mbaise Cultural Festival, Press Conference, Church Harvest"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Key Message</Label>
                <Input
                  id="topic"
                  placeholder="e.g. Youth empowerment, Infrastructure decay in Imo, Security"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={duration}
                    onValueChange={setDuration}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2 minutes">2 minutes</SelectItem>
                      <SelectItem value="5 minutes">5 minutes</SelectItem>
                      <SelectItem value="10 minutes">10 minutes</SelectItem>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={tone}
                    onValueChange={setTone}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Formal">Formal</SelectItem>
                      <SelectItem value="Motivational">
                        Motivational
                      </SelectItem>
                      <SelectItem value="Cultural / Community">
                        Cultural / Community
                      </SelectItem>
                      <SelectItem value="Political Rally">
                        Political Rally
                      </SelectItem>
                      <SelectItem value="Religious / Thanksgiving">
                        Religious / Thanksgiving
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="extraContext">
                  Extra Context (Optional)
                </Label>
                <Textarea
                  id="extraContext"
                  placeholder="e.g. Audience is 300 market women in Owerri, mention the rice distribution program"
                  value={extraContext}
                  onChange={(e) => setExtraContext(e.target.value)}
                  disabled={isGenerating}
                  rows={4}
                />
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/60 to-red-900/30 p-4 shadow-lg"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.15)_0%,_transparent_50%)] pointer-events-none" />
                    <div className="relative flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-red-500/20 p-1.5">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="flex items-center gap-2 text-sm font-semibold text-red-200">
                          <Sparkles className="h-3.5 w-3.5" />
                          Oops! We hit a little snag
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-red-300/90">
                          {error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-zinc-900 font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating speech...
                  </>
                ) : (
                  "Generate Speech"
                )}
              </Button>
            </form>
          </div>

          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/50 p-5 sm:p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Generated Speech
              </h2>
              {speech && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleExportPdf}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                {!speech && !isGenerating && !error && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full flex-col items-center justify-center gap-4 text-center"
                  >
                    <div className="rounded-full bg-zinc-800/50 p-4">
                      <Sparkles className="h-8 w-8 text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-400">
                      Your generated speech will appear here.
                    </p>
                  </motion.div>
                )}
                {speech && (
                  <motion.div
                    key="speech"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="whitespace-pre-wrap text-sm text-zinc-200 leading-relaxed"
                  >
                    {speech}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
