// src/utils/contractAddresses.ts
import { BRIDGES } from "reality-data-service";

export interface ContractAddresses {
  realityContract: string;
  arbitratorProxy: string;
  foreignProxy?: string;
  bridgeName: string;
  appeals: string | boolean;
  isTestnet: boolean;
}

/**
 * Get all contract addresses for a specific chain
 * @param chainName - The name of the chain (e.g., 'ethereum', 'gnosis', 'polygon')
 * @returns Array of contract addresses available for that chain
 */
export const getContractAddresses = (
  chainName: string
): ContractAddresses[] => {
  try {
    // Filter bridges for the specified chain
    const chainBridges = BRIDGES.filter(
      (bridge) =>
        bridge["Home Chain"]?.toLowerCase() === chainName.toLowerCase()
    );

    return chainBridges.map((bridge) => ({
      realityContract: bridge.Oracle || "",
      arbitratorProxy: bridge["Home Proxy"] || "",
      foreignProxy: bridge["Foreign Proxy"] || "",
      bridgeName: bridge.Name || "",
      appeals: bridge.Appeals || "",
      isTestnet: bridge.Testnet === "Yes",
    }));
  } catch (error) {
    console.error("Error retrieving contract addresses:", error);
    return [];
  }
};

/**
 * Get the primary Reality.eth contract address for a chain
 * @param chainName - The name of the chain
 * @returns The primary Reality.eth contract address
 */
export const getPrimaryRealityContract = (chainName: string): string => {
  const contracts = getContractAddresses(chainName);

  // Filter out testnet contracts and get the first one
  const mainnetContracts = contracts.filter((contract) => !contract.isTestnet);

  if (mainnetContracts.length > 0) {
    return mainnetContracts[0].realityContract;
  }

  // Fallback to known addresses if BRIDGES data is not available
  return KNOWN_REALITY_ADDRESSES[chainName.toLowerCase()] || "";
};

/**
 * Get the arbitrator proxy address for a specific question
 * @param chainName - The name of the chain
 * @param arbitratorAddress - The arbitrator address from question data
 * @returns The arbitrator proxy contract address
 */
export const getArbitratorProxyAddress = (
  chainName: string,
  arbitratorAddress?: string
): string => {
  if (!arbitratorAddress) {
    return "";
  }

  const contracts = getContractAddresses(chainName);

  // Find the specific bridge that matches the arbitrator address
  const matchingContract = contracts.find(
    (contract) =>
      contract.arbitratorProxy.toLowerCase() === arbitratorAddress.toLowerCase()
  );

  return matchingContract?.arbitratorProxy || "";
};

/**
 * Get all available contract information for display
 * @param chainName - The name of the chain
 * @returns Formatted contract information
 */
export const getChainContractInfo = (chainName: string) => {
  const contracts = getContractAddresses(chainName);

  return {
    chainName,
    hasContracts: contracts.length > 0,
    mainnetContracts: contracts.filter((c) => !c.isTestnet),
    testnetContracts: contracts.filter((c) => c.isTestnet),
    primaryRealityContract: getPrimaryRealityContract(chainName),
    totalBridges: contracts.length,
  };
};

/**
 * Get bridge information for a specific question's arbitrator
 * @param chainName - The name of the home chain
 * @param arbitratorAddress - The arbitrator address from the question
 * @returns Bridge information including foreign proxy details
 */
