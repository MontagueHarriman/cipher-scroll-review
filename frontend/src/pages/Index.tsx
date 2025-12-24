import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import { ManuscriptList } from "@/components/ManuscriptList";
import { Container } from "@/components/ui/container";
import { SubmitManuscriptDialog } from "@/components/SubmitManuscriptDialog";
import { Button } from "@/components/ui/button";
import { FileText, Shield } from "lucide-react";

const Index = () => {
  const [activeView, setActiveView] = useState("home");

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <Hero />;
      case "manuscripts":
        return (
          <Container className="py-8">
            <ManuscriptList />
          </Container>
        );
      case "submit":
        return (
          <Container className="py-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-playfair font-bold mb-4">
                  Submit Manuscript
                </h1>
                <p className="text-muted-foreground">
                  Encrypt and submit your manuscript for review
                </p>
              </div>
              <div className="flex justify-center">
                <SubmitManuscriptDialog>
                  <Button size="lg" className="gap-2">
                    <FileText className="h-5 w-5" />
                    Encrypt & Submit Manuscript
                  </Button>
                </SubmitManuscriptDialog>
              </div>
            </div>
          </Container>
        );
      case "about":
        return (
          <>
            <Container className="py-8">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h1 className="text-4xl font-playfair font-bold mb-4">
                    About Cipher Scroll Review
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">
                    World's First Truly Blind Academic Review System
                  </p>
                </div>
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    Cipher Scroll Review is an MVP that demonstrates end-to-end FHE encryption for academic manuscripts. 
                    Papers are encrypted with FHE before submission, and only the author's private key can decrypt them.
                  </p>
                  <p>
                    <strong className="text-foreground">Key Features:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>FHE Encryption: Manuscripts are encrypted with FHE before blockchain submission</li>
                    <li>Private Key Decryption: Only the author's wallet private key can decrypt their manuscript</li>
                    <li>On-Chain Storage: Encrypted manuscripts are stored on-chain permanently</li>
                    <li>True Blind Review: Even authors cannot see plaintext without decrypting</li>
                  </ul>
                </div>
              </div>
            </Container>
            <Features />
            <HowItWorks />
          </>
        );
      default:
        return <Hero />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <SidebarInset>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-background font-inter">
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Index;
