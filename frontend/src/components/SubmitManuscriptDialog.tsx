import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Lock } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useRainbowEthersSigner } from "@/hooks/useRainbowEthersSigner";
import { useFHEManuscript } from "@/hooks/useFHEManuscript";

interface SubmitManuscriptDialogProps {
  children: React.ReactNode;
}

export const SubmitManuscriptDialog = ({ children }: SubmitManuscriptDialogProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const { isConnected } = useAccount();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  
  const {
    provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    userAddress,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useRainbowEthersSigner();

  console.log("[SubmitManuscriptDialog] Render, isConnected:", isConnected, "chainId:", chainId, "provider:", typeof provider === "string" ? provider : provider ? "Eip1193Provider" : "undefined");
  
  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: isConnected,
  });
  
  console.log("[SubmitManuscriptDialog] FHEVM status:", fhevmStatus, "error:", fhevmError);

  const {
    canSubmit,
    isSubmitting,
    message,
    submitManuscript,
    refreshManuscripts,
  } = useFHEManuscript({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    userAddress,
    sameChain,
    sameSigner,
  });

  useEffect(() => {
    if (open && isConnected) {
      refreshManuscripts();
    }
  }, [open, isConnected, refreshManuscripts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter manuscript content");
      return;
    }

    const contentBytes = ethers.toUtf8Bytes(content);
    if (contentBytes.length === 0) {
      toast.error("Please enter manuscript content");
      return;
    }

    try {
      await submitManuscript(content);
      toast.success("Manuscript submitted successfully! Your work has been encrypted and sealed.");
      setOpen(false);
      setContent("");
    } catch (error: any) {
      toast.error(`Submission failed: ${error.message || "Unknown error"}`);
    }
  };

  const isReady = fhevmStatus === "ready" && canSubmit && !isSubmitting;
  const isLoading = fhevmStatus === "loading" || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair">Encrypt & Submit Manuscript</DialogTitle>
          <DialogDescription>
            Your manuscript will be encrypted with FHE before submission. Only you can decrypt it with your private key.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">Manuscript Content</Label>
            <Textarea
              id="content"
              placeholder="Enter your manuscript content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              Content will be encrypted with FHE before submission
            </p>
          </div>

          {fhevmStatus === "error" && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                FHEVM Error: {fhevmError?.message || "Unknown error"}
              </p>
            </div>
          )}

          {message && isConnected && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {!isConnected && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Please connect your wallet to submit a manuscript
              </p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1 gap-2" 
              disabled={!isReady || isLoading}
            >
              {isLoading ? (
                <>
                  <Lock className="h-4 w-4 animate-spin" />
                  {isSubmitting ? "Encrypting & Submitting..." : "Initializing FHE..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Encrypt & Submit
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
