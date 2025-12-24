import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SidebarTrigger } from "@/components/ui/sidebar";
import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger />
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
        <div className="ml-auto flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
