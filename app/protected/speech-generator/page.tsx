"use client";

import { useState } from "react";
import { Copy, Mic, Loader2 } from "lucide-react";
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

              {error && (
                <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/30 rounded-lg p-3">
                  {error}
                </p>
              )}

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
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {!speech && !isGenerating && !error && (
                <p className="text-sm text-zinc-400">
                  Your generated speech will appear here.
                </p>
              )}
              {speech && (
                <div className="whitespace-pre-wrap text-sm text-zinc-200 leading-relaxed">
                  {speech}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
