import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner, Eip1193Provider } from "ethers";

type UseRainbowEthersSignerReturn = {
  provider: string | Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: readonly `0x${string}`[] | undefined;
  isConnected: boolean;
  connect: () => void;
  ethersSigner: JsonRpcSigner | undefined;
  ethersReadonlyProvider: BrowserProvider | undefined;
  userAddress: string | undefined;
  sameChain: React.RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: React.RefObject<
    (ethersSigner: JsonRpcSigner | undefined) => boolean
  >;
  initialMockChains: Record<number, string>;
};

async function walletClientToSigner(walletClient: any): Promise<JsonRpcSigner> {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new BrowserProvider(transport, network);
  const signer = await provider.getSigner(account.address);
  return signer;
}

export const useRainbowEthersSigner = (): UseRainbowEthersSignerReturn => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const [ethersSigner, setEthersSigner] = useState<JsonRpcSigner | undefined>(
    undefined
  );
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<
    BrowserProvider | undefined
  >(undefined);

  const signerRef = useRef<JsonRpcSigner | undefined>(undefined);
  const chainIdRef = useRef<number | undefined>(undefined);

  const sameChain = useRef((currentChainId: number | undefined) => {
    return currentChainId === chainIdRef.current;
  });

  const sameSigner = useRef(
    (currentSigner: JsonRpcSigner | undefined) => {
      return currentSigner === signerRef.current;
    }
  );

  // Mock chains for localhost
  const initialMockChains: Record<number, string> = useMemo(() => {
    return {
      31337: "http://127.0.0.1:8545",
    };
  }, []);

  useEffect(() => {
    if (walletClient && isConnected) {
      walletClientToSigner(walletClient).then((signer) => {
        const provider = signer.provider as BrowserProvider;
        setEthersReadonlyProvider(provider);
        setEthersSigner(signer);
        signerRef.current = signer;
        chainIdRef.current = chainId;
      }).catch((error) => {
        console.error("Error creating signer:", error);
        setEthersSigner(undefined);
        setEthersReadonlyProvider(undefined);
        signerRef.current = undefined;
        chainIdRef.current = undefined;
      });
    } else {
      setEthersSigner(undefined);
      setEthersReadonlyProvider(undefined);
      signerRef.current = undefined;
      chainIdRef.current = undefined;
    }
  }, [walletClient, isConnected, chainId]);

  const connect = useCallback(() => {
    // Connection is handled by RainbowKit ConnectButton
    // This is just a placeholder
  }, []);

  // For Hardhat network (chainId 31337), return RPC URL string instead of eip1193
  // This allows useFhevm to properly detect it as a mock chain and use MockFhevmInstance
  // For Sepolia network, return a special marker - useFhevm will handle it using Dairy approach
  // For other networks, return the actual Eip1193Provider object if needed
  const provider = useMemo(() => {
    console.log("[useRainbowEthersSigner] Computing provider, chainId:", chainId, "walletClient:", !!walletClient);
    
    if (!chainId) {
      console.log("[useRainbowEthersSigner] No chainId, returning undefined");
      return undefined;
    }
    
    // For Hardhat/localhost network, return the RPC URL directly
    if (chainId === 31337) {
      console.log("[useRainbowEthersSigner] Hardhat network detected, returning RPC URL");
      return initialMockChains[31337] || "http://127.0.0.1:8545";
    }
    
    // For Sepolia network, return a special marker
    // useFhevm will detect this and use Dairy's simple approach (createInstance(SepoliaConfig))
    if (chainId === 11155111) {
      console.log("[useRainbowEthersSigner] Sepolia network detected, returning 'sepolia' marker");
      return "sepolia" as any; // Special marker for Sepolia
    }
    
    // For other networks, return the actual Eip1193Provider object if available
    // walletClient.transport implements Eip1193Provider interface
    if (walletClient && walletClient.transport) {
      console.log("[useRainbowEthersSigner] Other network, returning walletClient.transport");
      // Return the transport object which implements Eip1193Provider
      return walletClient.transport as Eip1193Provider;
    }
    
    console.log("[useRainbowEthersSigner] No walletClient or transport, returning undefined");
    return undefined;
  }, [walletClient, chainId, initialMockChains]);

  return {
    provider,
    chainId,
    accounts: address ? [address] : undefined,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    userAddress: address,
    sameChain,
    sameSigner,
    initialMockChains,
  };
};
