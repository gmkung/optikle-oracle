import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { REALITY_ETH_ABI, DEFAULT_ARBITRATORS, formatQuestionForReality } from '@/contracts/abis';
import { getPrimaryRealityContract, getContractAddresses } from '@/utils/contractAddresses';

export interface QuestionParams {
  title: string;
  description?: string;
  category: string;
  timeout: number;
  openingTime?: string;
  bounty: string;
  outcomes: string[];
}

export interface TransactionState {
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: string | null;
  txHash: string | null;
  questionId: string | null;
  gasEstimate: string | null;
}

export const useQuestionCreation = (chainName: string) => {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isLoading: false,
    isConfirming: false,
    isSuccess: false,
    error: null,
    txHash: null,
    questionId: null,
    gasEstimate: null,
  });

  const resetState = useCallback(() => {
    setTransactionState({
      isLoading: false,
      isConfirming: false,
      isSuccess: false,
      error: null,
      txHash: null,
      questionId: null,
      gasEstimate: null,
    });
  }, []);

  const estimateGas = useCallback(async (params: QuestionParams) => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const realityContract = getPrimaryRealityContract(chainName);
      
      if (!realityContract) {
        throw new Error(`No Reality.eth contract found for ${chainName}`);
      }

      const contract = new ethers.Contract(realityContract, REALITY_ETH_ABI, provider);
      
      // Format question data
      const questionText = formatQuestionForReality(
        params.title,
        params.outcomes,
        params.category,
        params.description
      );

      // Get default arbitrator for the chain
      const arbitrator = DEFAULT_ARBITRATORS[chainName.toLowerCase()] || DEFAULT_ARBITRATORS.ethereum;

      // Calculate opening timestamp
      const openingTs = params.openingTime 
        ? Math.floor(new Date(params.openingTime).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

      // Generate a random nonce
      const nonce = Math.floor(Math.random() * 1000000);

      // Estimate gas for askQuestion
      const gasEstimate = await contract.askQuestion.estimateGas(
        0, // template_id (0 for JSON questions)
        questionText,
        arbitrator,
        params.timeout,
        openingTs,
        nonce,
        { value: ethers.parseEther(params.bounty) }
      );

      const gasPrice = (await provider.getFeeData()).gasPrice || 0n;
      const totalGasCost = gasEstimate * gasPrice;
      
      setTransactionState(prev => ({
        ...prev,
        gasEstimate: ethers.formatEther(totalGasCost),
      }));

      return {
        gasEstimate: gasEstimate.toString(),
        gasCost: ethers.formatEther(totalGasCost),
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }, [chainName]);

  const createQuestion = useCallback(async (params: QuestionParams) => {
    try {
      setTransactionState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      const realityContract = getPrimaryRealityContract(chainName);
      
      if (!realityContract) {
        throw new Error(`No Reality.eth contract found for ${chainName}`);
      }

      const contract = new ethers.Contract(realityContract, REALITY_ETH_ABI, signer);
      
      // Format question data
      const questionText = formatQuestionForReality(
        params.title,
        params.outcomes,
        params.category,
        params.description
      );

      // Get default arbitrator for the chain
      const arbitrator = DEFAULT_ARBITRATORS[chainName.toLowerCase()] || DEFAULT_ARBITRATORS.ethereum;

      // Calculate opening timestamp
      const openingTs = params.openingTime 
        ? Math.floor(new Date(params.openingTime).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

      // Generate a random nonce
      const nonce = Math.floor(Math.random() * 1000000);

      console.log('Creating question with params:', {
        template_id: 0,
        question: questionText,
        arbitrator,
        timeout: params.timeout,
        opening_ts: openingTs,
        nonce,
        value: ethers.parseEther(params.bounty),
      });

      // Submit transaction
      const tx = await contract.askQuestion(
        0, // template_id (0 for JSON questions)
        questionText,
        arbitrator,
        params.timeout,
        openingTs,
        nonce,
        { value: ethers.parseEther(params.bounty) }
      );

      setTransactionState(prev => ({
        ...prev,
        isLoading: false,
        isConfirming: true,
        txHash: tx.hash,
      }));

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      // Extract question ID from transaction logs
      let questionId = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          
          if (parsedLog?.name === 'LogNewQuestion') {
            questionId = parsedLog.args[0]; // question_id is the first argument
            break;
          }
        } catch (error) {
          // Skip logs that don't match our interface
          continue;
        }
      }

      setTransactionState(prev => ({
        ...prev,
        isConfirming: false,
        isSuccess: true,
        questionId,
      }));

      return {
        questionId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };

    } catch (error: any) {
      console.error('Error creating question:', error);
      
      let errorMessage = 'Failed to create question';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.reason) {
        errorMessage = `Transaction failed: ${error.reason}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setTransactionState(prev => ({
        ...prev,
        isLoading: false,
        isConfirming: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [chainName]);

  return {
    createQuestion,
    estimateGas,
    resetState,
    ...transactionState,
  };
}; 