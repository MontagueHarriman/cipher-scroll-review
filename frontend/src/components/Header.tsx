import { ConnectButton } from '@rainbow-me/rainbowkit';
import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Cipher Scroll Review" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-playfair font-bold text-foreground">
                Cipher Scroll Review
              </h1>
              <p className="text-xs text-muted-foreground">
                FHE Encrypted Academic Review
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
