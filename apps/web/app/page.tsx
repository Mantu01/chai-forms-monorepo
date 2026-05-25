import { Sparkles, MousePointerClick, GitBranch, Users, BarChart3, LayoutTemplate, CheckCircle2, Zap, Shield, ShieldCheck, FileCheck, Layers } from "lucide-react";
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
    title: "Tambo AI Form Generation",
    description: "Type a prompt to stream dynamic multi-page form fields and layouts built automatically in real time using Tambo AI.",
    badge: "AI-Powered",
    highlight: true,
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access Control (RBAC)",
    description: "Define Owners, Admins, and Members inside workspaces. Secure your telemetry logs and limit deletion authority.",
    badge: "Secure",
    highlight: false,
  },
  {
    icon: Layers,
    title: "Base64 File Uploads",
    description: "Submit images and documents directly converted into lightweight base64 strings stored securely inside your database.",
    badge: "Premium",
    highlight: false,
  },
  {
    icon: GitBranch,
    title: "Conditional Flow Branching",
    description: "Establish visibility triggers that show or hide form fields reactively depending on input responses.",
    badge: null,
    highlight: false,
  },
  {
    icon: Users,
    title: "Community Stores & Comments",
    description: "Publish layouts as public templates. Allow other organizations to copy layouts and leave feedback inside nested threads.",
    badge: null,
    highlight: false,
  },
  {
    icon: BarChart3,
    title: "Dynamic Analytics Dashboards",
    description: "Track completion rates and telemetry trends using 90d, 30d, and 7d charts grouped by workspace or form inputs.",
    badge: "Interactive",
    highlight: false,
  },
];

const stats = [
  { value: "10k+", label: "Forms Built" },
  { value: "99.99%", label: "Uptime" },
  { value: "Base64", label: "File Conversion" },
  { value: "RBAC", label: "Workspace Safety" },
];

const proofPoints = [
  "No credit card required",
  "Free plan available",
  "Create in under a minute",
  "GDPR compliant",
];

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <Header />
      <div className="w-full max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8">

        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium rounded-full">
                  <Zap className="w-3 h-3 text-primary" />
                  AI-Powered Form Builder
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-bold leading-[1.15] tracking-tight">
                Build Smart Forms.
                <p className="text-primary">Collect Better Data.</p>
                Automate Everything.
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                Create powerful forms in seconds using Tambo AI. From lead capture to complex surveys — with conditional logic, real-time analytics, RBAC permissions, and base64 upload flows built in.
              </p>

              <ActionButton variant="hero" />
            </div>

            <div className="w-full">
              <VideoPreview videoUrl={VIDEO_URL} />
            </div>
          </div>
        </section>

        <Separator className="opacity-50" />

        <section className="py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 text-center">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator className="opacity-50" />

        <section className="py-16 md:py-20">
          <div className="flex flex-col items-center gap-3 text-center mb-12">
            <Badge variant="outline" className="text-xs rounded-full px-3">
              Everything you need
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Powerful features. Zero complexity.
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Every tool you need to build, deploy, and analyze forms — without the learning curve.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description, badge, highlight }) => (
              <Card
                key={title}
                className={`group border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${highlight ? "border-primary/30 bg-primary/5 shadow-sm shadow-primary/10" : "border-border/60 bg-card/60"}`}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-lg w-fit ${highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground transition-colors"}`}>
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
                    <h3 className="text-sm font-semibold leading-tight">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-16 mb-8">
          <div className="rounded-2xl border border-border/60 bg-muted/30 backdrop-blur-sm overflow-hidden">
            <div className="px-6 sm:px-10 py-10 sm:py-14 flex flex-col items-center gap-6 text-center">
              <Badge variant="secondary" className="rounded-full px-3 text-xs">
                Start for free
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight max-w-lg">
                Ready to build forms that actually convert?
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Join thousands of teams using AI to build smarter forms and collect better data.
              </p>
              <ActionButton variant="section" />
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {proofPoints.map((point) => (
                  <span key={point} className="flex items-center gap-1.5 text-xs text-muted-foreground">
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