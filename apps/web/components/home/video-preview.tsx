import { Badge } from "~/components/ui/badge";

interface VideoPreviewProps {
  videoUrl: string;
}

export default function VideoPreview({videoUrl,}: VideoPreviewProps) {
  return (
    <div className="w-full">
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_20px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/5">
        
        {/* Top Bar */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/3 px-4 py-3 backdrop-blur-xl">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

          <div className="mx-auto">
            <div className="rounded-full border border-white/10 bg-white/4 px-4 py-1 text-xs text-white/60 shadow-inner">
              chaiform.com/builder
            </div>
          </div>

          <Badge
            variant="secondary"
            className="border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-300"
          >
            LIVE
          </Badge>
        </div>

        {/* Video */}
        <div className="relative aspect-video overflow-hidden bg-black">
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />

          {/* Glow */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-white/3" />

          {/* Bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}