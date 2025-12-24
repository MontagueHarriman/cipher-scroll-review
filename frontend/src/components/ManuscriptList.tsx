import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, FileText, Clock } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useRainbowEthersSigner } from "@/hooks/useRainbowEthersSigner";
import { useFHEManuscript } from "@/hooks/useFHEManuscript";
import { formatDistanceToNow } from "date-fns";

export const ManuscriptList = () => {
  const { isConnected, address } = useAccount();
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

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: isConnected,
  });

  const {
    manuscripts,
    decryptedManuscripts,
    isDecrypting,
    message,
    decryptManuscript,
    refreshManuscripts,
    getAuthorManuscripts,
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
    if (isConnected && address) {
      // Add a small delay to ensure network has stabilized after switch
      const timeoutId = setTimeout(() => {
        getAuthorManuscripts();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Clear manuscripts when disconnected
      if (manuscripts.length > 0) {
        // This will be handled by the hook, but we can also clear here
      }
    }
  }, [isConnected, address, getAuthorManuscripts]);

  const handleDecrypt = async (manuscriptId: number) => {
    try {
      await decryptManuscript(manuscriptId);
      toast.success("Manuscript decrypted successfully!");
    } catch (error: any) {
      toast.error(`Decryption failed: ${error.message || "Unknown error"}`);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Manuscripts</CardTitle>
          <CardDescription>Connect your wallet to view your manuscripts</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (manuscripts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Manuscripts</CardTitle>
          <CardDescription>You haven't submitted any manuscripts yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-playfair font-bold">My Manuscripts</h2>
        <Button variant="outline" onClick={refreshManuscripts}>
          Refresh
        </Button>
      </div>

      {message && (
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      )}

      <div className="grid gap-4">
        {manuscripts.map((manuscript) => {
          const isDecrypted = decryptedManuscripts.has(manuscript.id);
          const decryptedContent = decryptedManuscripts.get(manuscript.id);
          const isAuthor = manuscript.author.toLowerCase() === address?.toLowerCase();

          return (
            <Card key={manuscript.id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Manuscript #{manuscript.id.toString().padStart(3, "0")}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(manuscript.timestamp * 1000), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Encrypted & Sealed
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isDecrypted && decryptedContent ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Unlock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Decrypted Content</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{decryptedContent}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Encrypted Content</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        Encrypted array ({Array.isArray(manuscript.encryptedContent) ? manuscript.encryptedContent.length : 0} bytes)
                      </p>
                    </div>
                    {isAuthor && (
                      <Button
                        onClick={() => handleDecrypt(manuscript.id)}
                        disabled={isDecrypting}
                        className="w-full"
                        variant="default"
                      >
                        {isDecrypting ? (
                          <>
                            <Lock className="h-4 w-4 mr-2 animate-spin" />
                            Decrypting...
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Decrypt & View My Manuscript
                          </>
                        )}
                      </Button>
                    )}
                    {!isAuthor && (
                      <p className="text-xs text-muted-foreground text-center">
                        Only the author can decrypt this manuscript
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

