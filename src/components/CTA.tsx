import { Button } from "@/components/ui/button";
import { FileText, Shield } from "lucide-react";
import { SubmitManuscriptDialog } from "@/components/SubmitManuscriptDialog";
import { ReviewerApplicationDialog } from "@/components/ReviewerApplicationDialog";

const CTA = () => {
  return (
    <section id="get-started" className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Join the Future of Peer Review
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-6">
            Ready to Experience
            <br />
            <span className="text-primary">Unbiased Academic Review?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Whether you're a researcher seeking objective feedback or an expert reviewer,
            PeerSafe provides the secure infrastructure for trustworthy peer review.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SubmitManuscriptDialog>
              <Button size="lg" className="gap-2 shadow-envelope text-lg px-8">
                <FileText className="h-5 w-5" />
                Submit Your First Manuscript
              </Button>
            </SubmitManuscriptDialog>
            <ReviewerApplicationDialog>
              <Button size="lg" variant="outline" className="gap-2 shadow-paper text-lg px-8">
                <Shield className="h-5 w-5" />
                Apply as Reviewer
              </Button>
            </ReviewerApplicationDialog>
          </div>
          
          <div className="mt-12 p-6 rounded-xl border border-border bg-card/50 backdrop-blur">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Wallet Requirement:</strong> Rainbow Wallet browser extension
              is required for reviewer authentication and manuscript submission.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
