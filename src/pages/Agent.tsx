import NavbarCompact from "@/components/NavbarCompact";
import FooterCompact from "@/components/FooterCompact";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  Users,
  Wallet,
  TrendingUp,
  Smartphone,
  BadgeCheck,
  Clock,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

// Replace with the real WhatsApp number for agent recruitment
const AGENT_WHATSAPP = "256700000000";

const benefits = [
  {
    icon: Wallet,
    title: "Earn Commission",
    description:
      "Get paid a commission for every customer you help subscribe or renew on VJ MAKER.SITE.",
  },
  {
    icon: Smartphone,
    title: "Work From Your Phone",
    description:
      "No office needed. Register customers and process payments using mobile money on your phone.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Income",
    description:
      "The more customers you serve, the more you earn. Build your own customer base in your area.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description:
      "Work whenever you want. Be your own boss and earn on your own schedule.",
  },
];

const steps = [
  {
    number: "1",
    title: "Contact Us",
    description:
      "Reach out on WhatsApp and tell us you want to become a VJ MAKER.SITE agent.",
  },
  {
    number: "2",
    title: "Get Approved",
    description:
      "We register you as an official agent and give you everything you need to start.",
  },
  {
    number: "3",
    title: "Start Earning",
    description:
      "Help customers subscribe, collect payments via mobile money, and earn your commission.",
  },
];

const Agent = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavbarCompact />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/20 via-background to-background border-b border-border">
        <div className="container mx-auto px-4 py-10 lg:py-16 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
            <Users className="w-3.5 h-3.5" />
            Become an Agent
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Earn Money as a <span className="text-primary">VJ MAKER.SITE</span> Agent
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            Join our agent network and earn commission helping people in your
            community subscribe to unlimited translated movies and series.
          </p>
          <a
            href={`https://wa.me/${AGENT_WHATSAPP}?text=${encodeURIComponent(
              "Hi! I want to become a VJ MAKER.SITE agent."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Apply on WhatsApp
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <h2 className="text-lg sm:text-xl font-bold text-foreground text-center mb-6">
          Why Become an Agent?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1.5">
                {benefit.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <h2 className="text-lg sm:text-xl font-bold text-foreground text-center mb-6">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="bg-background border border-border rounded-xl p-5 h-full">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center mb-3">
                    {step.number}
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden sm:block absolute top-1/2 -right-3.5 -translate-y-1/2 w-5 h-5 text-primary z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <BadgeCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              What You Need
            </h2>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              A smartphone with WhatsApp installed
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              A registered mobile money number (MTN or Airtel)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Willingness to serve customers in your area
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              No registration fees — joining is free
            </li>
          </ul>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Ready to start earning? Message us now and we'll get you set up.
            </p>
            <a
              href={`https://wa.me/${AGENT_WHATSAPP}?text=${encodeURIComponent(
                "Hi! I want to become a VJ MAKER.SITE agent."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Become an Agent Today
            </a>
          </div>
        </div>
      </section>

      <FooterCompact />
      <MobileBottomNav />
    </div>
  );
};

export default Agent;
