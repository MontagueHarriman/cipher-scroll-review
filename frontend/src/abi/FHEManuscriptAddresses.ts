import { FHEManuscriptABI } from "./FHEManuscriptABI";

// Contract addresses - update after deployment
export const FHEManuscriptAddresses: Record<number, string> = {
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // localhost - update after deployment
  11155111: "0x31D4375a1F9fbD116fb40F132eeB80ED329B8641", // sepolia
};

export function getFHEManuscriptByChainId(
  chainId: number | undefined
): { address: string; abi: readonly unknown[] } | undefined {
  if (!chainId) {
    return undefined;
  }

  const address = FHEManuscriptAddresses[chainId];
  if (!address) {
    return undefined;
  }

  return {
    address,
    abi: FHEManuscriptABI.abi,
  };
}