export const getBridgeInfo = (chainName: string, arbitratorAddress: string) => {
  try {
    // Find the specific bridge that matches the arbitrator address
    const bridge = BRIDGES.find(
      (b) =>
        b["Home Chain"]?.toLowerCase() === chainName.toLowerCase() &&
        b["Home Proxy"]?.toLowerCase() === arbitratorAddress.toLowerCase()
    );

    if (!bridge) {
      return null;
    }

    return {
      bridgeName: bridge.Name || "",
      homeChain: bridge["Home Chain"] || "",
      foreignChain: bridge["Foreign Chain"] || "",
      homeProxy: bridge["Home Proxy"] || "",
      foreignProxy: bridge["Foreign Proxy"] || "",
      oracle: bridge.Oracle || "",
      appeals: bridge.Appeals || false,
      isTestnet: bridge.Testnet === "Yes",
      // Map common chain names to their standard formats
      foreignChainId: getChainIdFromName(bridge["Foreign Chain"] || ""),
      homeChainId: getChainIdFromName(bridge["Home Chain"] || ""),
    };
  } catch (error) {
    console.error("Error retrieving bridge information:", error);
    return null;
  }
};

/**
 * Get chain ID from chain name
 * @param chainName - The name of the chain
 * @returns Chain ID in hex format
 */
export const getChainIdFromName = (chainName: string): string => {
  const chainMapping: { [key: string]: string } = {
    ethereum: "0x1", // 1
    sepolia: "0xaa36a7", // 11155111
    gnosis: "0x64", // 100
    polygon: "0x89", // 137
    arbitrum: "0xa4b1", // 42161
    arbitrum_sepolia: "0x66eee", // 421614
    "arbitrum sepolia": "0x66eee", // 421614 - matches BRIDGES data format
    optimism: "0xa", // 10
    base: "0x2105", // 8453
  };

  return chainMapping[chainName.toLowerCase()] || "0x1";
};

/**
 * Get foreign proxy contract address for a question
 * @param question - The question object containing chain and arbitrator info
 * @returns Foreign proxy contract address and chain information
 */
export const getForeignProxyInfo = (question: any) => {
  if (!question?.chain?.name || !question?.arbitrator) {
    console.log('getForeignProxyInfo: Missing question data', { 
      chainName: question?.chain?.name, 
      arbitrator: question?.arbitrator 
    });
    return null;
  }

  const bridgeInfo = getBridgeInfo(question.chain.name, question.arbitrator);

  if (!bridgeInfo) {
    console.log('getForeignProxyInfo: No bridge info found', { 
      chainName: question.chain.name, 
      arbitrator: question.arbitrator 
    });
    return null;
  }

  const result = {
    foreignProxyAddress: bridgeInfo.foreignProxy,
    foreignChain: bridgeInfo.foreignChain,
    foreignChainId: bridgeInfo.foreignChainId,
    homeChain: bridgeInfo.homeChain,
    homeChainId: bridgeInfo.homeChainId,
    bridgeName: bridgeInfo.bridgeName,
    isTestnet: bridgeInfo.isTestnet,
  };

  console.log('getForeignProxyInfo: Found bridge info', result);
  return result;
};

/**
 * Check if arbitration has already been requested for a question
 * @param question - The question object
 * @returns Boolean indicating if arbitration was requested
 */
export const isArbitrationRequested = (question: any): boolean => {
  return Boolean(question?.arbitrationRequestedBy);
};

/**
 * Check if a question can have arbitration requested
 * @param question - The question object
 * @returns Boolean indicating if arbitration can be requested
 */
export const canRequestArbitration = (question: any): boolean => {
  // Basic checks for arbitration eligibility
  if (!question) {
    return false;
  }

  if (isArbitrationRequested(question)) {
    return false;
  }

  if (question.phase === "finalized") {
    return false;
  }

  // Check if question has required fields
  if (!question.arbitrator) {
    return false;
  }

  if (!question.chain?.name) {
    return false;
  }

  // Question is eligible for arbitration
  return true;
};

// Export known Reality.eth addresses for chains (fallback)
export const KNOWN_REALITY_ADDRESSES: { [key: string]: string } = {
  ethereum: "0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47",
  sepolia: "0xB7982f20CC159a40eba4b0eA86fd6cbA6Ff810e1",
  gnosis: "0xEb51d9d9717906c981C57af09C4a3449eF30705b",
  polygon: "0x60573B8DcE539aE5bF9aD7932310668997ef0428",
};
