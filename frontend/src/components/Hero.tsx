import { Shield } from "lucide-react";
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
      <div className="container relative z-10 mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-4xl animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">
              World's First Truly Blind Academic Review System
            </span>
          </div>
          
          <h1 className="mb-6 text-4xl font-playfair font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            Cipher Scroll Review
            <br />
            <span className="text-primary">FHE Encrypted & Sealed</span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Submit your manuscript with FHE encryption. Even you can't see the plaintext.
            <br />
            Only your private key can decrypt it.
            <br className="hidden md:inline" />
            Ultimate privacy protection for academic research.
          </p>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg cursor-pointer">
              <div className="text-3xl font-playfair font-bold text-primary">
                100%
              </div>
              <div className="text-sm text-muted-foreground">
                FHE Encrypted
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg cursor-pointer">
              <div className="text-3xl font-playfair font-bold text-primary">
                Zero
              </div>
              <div className="text-sm text-muted-foreground">
                Plaintext on Chain
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg cursor-pointer">
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
    </section>
  );
};

export default Hero;
