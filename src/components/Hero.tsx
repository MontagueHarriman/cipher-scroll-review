import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/20" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-32 text-center">
        <div className="mx-auto max-w-4xl animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">
              Rainbow Wallet Required for Reviewer Verification
            </span>
          </div>
          
          <h1 className="mb-6 text-5xl font-playfair font-bold leading-tight tracking-tight text-foreground md:text-7xl">
            Objective Reviews,
            <br />
            <span className="text-primary">Protected by Privacy</span>
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
            Researchers submit encrypted manuscripts for peer review.
            <br />
            Reviewers' comments remain hidden until the review cycle concludes,
            <br className="hidden md:inline" />
            ensuring unbiased evaluations.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 shadow-envelope">
              <FileText className="h-5 w-5" />
              Submit Manuscript
            </Button>
            <Button size="lg" variant="outline" className="gap-2 shadow-paper">
              <Lock className="h-5 w-5" />
              Become a Reviewer
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-transform hover:scale-105">
              <div className="text-3xl font-playfair font-bold text-primary">
                100%
              </div>
              <div className="text-sm text-muted-foreground">
                Encrypted Submissions
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-transform hover:scale-105">
              <div className="text-3xl font-playfair font-bold text-primary">
                Zero
              </div>
              <div className="text-sm text-muted-foreground">
                Bias Interference
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-transform hover:scale-105">
              <div className="text-3xl font-playfair font-bold text-primary">
                Sealed
              </div>
              <div className="text-sm text-muted-foreground">
                Until Complete
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-12 w-8 rounded-full border-2 border-primary/30">
          <div className="mx-auto mt-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
