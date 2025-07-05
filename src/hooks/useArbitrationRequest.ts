import { useState } from 'react';
import { ethers } from 'ethers';
import { ARBITRATOR_PROXY_ABI } from '../contracts/abis';
import { getForeignProxyInfo, canRequestArbitration, isArbitrationRequested } from '../utils/contractAddresses';
import { Question } from '../components/QuestionsList';

interface ArbitrationRequestState {
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: string | null;
  txHash: string | null;
  disputeFee: string | null;
  gasEstimate: string | null;
}

interface ArbitrationRequestParams {
  questionId: string;
  maxPrevious?: string;
}

export const useArbitrationRequest = (question: Question | null) => {
  const [state, setState] = useState<ArbitrationRequestState>({
    isLoading: false,
    isConfirming: false,
    isSuccess: false,
    error: null,
    txHash: null,
    disputeFee: null,
    gasEstimate: null,
  });

  // Get foreign proxy info (computed, not cached)
  const foreignProxyInfo = question ? getForeignProxyInfo(question) : null;

  // Simple wallet check (no event listeners)
  const checkWallet = async () => {
    if (!window.ethereum) return { connected: false, chainId: null };
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return { 
        connected: accounts.length > 0, 
        chainId,
        needsSwitch: foreignProxyInfo ? chainId !== foreignProxyInfo.foreignChainId : false
      };
    } catch (error) {
      return { connected: false, chainId: null, needsSwitch: false };
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet found');
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const switchToForeignChain = async () => {
    if (!window.ethereum || !foreignProxyInfo) {
      throw new Error('Cannot switch chain');
    }
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: foreignProxyInfo.foreignChainId }],
    });
  };

  const getContract = async () => {
    if (!foreignProxyInfo?.foreignProxyAddress) {
      throw new Error('Foreign proxy address not found');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(
      foreignProxyInfo.foreignProxyAddress,
      ARBITRATOR_PROXY_ABI,
      signer
    );
  };

  const loadContractData = async () => {
    if (!question || !foreignProxyInfo) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = await getContract();
      // question.id should already be a bytes32 hash from Reality.eth
      // Don't hash it again - use it directly
      const questionIdBytes = question.id;
      const fee = await contract.getDisputeFee(questionIdBytes);
      const feeInEth = ethers.formatEther(fee);

      setState(prev => ({
        ...prev,
        disputeFee: feeInEth,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load contract data',
        isLoading: false,
      }));
    }
  };

  const estimateGas = async (params: ArbitrationRequestParams) => {
    if (!question || !foreignProxyInfo || !state.disputeFee) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = await getContract();
      // Use the question ID directly - it's already a bytes32 hash
      const questionIdBytes = params.questionId;
      const maxPrevious = params.maxPrevious ? ethers.parseEther(params.maxPrevious) : 0;
      const disputeFee = ethers.parseEther(state.disputeFee);

      const gasEstimate = await contract.requestArbitration.estimateGas(
        questionIdBytes,
        maxPrevious,
        { value: disputeFee }
      );

      const provider = new ethers.BrowserProvider(window.ethereum);
      const gasPrice = await provider.getFeeData();
      const totalGasCost = gasEstimate * (gasPrice.gasPrice || 0n);
      const gasCostInEth = ethers.formatEther(totalGasCost);

      setState(prev => ({
        ...prev,
        gasEstimate: gasCostInEth,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to estimate gas',
        isLoading: false,
      }));
    }
  };

  const requestArbitration = async (params: ArbitrationRequestParams) => {
    if (!question || !foreignProxyInfo || !state.disputeFee) {
      throw new Error('Missing required data');
    }
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const walletStatus = await checkWallet();
      
      if (!walletStatus.connected) {
        await connectWallet();
      }
      if (walletStatus.needsSwitch) {
        await switchToForeignChain();
      }

      const contract = await getContract();
      // Use the question ID directly - it's already a bytes32 hash
      const questionIdBytes = params.questionId;
      const maxPrevious = params.maxPrevious ? ethers.parseEther(params.maxPrevious) : 0;
      const disputeFee = ethers.parseEther(state.disputeFee);

      const tx = await contract.requestArbitration(
        questionIdBytes,
        maxPrevious,
        { value: disputeFee }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        isConfirming: true,
        txHash: tx.hash,
      }));

      await tx.wait();

      setState(prev => ({
        ...prev,
        isConfirming: false,
        isSuccess: true,
      }));
    } catch (error: any) {
      let errorMessage = 'Failed to request arbitration';
      if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for transaction';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isConfirming: false,
        error: errorMessage,
      }));
    }
  };

  const resetState = () => {
    setState({
      isLoading: false,
      isConfirming: false,
      isSuccess: false,
      error: null,
      txHash: null,
      disputeFee: null,
      gasEstimate: null,
    });
  };

  // Computed properties (no caching)
  const canRequest = question ? canRequestArbitration(question) : false;
  const isRequested = question ? isArbitrationRequested(question) : false;
  const hasRequiredData = Boolean(state.disputeFee && foreignProxyInfo);

  return {
    ...state,
    canRequest,
    isRequested,
    hasRequiredData,
    foreignProxyInfo,
    checkWallet,
    connectWallet,
    switchToForeignChain,
    loadContractData,
    estimateGas,
    requestArbitration,
    resetState,
  };
};

export default useArbitrationRequest; // Fixed memory leak issue in arbitration request hook
// Critical fix: Memory leak resolved in arbitration request hook
// Fixed memory leak by removing automatic event listeners
// Fixed memory leak by removing automatic event listeners
