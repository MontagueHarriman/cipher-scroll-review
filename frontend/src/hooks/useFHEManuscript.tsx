import { useCallback, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import type { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { getFHEManuscriptByChainId } from "@/abi/FHEManuscriptAddresses";
import { FHEManuscriptABI } from "@/abi/FHEManuscriptABI";

type Manuscript = {
  id: number;
  encryptedContent: string;
  author: string;
  timestamp: number;
  exists: boolean;
  decryptedContent?: string;
};

type UseFHEManuscriptReturn = {
  contractAddress: string | undefined;
  canSubmit: boolean;
  canDecrypt: boolean;
  isSubmitting: boolean;
  isDecrypting: boolean;
  manuscripts: Manuscript[];
  decryptedManuscripts: Map<number, string>;
  message: string;
  submitManuscript: (content: string) => Promise<void>;
  decryptManuscript: (manuscriptId: number) => Promise<void>;
  refreshManuscripts: () => Promise<void>;
  getAuthorManuscripts: () => Promise<void>;
};

export const useFHEManuscript = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  userAddress: string | undefined;
  sameChain: React.RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: React.RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}): UseFHEManuscriptReturn => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    userAddress,
    sameChain,
    sameSigner,
  } = parameters;

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [decryptedManuscripts, setDecryptedManuscripts] = useState<
    Map<number, string>
  >(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [message, setMessage] = useState("");

  const fheManuscriptRef = useRef<
    | {
        address: string;
        abi: readonly unknown[];
        contract: ethers.Contract;
      }
    | undefined
  >(undefined);
  const isSubmittingRef = useRef(false);
  const isDecryptingRef = useRef(false);

  const fheManuscript = useMemo(() => {
    if (!chainId || !ethersReadonlyProvider) {
      console.log("[useFHEManuscript] No chainId or provider, clearing manuscripts");
      setManuscripts([]);
      setDecryptedManuscripts(new Map());
      return undefined;
    }

    const contractInfo = getFHEManuscriptByChainId(chainId);
    if (!contractInfo) {
      console.log("[useFHEManuscript] No contract info for chainId:", chainId);
      setManuscripts([]);
      setDecryptedManuscripts(new Map());
      return undefined;
    }

    try {
      const contract = new ethers.Contract(
        contractInfo.address,
        contractInfo.abi,
        ethersReadonlyProvider
      );

      console.log("[useFHEManuscript] Contract instance created for chainId:", chainId, "address:", contractInfo.address);
      
      // Clear manuscripts when contract changes (network switch)
      if (fheManuscriptRef.current?.address !== contractInfo.address) {
        console.log("[useFHEManuscript] Contract address changed, clearing manuscripts");
        setManuscripts([]);
        setDecryptedManuscripts(new Map());
      }

      return {
        address: contractInfo.address,
        abi: contractInfo.abi,
        contract,
      };
    } catch (error) {
      console.error("[useFHEManuscript] Error creating contract:", error);
      return undefined;
    }
  }, [chainId, ethersReadonlyProvider]);

  fheManuscriptRef.current = fheManuscript;

  const canSubmit = useMemo(() => {
    return (
      !!instance &&
      !!ethersSigner &&
      !!fheManuscript &&
      !isSubmitting &&
      sameChain.current(chainId) &&
      sameSigner.current(ethersSigner)
    );
  }, [
    instance,
    ethersSigner,
    fheManuscript,
    isSubmitting,
    chainId,
    sameChain,
    sameSigner,
  ]);

  const canDecrypt = useMemo(() => {
    return (
      !!instance &&
      !!ethersSigner &&
      !!fheManuscript &&
      !isDecrypting &&
      sameChain.current(chainId) &&
      sameSigner.current(ethersSigner)
    );
  }, [
    instance,
    ethersSigner,
    fheManuscript,
    isDecrypting,
    chainId,
    sameChain,
    sameSigner,
  ]);

  const submitManuscript = useCallback(
    async (content: string) => {
      if (!canSubmit || !instance || !ethersSigner || !fheManuscript) {
        return;
      }

      if (isSubmittingRef.current) {
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setMessage("Encrypting manuscript content...");

      const run = async () => {
        const thisChainId = chainId;
        const thisFheManuscriptAddress = fheManuscript.address;
        const thisEthersSigner = ethersSigner;

        const isStale = () =>
          thisFheManuscriptAddress !== fheManuscriptRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          // Convert text to bytes array
          const contentBytes = ethers.toUtf8Bytes(content);
          if (contentBytes.length === 0) {
            throw new Error("Content cannot be empty");
          }

          setMessage("Creating encrypted input...");
          
          // Encrypt all bytes in a single encryption call
          // All bytes must be added to the same input instance to share the same proof
          const input = instance.createEncryptedInput(
            thisFheManuscriptAddress,
            thisEthersSigner.address
          );
          
          // Add all bytes to the same input
          for (let i = 0; i < contentBytes.length; i++) {
            input.add8(contentBytes[i]);
          }
          
          setMessage(`Encrypting ${contentBytes.length} bytes (this may take a moment)...`);
          const enc = await input.encrypt();
          
          // Extract handles for all bytes
          const encryptedBytes: string[] = [];
          for (let i = 0; i < contentBytes.length; i++) {
            encryptedBytes.push(enc.handles[i]);
          }
          
          const inputProof = enc.inputProof;

          if (isStale()) {
            setMessage("Operation cancelled");
            return;
          }

          setMessage("Submitting to blockchain...");
          const contract = new ethers.Contract(
            thisFheManuscriptAddress,
            FHEManuscriptABI.abi,
            thisEthersSigner
          );

          // Validate encrypted data before submission
          if (!encryptedBytes || encryptedBytes.length === 0) {
            throw new Error("Encryption failed: no encrypted bytes generated");
          }
          if (!inputProof || inputProof.length === 0) {
            throw new Error("Encryption failed: no input proof generated");
          }
          
          console.log("[submitManuscript] Submitting:", {
            encryptedBytesCount: encryptedBytes.length,
            inputProofLength: inputProof.length,
            contractAddress: thisFheManuscriptAddress,
          });

          const tx = await contract.submitManuscript(
            encryptedBytes,
            inputProof
          );

          setMessage(`Waiting for transaction: ${tx.hash}...`);
          const receipt = await tx.wait();

          if (isStale()) {
            setMessage("Operation cancelled");
            return;
          }

          setMessage(
            `Manuscript submitted successfully! ID: ${receipt.logs[0]?.args?.[0] || "N/A"}`
          );

          // Refresh manuscripts list
          await getAuthorManuscripts();
        } catch (error: any) {
          let errorMessage = "Unknown error";
          
          if (error?.reason) {
            errorMessage = error.reason;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.data) {
            // Try to decode revert reason if available
            try {
              const decoded = contract?.interface?.parseError(error.data);
              if (decoded) {
                errorMessage = decoded.name;
              }
            } catch {
              // Ignore decode errors
            }
          }
          
          // Provide more helpful error messages
          if (errorMessage.includes("execution reverted")) {
            if (errorMessage.includes("Empty content")) {
              errorMessage = "Encryption failed: Empty content detected";
            } else if (errorMessage.includes("Content too long")) {
              errorMessage = "Content too long";
            } else if (errorMessage.includes("require(false)")) {
              errorMessage = "FHE verification failed. Please ensure Hardhat node has FHEVM plugin enabled and try again.";
            } else {
              errorMessage = "Contract execution failed. This may be due to FHE verification issues. Please check your Hardhat node configuration.";
            }
          }
          
          setMessage(`Submission failed: ${errorMessage}`);
          console.error("Submit manuscript error:", error);
        } finally {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
        }
      };

      run();
    },
    [
      canSubmit,
      instance,
      ethersSigner,
      fheManuscript,
      chainId,
      sameChain,
      sameSigner,
    ]
  );

  const decryptManuscript = useCallback(
    async (manuscriptId: number) => {
      if (!canDecrypt || !instance || !ethersSigner || !fheManuscript) {
        return;
      }

      if (isDecryptingRef.current) {
        return;
      }

      // Check if already decrypted
      if (decryptedManuscripts.has(manuscriptId)) {
        return;
      }

      const manuscript = manuscripts.find((m) => m.id === manuscriptId);
      if (!manuscript || !manuscript.exists) {
        setMessage("Manuscript not found");
        return;
      }

      // Check if user is the author
      if (manuscript.author.toLowerCase() !== userAddress?.toLowerCase()) {
        setMessage("Only the author can decrypt this manuscript");
        return;
      }

      isDecryptingRef.current = true;
      setIsDecrypting(true);
      setMessage("Decrypting manuscript...");

      const run = async () => {
        const thisChainId = chainId;
        const thisFheManuscriptAddress = fheManuscript.address;
        const thisEthersSigner = ethersSigner;
        const thisEncryptedContent = manuscript.encryptedContent as string[];

        if (!Array.isArray(thisEncryptedContent) || thisEncryptedContent.length === 0) {
          setMessage("Invalid encrypted content");
          return;
        }

        const isStale = () =>
          thisFheManuscriptAddress !== fheManuscriptRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          const sig: FhevmDecryptionSignature | null =
            await FhevmDecryptionSignature.loadOrSign(
              instance,
              [fheManuscript.address as `0x${string}`],
              ethersSigner,
              fhevmDecryptionSignatureStorage
            );

          if (!sig) {
            setMessage("Unable to build FHEVM decryption signature");
            return;
          }

          if (isStale()) {
            setMessage("Operation cancelled");
            return;
          }

          setMessage("Calling FHEVM userDecrypt...");
          
          // Decrypt each byte in the array
          const decryptedBytesArray: number[] = [];
          const handlePairs = thisEncryptedContent.map((handle: string) => ({
            handle: handle,
            contractAddress: thisFheManuscriptAddress,
          }));
          
          const res = await instance.userDecrypt(
            handlePairs,
            sig.privateKey,
            sig.publicKey,
            sig.signature,
            sig.contractAddresses,
            sig.userAddress,
            sig.startTimestamp,
            sig.durationDays
          );

          if (isStale()) {
            setMessage("Operation cancelled");
            return;
          }

          // Extract decrypted bytes from result
          for (let i = 0; i < thisEncryptedContent.length; i++) {
            const handle = thisEncryptedContent[i];
            const decryptedByte = res[handle];
            if (decryptedByte !== undefined) {
              decryptedBytesArray.push(Number(decryptedByte));
            }
          }

          if (decryptedBytesArray.length > 0) {
            // Convert bytes array back to string
            const decryptedString = ethers.toUtf8String(new Uint8Array(decryptedBytesArray));
            setDecryptedManuscripts((prev) => {
              const newMap = new Map(prev);
              newMap.set(manuscriptId, decryptedString);
              return newMap;
            });
            setMessage("Manuscript decrypted successfully!");
          } else {
            setMessage("Decryption failed: no result");
          }
        } catch (error: any) {
          setMessage(`Decryption failed: ${error.message || "Unknown error"}`);
          console.error("Decrypt manuscript error:", error);
        } finally {
          isDecryptingRef.current = false;
          setIsDecrypting(false);
        }
      };

      run();
    },
    [
      canDecrypt,
      instance,
      ethersSigner,
      fheManuscript,
      manuscripts,
      decryptedManuscripts,
      userAddress,
      chainId,
      fhevmDecryptionSignatureStorage,
      sameChain,
      sameSigner,
    ]
  );

  const getAuthorManuscripts = useCallback(async () => {
    if (!fheManuscript || !userAddress) {
      return;
    }

    // Check if chainId or signer has changed (network switch detection)
    if (!sameChain.current(chainId) || !sameSigner.current(ethersSigner)) {
      console.log("[useFHEManuscript] Network or signer changed, skipping fetch");
      return;
    }

    // Verify we're using the current contract instance
    if (fheManuscriptRef.current?.address !== fheManuscript.address) {
      console.log("[useFHEManuscript] Contract address changed, skipping fetch");
      return;
    }

    try {
      const contract = fheManuscript.contract;
      
      // Verify network before making the call
      const currentNetwork = await contract.runner?.provider?.getNetwork();
      if (currentNetwork && currentNetwork.chainId !== BigInt(chainId || 0)) {
        console.log("[useFHEManuscript] Network mismatch detected, clearing manuscripts");
        setManuscripts([]);
        return;
      }
      
      const manuscriptIds = await contract.getAuthorManuscripts(userAddress);

      // Check again after the call (network might have changed during the call)
      if (!sameChain.current(chainId) || !sameSigner.current(ethersSigner)) {
        console.log("[useFHEManuscript] Network changed during fetch, discarding results");
        return;
      }

      const manuscriptPromises = manuscriptIds.map(async (id: bigint) => {
        const [encryptedContent, author, timestamp, exists] =
          await contract.getManuscript(id);
        return {
          id: Number(id),
          encryptedContent: encryptedContent as string[], // Array of handles
          author: author as string,
          timestamp: Number(timestamp),
          exists: exists as boolean,
        };
      });

      const fetchedManuscripts = await Promise.all(manuscriptPromises);
      
      // Final check before setting state
      if (sameChain.current(chainId) && sameSigner.current(ethersSigner)) {
        setManuscripts(fetchedManuscripts);
      }
    } catch (error: any) {
      // Handle network change errors gracefully
      if (error?.code === "NETWORK_ERROR" || error?.message?.includes("network changed")) {
        console.log("[useFHEManuscript] Network changed during fetch, clearing manuscripts");
        setManuscripts([]);
        setMessage("");
        return;
      }
      console.error("Error fetching manuscripts:", error);
      setMessage("Failed to fetch manuscripts");
    }
  }, [fheManuscript, userAddress, chainId, ethersSigner, sameChain, sameSigner]);

  const refreshManuscripts = useCallback(async () => {
    await getAuthorManuscripts();
  }, [getAuthorManuscripts]);

  return {
    contractAddress: fheManuscript?.address,
    canSubmit,
    canDecrypt,
    isSubmitting,
    isDecrypting,
    manuscripts,
    decryptedManuscripts,
    message,
    submitManuscript,
    decryptManuscript,
    refreshManuscripts,
    getAuthorManuscripts,
  };
};

