import { Sparkles, MousePointerClick, GitBranch, Users, BarChart3, LayoutTemplate, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import VideoPreview from "~/components/home/video-preview";
import ActionButton from "~/components/home/action-button";
import Header from "~/components/layout/header";
import Footer from "~/components/layout/footer";

const VIDEO_URL = "https://res.cloudinary.com/dqznmhhtv/video/upload/v1779300873/samples/dance-2.mp4";

const features = [
  {
    icon: Sparkles,
    title: "Tambo AI Builder",
    description: "Describe your requirements. AI formats fields, inserts pages, and designs accent themes in real-time.",
    badge: "AI-Powered",
    highlight: true,
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work side-by-side with workspace members. Co-manage templates, reviews, and dynamic boards.",
    badge: "Real-time",
    highlight: false,
  },
  {
    icon: ShieldCheck,
    title: "RBAC Security",
    description: "Control access level rights. Assign Owner, Admin, and Member roles with secure private views.",
    badge: "Enterprise",
    highlight: false,
  },
  {
    icon: MousePointerClick,
    title: "Clean Visual Setup",
    description: "Construct questions, format choices, and preview responses on our mock layout panels.",
    badge: null,
    highlight: false,
  },
  {
    icon: GitBranch,
    title: "Conditional Paging",
    description: "Branch form fields dynamically. Hide or show pages based on current collected answers.",
    badge: null,
    highlight: false,
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Filter workspaces and specific forms. View monthly conversion trends and export CSV logs.",
    badge: "New",
    highlight: false,
  },
];

const stats = [
  { value: "10k+", label: "Forms Generated" },
  { value: "99.99%", label: "Platform Uptime" },
  { value: "4.9★", label: "G2 User Rating" },
  { value: "Instant", label: "Deployment Speed" },
];

const proofPoints = [
  "No credit card required",
  "Free plan available",
  "Tambo AI builder integration",
  "GDPR compliant logs",
];

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden bg-zinc-950 text-white [background:radial-gradient(ellipse_60%_50%_at_50%_0%,#18181b,transparent),radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),transparent)]">
      <Header />
      
      <div className="w-full max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-zinc-900 border-zinc-800 text-zinc-350">
                  <Zap className="w-3 h-3 text-primary animate-pulse" />
                  AI & Collaboration Powered
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-bold leading-[1.15] tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Create Smart Forms.
                <p className="text-primary mt-1">Co-Edit in Real-Time.</p>
                Automate Everything.
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg">
                Build sophisticated, premium forms in seconds with the Tambo AI Builder. Co-edit form rules with workspace colleagues, assign roles, track conversion rates, and export submissions instantly.
              </p>

              <ActionButton variant="hero" />
            </div>

            <div className="w-full border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/10 backdrop-blur-xs">
              <VideoPreview videoUrl={VIDEO_URL} />
            </div>
          </div>
        </section>

        <Separator className="opacity-10 bg-zinc-700" />

        <section className="py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-450 bg-clip-text text-transparent">{value}</span>
                <span className="text-[11px] font-mono text-zinc-550 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator className="opacity-10 bg-zinc-700" />

        <section className="py-16 md:py-20">
          <div className="flex flex-col items-center gap-3 text-center mb-12">
            <Badge variant="outline" className="text-xs rounded-full px-3 border-zinc-800 text-zinc-400 bg-zinc-900/40">
              Integrated Workspace Suite
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Powerful features. Zero coding.
            </h2>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              Every tool you need to generate layouts, evaluate conditional branches, assign member roles, and review feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description, badge, highlight }) => (
              <Card
                key={title}
                className={`group border transition-all duration-300 hover:border-zinc-700/60 ${highlight ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10" : "border-zinc-850 bg-zinc-900/20 backdrop-blur-md"}`}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-lg w-fit ${highlight ? "bg-primary/20 text-primary" : "bg-zinc-950 text-zinc-400 group-hover:text-white transition-colors"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {badge && (
                      <Badge
                        variant={highlight ? "default" : "secondary"}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                      >
                        {badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold leading-tight text-zinc-150">{title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-16 mb-8">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-md overflow-hidden">
            <div className="px-6 sm:px-10 py-10 sm:py-14 flex flex-col items-center gap-6 text-center">
              <Badge variant="secondary" className="rounded-full px-3 text-xs bg-zinc-950 border-zinc-800 text-zinc-400">
                Start for free
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight max-w-lg bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Ready to collect better data?
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Join modern product teams using ChaiForm to build smarter flows, control RBAC access, and analyze results.
              </p>
              <ActionButton variant="section" />
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {proofPoints.map((point) => (
                  <span key={point} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}