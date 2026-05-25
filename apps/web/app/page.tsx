import {Sparkles,MousePointerClick,GitBranch,Users,BarChart3,LayoutTemplate,CheckCircle2,Zap,} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import VideoPreview from "~/components/home/video-preview";
import ActionButton from "~/components/home/action-button";
import Header from '~/components/layout/header';
import Footer from '~/components/layout/footer';

const VIDEO_URL = "https://res.cloudinary.com/dqznmhhtv/video/upload/v1779300873/samples/dance-2.mp4";


const features = [
  {
    icon: Sparkles,
    title: "AI Form Generator",
    description: "Describe your form in plain text. AI builds the entire structure, fields, and logic in seconds.",
    badge: "AI-Powered",
    highlight: true,
  },
  {
    icon: MousePointerClick,
    title: "Drag & Drop Builder",
    description: "Intuitive visual editor. Rearrange fields, configure options, and preview in real time.",
    badge: null,
    highlight: false,
  },
  {
    icon: GitBranch,
    title: "Conditional Logic",
    description: "Show or hide fields dynamically. Build smart branching workflows without writing code.",
    badge: null,
    highlight: false,
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite teammates, assign roles, and co-edit forms with real-time sync.",
    badge: null,
    highlight: false,
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track completion rates, drop-offs, and response trends with built-in dashboards.",
    badge: null,
    highlight: false,
  },
  {
    icon: LayoutTemplate,
    title: "Templates",
    description: "Start from 100+ professionally designed templates across every industry and use case.",
    badge: "100+",
    highlight: false,
  },
];

const stats = [
  { value: "10k+", label: "Forms Created" },
  { value: "99.9%", label: "Uptime" },
  { value: "50+", label: "Integrations" },
  { value: "4.9★", label: "User Rating" },
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
      <Header/>
      <div className="w-full max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8">

        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium rounded-full">
                  <Zap className="w-3 h-3" />
                  AI-Powered Form Builder
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-bold leading-[1.15] tracking-tight">
                Build Smart Forms.
                <p className="text-primary">Collect Better Data.</p>
                Automate Everything.
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                Create powerful forms in seconds using AI. From lead capture to complex surveys — with conditional logic, real-time analytics, and seamless integrations built in.
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
    </div>
  );
}