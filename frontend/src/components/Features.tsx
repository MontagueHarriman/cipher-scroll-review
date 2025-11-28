import { Shield, Eye, Clock, Award, Lock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Military-Grade Encryption",
    description: "Every manuscript is protected with end-to-end encryption, ensuring only authorized parties can access the content.",
  },
  {
    icon: Eye,
    title: "Blind Review Process",
    description: "Reviewers cannot see each other's comments until the designated reveal time, eliminating groupthink.",
  },
  {
    icon: Clock,
    title: "Time-Locked Comments",
    description: "All feedback is cryptographically sealed with time-locks, preventing premature disclosure.",
  },
  {
    icon: Award,
    title: "Verified Reviewers",
    description: "Rainbow Wallet authentication ensures only qualified, verified reviewers participate in the process.",
  },
  {
    icon: Lock,
    title: "Tamper-Proof Records",
    description: "Blockchain technology creates an immutable record of all review activities and timestamps.",
  },
  {
    icon: Zap,
    title: "Instant Reveal",
    description: "When the cycle completes, all sealed reviews are revealed simultaneously in a single moment.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-playfair font-bold text-foreground mb-4">
            Privacy-First Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built on principles of cryptographic security and scholarly integrity
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group shadow-paper hover:shadow-envelope transition-all duration-300 border-border bg-card"
              >
                <CardContent className="p-8">
                  <div className="mb-4 inline-flex p-4 rounded-xl bg-gradient-seal">
                    <Icon className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-playfair font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
