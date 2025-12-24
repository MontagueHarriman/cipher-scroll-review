import { FileUp, Users, Lock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: FileUp,
    title: "Submit Encrypted Manuscript",
    description: "Researchers upload their work with end-to-end encryption, ensuring complete confidentiality from the start.",
  },
  {
    icon: Users,
    title: "Assigned to Reviewers",
    description: "Verified reviewers receive the encrypted manuscript through our secure platform with wallet authentication.",
  },
  {
    icon: Lock,
    title: "Sealed Review Process",
    description: "All reviewer comments are cryptographically sealed and hidden from everyone, including other reviewers.",
  },
  {
    icon: CheckCircle,
    title: "Simultaneous Reveal",
    description: "Once the review cycle ends, all comments are revealed simultaneously, ensuring unbiased evaluation.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-paper">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-playfair font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A transparent process built on cryptographic trust
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="relative p-8 shadow-paper hover:shadow-envelope transition-all duration-300 hover:-translate-y-2 bg-card border-border active:scale-95"
              >
                <div className="absolute -top-4 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-lg">
                  {index + 1}
                </div>
                <div className="mt-8 mb-4">
                  <div className="inline-flex p-3 rounded-lg bg-secondary">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-playfair font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
