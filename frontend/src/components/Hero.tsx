import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { SubmitManuscriptDialog } from "./SubmitManuscriptDialog";

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
              World's First Truly Blind Academic Review System
            </span>
          </div>
          
          <h1 className="mb-6 text-5xl font-playfair font-bold leading-tight tracking-tight text-foreground md:text-7xl">
            Cipher Scroll Review
            <br />
            <span className="text-primary">FHE Encrypted & Sealed</span>
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
            Submit your manuscript with FHE encryption. Even you can't see the plaintext.
            <br />
            Only your private key can decrypt it.
            <br className="hidden md:inline" />
            Ultimate privacy protection for academic research.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SubmitManuscriptDialog>
              <Button size="lg" className="gap-2 shadow-envelope">
                <FileText className="h-5 w-5" />
                Encrypt & Submit Manuscript
              </Button>
            </SubmitManuscriptDialog>
            <Button size="lg" variant="outline" className="gap-2 shadow-paper" disabled>
              <Lock className="h-5 w-5" />
              View Encrypted Manuscripts
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-transform hover:scale-105">
              <div className="text-3xl font-playfair font-bold text-primary">
                100%
              </div>
              <div className="text-sm text-muted-foreground">
                FHE Encrypted
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-transform hover:scale-105">
              <div className="text-3xl font-playfair font-bold text-primary">
                Zero
              </div>
              <div className="text-sm text-muted-foreground">
                Plaintext on Chain
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-transform hover:scale-105">
              <div className="text-3xl font-playfair font-bold text-primary">
                Private Key
              </div>
              <div className="text-sm text-muted-foreground">
                Only Decryption Method
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
