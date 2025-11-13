import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="PeerSafe Review" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-playfair font-bold text-foreground">
                PeerSafe Review
              </h1>
              <p className="text-xs text-muted-foreground">
                Objective Reviews, Protected by Privacy
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              How It Works
            </Button>
            <Button variant="ghost" className="hidden md:inline-flex">
              For Researchers
            </Button>
            <Button variant="ghost" className="hidden md:inline-flex">
              For Reviewers
            </Button>
            <Button variant="default" className="gap-2">
              <Shield className="h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
