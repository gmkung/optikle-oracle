# Multi-Chain Kleros Optimistic Oracle Implementation Prompts

This document breaks down the comprehensive Multi-Chain Kleros Optimistic Oracle Implementation Guide into 5 focused prompts that are easy for an LLM agent to digest and implement sequentially. Each prompt builds upon the previous one, preserving all technical details while being focused and actionable.

## Prompt 1: Web3 Integration and Chain Setup

### Title: Set up Web3 Integration Layer for Multi-Chain Reality.eth

### Context
You are implementing a multi-chain Reality.eth application that supports Ethereum, Gnosis, and Polygon chains. The current application uses the `reality-data-service` package (v0.6.2) for data fetching with the following capabilities:

- **`useQuestions` Hook**: Fetches questions from Reality.eth subgraphs with filtering and pagination
- **`useDisputeData` Hook**: Retrieves dispute information including evidence and meta-evidence  
- **Multi-chain Support**: Currently supports Ethereum, Gnosis, and Polygon via subgraph endpoints

```typescript
// Current data fetching pattern
const { questions, loading, error, hasMore, loadMore } = useQuestions({
  chain: selectedChain,
  searchTerm,
  filters,
});

const { dispute, disputeLoading, evidences, metaEvidence } = useDisputeData({
  questionId: selectedQuestion?.id,
  chain: selectedChain,
});
```

Court/arbitrator information is currently fetched through:
- **Subgraph Integration**: All court data comes from The Graph protocol subgraphs
- **Arbitrator Addresses**: Dynamically resolved from question data  
- **Dispute Data**: Includes arbitrator contract addresses, dispute phases, and evidence
- **Evidence Management**: Evidence URIs stored on IPFS, accessed via `https://cdn.kleros.link`

### Requirements
1. Install dependencies: `viem`, `wagmi`, `@tanstack/react-query`, `@rainbow-me/rainbowkit`
2. Create `utils/web3.ts` with chain configurations for:
   - Ethereum (chainId: 1, native currency: ETH)
   - Gnosis (chainId: 100, native currency: xDAI)  
   - Polygon (chainId: 137, native currency: MATIC)
3. Set up contract ABIs in `contracts/abis.ts` for RealityETHv3.sol and ArbitratorProxy.sol
4. Create a ChainProvider context that manages chain selection and switching
5. Implement wallet connection with RainbowKit

### Technical Implementation Details

#### Current Chain Configuration Structure
```typescript
interface Chain {
  id: string;
  name: string;
  subgraphUrl: string;
  public_rpc_url: string;
  native_currency: string;
}

// Supported chains:
// - Ethereum: ETH native currency
// - Gnosis: xDAI native currency  
// - Polygon: MATIC native currency
```

#### Provider Setup (utils/web3.ts)
```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { mainnet, gnosis, polygon } from 'viem/chains';

export const chainConfig = {
  ethereum: {
    chain: mainnet,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    realityContract: '0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47',
    arbitratorProxy: '0x...' // Kleros arbitrator proxy address
  },
  gnosis: {
    chain: gnosis,
    rpcUrl: process.env.GNOSIS_RPC_URL || 'https://rpc.gnosischain.com',
    realityContract: '0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47',
    arbitratorProxy: '0x...'
  },
  polygon: {
    chain: polygon,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    realityContract: '0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47',
    arbitratorProxy: '0x...'
  }
};

export const createClients = (chainName: string) => {
  const config = chainConfig[chainName];
  
  const publicClient = createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl)
  });

  const walletClient = createWalletClient({
    chain: config.chain,
    transport: http(config.rpcUrl)
  });

  return { publicClient, walletClient };
};
```

#### Contract ABIs (contracts/abis.ts)
```typescript
export const REALITY_ETH_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "template_id", "type": "uint256"},
      {"internalType": "string", "name": "question", "type": "string"},
      {"internalType": "address", "name": "arbitrator", "type": "address"},
      {"internalType": "uint32", "name": "timeout", "type": "uint32"},
      {"internalType": "uint32", "name": "opening_ts", "type": "uint32"},
      {"internalType": "uint256", "name": "nonce", "type": "uint256"}
    ],
    "name": "askQuestion",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "payable",
    "type": "function"
  },
  // Additional methods for:
  // - askQuestionWithMinBond()
  // - submitAnswer() 
  // - submitAnswerCommitment()
  // - submitAnswerReveal()
  // - fundAnswerBounty()
  // - claimWinnings() (Optional)
  // - reopenQuestion() (Optional)
  // - cancelArbitration() (Optional)
  // - createTemplate() (Optional)
];

export const ARBITRATOR_PROXY_ABI = [
  {
    "inputs": [
      {"internalType": "bytes32", "name": "_questionID", "type": "bytes32"},
      {"internalType": "uint256", "name": "_maxPrevious", "type": "uint256"}
    ],
    "name": "requestArbitration",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Additional methods for:
  // - fundAppeal()
  // - submitEvidence()
  // - withdrawFeesAndRewards()
  // - withdrawFeesAndRewardsForAllRounds() (Optional)
  // - handleFailedDisputeCreation() (Optional)
  // - getDisputeFee() (Optional but useful)
  // - getTotalWithdrawableAmount() (Optional but useful)
];
```

### Contract Address Management
**Important**: Contract addresses are dynamically managed by `reality-data-service` through its `BRIDGES` configuration system. You do NOT need to hardcode Reality.eth or arbitrator proxy contract addresses.

#### How Contract Addresses are Retrieved:
```typescript
// Contract addresses are automatically handled by reality-data-service
import { useDisputeData, BRIDGES } from 'reality-data-service';

// Example: Getting arbitrator contract address from dispute data
const { dispute, arbitrableContractAddress } = useDisputeData({
  questionId: selectedQuestion?.id,
  chain: selectedChain,
});

// arbitrableContractAddress contains the proxy contract address for the specific question
// This is retrieved dynamically based on the question's arbitrator and chain
```

#### Available Contract Information from reality-data-service:
1. **Reality.eth Contract Addresses**: Available in `BRIDGES` array as `Oracle` property
2. **Arbitrator Proxy Addresses**: Available as `Home Proxy` and `Foreign Proxy` properties  
3. **Cross-chain Bridge Support**: Handles questions on one chain with disputes on another
4. **Dynamic Resolution**: Contract addresses are matched based on question data

### Deliverables
- Working wallet connection with multi-chain support
- Chain switching functionality
- Contract ABI definitions
- Provider setup for reading and writing to contracts
- Integration with existing reality-data-service

---

## Prompt 2: Question Creation Feature

### Title: Implement Question Creation Functionality for Reality.eth

### Context
Building on the Web3 integration from Prompt 1, implement the question creation feature that allows users to create new questions on any supported chain (Ethereum, Gnosis, Polygon).

### Requirements
1. Create `useQuestionCreation` hook using wagmi's `useContractWrite`
2. Build `QuestionCreationForm` component with the following fields:
   - Title (required)
   - Description (optional)
   - Template ID (default: 0)
   - Timeout (default: 86400 seconds / 24 hours)
   - Opening timestamp (default: current time)
   - Bounty amount in native currency
   - Answer options (default: ['Yes', 'No'])
   - Category
3. Implement the `askQuestion` contract method with proper parameter formatting
4. Handle transaction states (loading, success, error)
5. Show gas estimation and transaction confirmation

### Smart Contract Methods

#### RealityETHv3.sol - Question Creation Methods

1. **`askQuestion()`** - Basic question creation
```solidity
function askQuestion(
  uint256 template_id,
  string memory question,
  address arbitrator,
  uint32 timeout,
  uint32 opening_ts,
  uint256 nonce
) public payable returns (bytes32)
```

2. **`askQuestionWithMinBond()`** - Question creation with minimum bond
```solidity
function askQuestionWithMinBond(
  uint256 template_id,
  string memory question,
  address arbitrator,
  uint32 timeout,
  uint32 opening_ts,
  uint256 nonce,
  uint256 min_bond
) public payable returns (bytes32)
```

3. **`createTemplateAndAskQuestion()`** - Creates template and question in one transaction
```solidity
function createTemplateAndAskQuestion(
  string memory content,
  string memory question,
  address arbitrator,
  uint32 timeout,
  uint32 opening_ts,
  uint256 nonce
) public payable returns (bytes32)
```

4. **`fundAnswerBounty()`** - Add funds to question bounty
```solidity
function fundAnswerBounty(bytes32 question_id) external payable
```

#### Optional Advanced Methods
The following methods provide additional functionality but are not required for basic operation:

1. **`claimWinnings()`** - Claim bonds and bounties for correct answers *(Optional)*
2. **`reopenQuestion()`** - Reopen a question that was settled too soon *(Optional)*
3. **`cancelArbitration()`** - Cancel a pending arbitration *(Optional)*
4. **`createTemplate()`** - Create custom question templates *(Optional)*

### Implementation Details

#### Question Creation Hook (hooks/useQuestionCreation.ts)
```typescript
// hooks/useQuestionCreation.ts
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { REALITY_ETH_ABI } from '../contracts/abis';
import { chainConfig } from '../utils/web3';

export const useQuestionCreation = (chainName: string) => {
  const config = chainConfig[chainName];
  
  const { write, data, error, isLoading } = useContractWrite({
    address: config.realityContract,
    abi: REALITY_ETH_ABI,
    functionName: 'askQuestion',
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const createQuestion = async (params: {
    templateId: number;
    question: string;
    arbitrator: string;
    timeout: number;
    openingTs: number;
    nonce: number;
    bounty: string;
  }) => {
    return write({
      args: [
        params.templateId,
        params.question,
        params.arbitrator,
        params.timeout,
        params.openingTs,
        params.nonce,
      ],
      value: parseEther(params.bounty),
    });
  };

  return {
    createQuestion,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    txHash: data?.hash,
  };
};
```

#### Complete Question Creation Form Component
```typescript
// components/QuestionCreationForm.tsx
import React, { useState } from 'react';
import { useQuestionCreation } from '../hooks/useQuestionCreation';
import { chainConfig } from '../utils/web3';

interface QuestionCreationFormProps {
  selectedChain: string;
  onSuccess: (questionId: string) => void;
}

export const QuestionCreationForm: React.FC<QuestionCreationFormProps> = ({
  selectedChain,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    templateId: 0,
    timeout: 86400, // 24 hours
    openingTs: Math.floor(Date.now() / 1000),
    bounty: '0.01',
    category: '',
    outcomes: ['Yes', 'No'],
  });

  const { createQuestion, isLoading, isSuccess, error } = useQuestionCreation(selectedChain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const questionText = JSON.stringify({
      title: formData.title,
      type: 'single-select',
      outcomes: formData.outcomes,
      category: formData.category,
      lang: 'en',
    });

    try {
      await createQuestion({
        templateId: formData.templateId,
        question: questionText,
        arbitrator: chainConfig[selectedChain].arbitratorProxy,
        timeout: formData.timeout,
        openingTs: formData.openingTs,
        nonce: Math.floor(Math.random() * 1000000),
        bounty: formData.bounty,
      });
    } catch (err) {
      console.error('Question creation failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Question Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Bounty ({chainConfig[selectedChain].chain.nativeCurrency.symbol})
        </label>
        <input
          type="number"
          step="0.001"
          value={formData.bounty}
          onChange={(e) => setFormData({ ...formData, bounty: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Answer Options
        </label>
        {formData.outcomes.map((outcome, index) => (
          <input
            key={index}
            type="text"
            value={outcome}
            onChange={(e) => {
              const newOutcomes = [...formData.outcomes];
              newOutcomes[index] = e.target.value;
              setFormData({ ...formData, outcomes: newOutcomes });
            }}
            className="w-full p-2 border rounded mb-2"
            placeholder={`Option ${index + 1}`}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Creating Question...' : 'Create Question'}
      </button>

      {error && (
        <div className="text-red-500 text-sm">
          Error: {error.message}
        </div>
      )}
    </form>
  );
};
```

#### Question Format
Questions should be formatted as JSON strings:
```typescript
const questionText = JSON.stringify({
  title: formData.title,
  type: 'single-select',
  outcomes: formData.outcomes,
  category: formData.category,
  lang: 'en',
});
```

### Form Validation Requirements
- Title: Required, max 200 characters
- Bounty: Minimum 0.001 native currency
- Timeout: Minimum 60 seconds
- Opening timestamp: Must be in the future or current time
- Outcomes: At least 2 options required

### Gas Estimation and Fee Calculation
- Implement gas estimation before transaction submission
- Display estimated costs in native currency
- Add slippage protection for gas price fluctuations

### Transaction State Management
- Handle loading states during transaction confirmation
- Show transaction hash for tracking
- Implement success callbacks with question ID retrieval
- Provide detailed error messages with recovery suggestions

### Deliverables
- Working question creation form
- Transaction management with loading states
- Success/error handling
- Question ID retrieval after creation
- Gas estimation display
- Form validation with user feedback

---

## Prompt 3: Answer Submission and Dispute Creation

### Title: Build Answer Submission and Dispute Creation Features

### Context
Building on the question creation feature from Prompt 2, implement answer submission and dispute creation functionality for existing Reality.eth questions.

### Part A: Answer Submission

#### Requirements
1. Create `useAnswerSubmission` hook for `submitAnswer` contract method
2. Build `AnswerSubmissionForm` component with:
   - Answer selection from available options
   - Bond amount calculation (minimum 2x previous bond)
   - Display current answer and bond
3. Handle answer history and bond escalation logic
4. Support commit-reveal scheme (optional methods provided)

#### Smart Contract Methods - Answer Submission

1. **`submitAnswer()`** - Submit answer with bond
```solidity
function submitAnswer(
  bytes32 question_id,
  bytes32 answer,
  uint256 max_previous
) external payable
```

2. **`submitAnswerCommitment()`** - Submit answer commitment (for commit-reveal)
```solidity
function submitAnswerCommitment(
  bytes32 question_id,
  bytes32 answer_hash,
  uint256 max_previous,
  address _answerer
) external payable
```

3. **`submitAnswerReveal()`** - Reveal committed answer
```solidity
function submitAnswerReveal(
  bytes32 question_id,
  bytes32 answer,
  uint256 nonce,
  uint256 bond
) external
```

#### Answer Submission Implementation

```typescript
// hooks/useAnswerSubmission.ts
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { REALITY_ETH_ABI } from '../contracts/abis';
import { chainConfig } from '../utils/web3';

export const useAnswerSubmission = (chainName: string) => {
  const config = chainConfig[chainName];
  
  const { write, data, error, isLoading } = useContractWrite({
    address: config.realityContract,
    abi: REALITY_ETH_ABI,
    functionName: 'submitAnswer',
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const submitAnswer = async (params: {
    questionId: string;
    answer: string;
    bond: string;
    maxPrevious: string;
  }) => {
    return write({
      args: [
        params.questionId,
        params.answer,
        params.maxPrevious,
      ],
      value: parseEther(params.bond),
    });
  };

  return {
    submitAnswer,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    txHash: data?.hash,
  };
};
```

```typescript
// components/AnswerSubmissionForm.tsx
import React, { useState } from 'react';
import { useAnswerSubmission } from '../hooks/useAnswerSubmission';

interface AnswerSubmissionFormProps {
  question: Question;
  selectedChain: string;
  onSuccess: () => void;
}

export const AnswerSubmissionForm: React.FC<AnswerSubmissionFormProps> = ({
  question,
  selectedChain,
  onSuccess,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [bondAmount, setBondAmount] = useState('');

  const { submitAnswer, isLoading, isSuccess, error } = useAnswerSubmission(selectedChain);

  const requiredBond = question.bond ? (parseFloat(question.bond) * 2).toString() : '0.01';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitAnswer({
        questionId: question.id,
        answer: selectedAnswer,
        bond: bondAmount,
        maxPrevious: question.bond || '0',
      });
      
      if (isSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Answer submission failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Select Answer
        </label>
        <select
          value={selectedAnswer}
          onChange={(e) => setSelectedAnswer(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select an answer</option>
          {question.options?.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Bond Amount (minimum: {requiredBond} {question.chain.native_currency})
        </label>
        <input
          type="number"
          step="0.001"
          value={bondAmount}
          onChange={(e) => setBondAmount(e.target.value)}
          min={requiredBond}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {isLoading ? 'Submitting Answer...' : 'Submit Answer'}
      </button>

      {error && (
        <div className="text-red-500 text-sm">
          Error: {error.message}
        </div>
      )}
    </form>
  );
};
```

### Part B: Dispute Creation

#### Requirements
1. Create `useDisputeCreation` hook for `requestArbitration`
2. Build `DisputeCreationForm` component with:
   - Reason for dispute textarea
   - Arbitration fee input and display
   - Warning about fee risks
3. Implement evidence submission with IPFS upload
4. Create `EvidenceSubmissionForm` for adding evidence to disputes

#### Smart Contract Methods - ArbitratorProxy.sol

1. **`requestArbitration()`** - Request arbitration for a question
```solidity
function requestArbitration(
  bytes32 _questionID,
  uint256 _maxPrevious
) external payable
```

2. **`fundAppeal()`** - Fund appeal for specific answer
```solidity
function fundAppeal(
  uint256 _arbitrationID,
  uint256 _answer
) external payable returns (bool)
```

3. **`submitEvidence()`** - Submit evidence for dispute
```solidity
function submitEvidence(
  uint256 _arbitrationID,
  string calldata _evidenceURI
) external
```

4. **`withdrawFeesAndRewards()`** - Withdraw fees and rewards from appeal
```solidity
function withdrawFeesAndRewards(
  uint256 _arbitrationID,
  address payable _beneficiary,
  uint256 _round,
  uint256 _answer
) public returns (uint256 reward)
```

#### Optional Advanced Arbitrator Methods
1. **`withdrawFeesAndRewardsForAllRounds()`** - Batch withdrawal from all rounds *(Optional)*
2. **`handleFailedDisputeCreation()`** - Handle failed dispute creation *(Optional)*
3. **`getDisputeFee()`** - Get arbitration cost *(Optional but useful)*
4. **`getTotalWithdrawableAmount()`** - Check withdrawable rewards *(Optional but useful)*

#### Dispute Creation Implementation

```typescript
// hooks/useDisputeCreation.ts
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { ARBITRATOR_PROXY_ABI } from '../contracts/abis';
import { chainConfig } from '../utils/web3';

export const useDisputeCreation = (chainName: string) => {
  const config = chainConfig[chainName];
  
  const { write, data, error, isLoading } = useContractWrite({
    address: config.arbitratorProxy,
    abi: ARBITRATOR_PROXY_ABI,
    functionName: 'requestArbitration',
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const requestArbitration = async (params: {
    questionId: string;
    maxPrevious: string;
    arbitrationFee: string;
  }) => {
    return write({
      args: [
        params.questionId,
        params.maxPrevious,
      ],
      value: parseEther(params.arbitrationFee),
    });
  };

  return {
    requestArbitration,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    txHash: data?.hash,
  };
};
```

```typescript
// components/DisputeCreationForm.tsx
import React, { useState } from 'react';
import { useDisputeCreation } from '../hooks/useDisputeCreation';
import { uploadEvidence } from '../utils/ipfs';

interface DisputeCreationFormProps {
  question: Question;
  selectedChain: string;
  onSuccess: () => void;
}

export const DisputeCreationForm: React.FC<DisputeCreationFormProps> = ({
  question,
  selectedChain,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [arbitrationFee, setArbitrationFee] = useState('');

  const { requestArbitration, isLoading, isSuccess, error } = useDisputeCreation(selectedChain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await requestArbitration({
        questionId: question.id,
        maxPrevious: question.bond || '0',
        arbitrationFee,
      });
      
      if (isSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Dispute creation failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Reason for Dispute
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Explain why you believe the current answer is incorrect..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Arbitration Fee ({question.chain.native_currency})
        </label>
        <input
          type="number"
          step="0.001"
          value={arbitrationFee}
          onChange={(e) => setArbitrationFee(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="bg-yellow-50 p-3 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Requesting arbitration requires paying the arbitration fee upfront. 
          If your dispute is successful, you may be reimbursed. If unsuccessful, you may lose the fee.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
      >
        {isLoading ? 'Creating Dispute...' : 'Request Arbitration'}
      </button>

      {error && (
        <div className="text-red-500 text-sm">
          Error: {error.message}
        </div>
      )}
    </form>
  );
};
```

### Bond Calculation Logic
```typescript
const requiredBond = question.bond ? (parseFloat(question.bond) * 2).toString() : '0.01';
```

### Evidence Submission Requirements
- Evidence must be uploaded to IPFS first
- Evidence metadata structure:
```typescript
interface EvidenceMetadata {
  name: string;
  description: string;
  fileURI?: string;
  fileTypeExtension?: string;
  category?: string;
}
```

### Enhanced Questions Hook
```typescript
// hooks/useEnhancedQuestions.ts
import { useQuestions } from 'reality-data-service';

export const useEnhancedQuestions = (chainName: string, filters: any) => {
  // Use existing reality-data-service for read operations
  const { questions, loading, error, hasMore, loadMore } = useQuestions({
    chain: chainName,
    ...filters,
  });

  return {
    questions: questions?.map(q => ({
      ...q,
      canAnswer: !q.is_pending_arbitration && !q.finalized,
      canDispute: q.best_answer && !q.is_pending_arbitration && !q.finalized,
      requiredBond: q.bond ? (parseFloat(q.bond) * 2).toString() : '0.01',
    })),
    loading,
    error,
    hasMore,
    loadMore,
    
    // Simple refresh function - just reload the page
    refresh: () => window.location.reload(),
  };
};
```

### Validation Rules
- Answer: Must be selected from available options
- Bond: Must be at least 2x the previous bond
- Arbitration fee: Must cover the dispute cost
- Evidence: Name and description are required

### Transaction State Management
- Handle multiple concurrent transactions
- Provide transaction progress indicators
- Implement retry mechanisms for failed transactions
- Store transaction hashes for tracking

### Deliverables
- Answer submission flow with bond escalation
- Dispute creation interface
- Evidence upload to IPFS
- Transaction state management for all operations
- Success/error handling
- Enhanced question data with action capabilities

---

## Prompt 4: IPFS Integration and Evidence Display

### Title: Implement IPFS Integration for Evidence Storage and Display

### Context
Building on the dispute creation from Prompt 3, implement comprehensive IPFS integration for evidence storage and retrieval, plus build the evidence display system.

### Requirements
1. Create IPFS utilities in `utils/ipfs.ts` using `light-curate-data-service`
2. Build `useDisputeDataProcessor` hook that:
   - Fetches raw dispute data from `reality-data-service`
   - Retrieves evidence from IPFS via `https://cdn.kleros.link`
   - Processes meta-evidence for dispute context
3. Create `EvidenceDisplay` component showing:
   - Meta-evidence (dispute description, ruling options)
   - Submitted evidence list with metadata
   - File attachments and IPFS links
4. Add evidence validation utilities
5. Handle IPFS fetch errors gracefully

### IPFS Integration Details

#### IPFS Utilities (utils/ipfs.ts)
```typescript
// utils/ipfs.ts
import { ipfs } from "light-curate-data-service";

export const uploadToIPFS = ipfs.uploadToIPFS;
export const uploadJSONToIPFS = ipfs.uploadJSONToIPFS;
export const fetchFromIPFS = ipfs.fetchFromIPFS;

// Evidence JSON structure interface
export interface EvidenceMetadata {
  name: string;
  description: string;
  fileURI?: string;
  fileTypeExtension?: string;
  category?: string;
}

// Meta evidence structure interface
export interface MetaEvidenceData {
  title: string;
  description: string;
  question: string;
  rulingOptions: {
    type: 'single-select' | 'multiple-select';
    titles: string[];
    descriptions: string[];
  };
  category: string;
  lang: string;
}

/**
 * Upload evidence to IPFS with proper metadata structure
 */
export const uploadEvidence = async (evidence: EvidenceMetadata): Promise<string> => {
  // Add timestamp
  const evidenceWithTimestamp = {
    ...evidence,
    submittedAt: Date.now(),
  };

  return await uploadJSONToIPFS(evidenceWithTimestamp);
};

/**
 * Fetch and parse evidence from IPFS with error handling
 */
export const fetchEvidenceFromIPFS = async (uri: string): Promise<EvidenceMetadata> => {
  try {
    // Remove ipfs:// prefix if present and use cdn.kleros.link
    const cleanUri = uri.replace('ipfs://', '');
    const response = await fetch(`https://cdn.kleros.link/ipfs/${cleanUri}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch evidence from IPFS:', error);
    throw new Error(`Failed to load evidence: ${error.message}`);
  }
};

/**
 * Fetch meta evidence with fallback structure
 */
export const fetchMetaEvidenceFromIPFS = async (uri: string): Promise<MetaEvidenceData> => {
  try {
    const data = await fetchEvidenceFromIPFS(uri);
    return data as MetaEvidenceData;
  } catch (error) {
    console.error('Failed to fetch meta evidence:', error);
    // Return fallback structure
    return {
      title: 'Dispute',
      description: 'Meta evidence failed to load',
      question: '',
      rulingOptions: {
        type: 'single-select',
        titles: ['Refuse to Arbitrate', 'Yes', 'No'],
        descriptions: ['Refuse to rule', 'Answer is Yes', 'Answer is No'],
      },
      category: 'general',
      lang: 'en',
    };
  }
};
```

### Dispute Data Processing

#### Processed Evidence Structure
```typescript
interface ProcessedEvidence {
  id: string;
  name: string;
  description: string;
  fileURI?: string;
  submittedBy: string;
  timestamp: number;
  side: 'requester' | 'challenger';
}

interface ProcessedMetaEvidence {
  title: string;
  description: string;
  question: string;
  rulingOptions: {
    type: string;
    titles: string[];
    descriptions: string[];
  };
}
```

#### Complete Dispute Data Processing Hook
```typescript
// hooks/useDisputeDataProcessor.ts
import { useState, useEffect } from 'react';
import { useDisputeData } from 'reality-data-service';
import { fetchFromIPFS } from '../utils/ipfs';

interface ProcessedEvidence {
  id: string;
  name: string;
  description: string;
  fileURI?: string;
  submittedBy: string;
  timestamp: number;
  side: 'requester' | 'challenger';
}

interface ProcessedMetaEvidence {
  title: string;
  description: string;
  question: string;
  rulingOptions: {
    type: string;
    titles: string[];
    descriptions: string[];
  };
}

export const useDisputeDataProcessor = (question: Question) => {
  const [processedEvidences, setProcessedEvidences] = useState<ProcessedEvidence[]>([]);
  const [processedMetaEvidence, setProcessedMetaEvidence] = useState<ProcessedMetaEvidence | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get raw dispute data from reality-data-service
  const {
    disputeId,
    dispute,
    disputeLoading,
    evidences,
    metaEvidence,
    arbitrableContractAddress,
  } = useDisputeData(question) || {};

  // Process evidences from IPFS
  useEffect(() => {
    const processEvidences = async () => {
      if (!evidences || evidences.length === 0) return;

      setIsProcessing(true);
      setError(null);

      try {
        const processed = await Promise.all(
          evidences.map(async (evidence: any) => {
            try {
              // Fetch evidence content from IPFS via cdn.kleros.link
              const evidenceData = await fetchFromIPFS(evidence.URI);
              
              return {
                id: evidence.id,
                name: evidenceData.name || `Evidence #${evidence.id}`,
                description: evidenceData.description || '',
                fileURI: evidenceData.fileURI,
                submittedBy: evidence.submitter,
                timestamp: parseInt(evidence.timestamp),
                side: evidence.party === '0' ? 'requester' : 'challenger',
              } as ProcessedEvidence;
            } catch (err) {
              console.error(`Failed to fetch evidence ${evidence.id}:`, err);
              return {
                id: evidence.id,
                name: `Evidence #${evidence.id} (Failed to load)`,
                description: 'Could not load evidence content',
                submittedBy: evidence.submitter,
                timestamp: parseInt(evidence.timestamp),
                side: evidence.party === '0' ? 'requester' : 'challenger',
              } as ProcessedEvidence;
            }
          })
        );

        setProcessedEvidences(processed);
      } catch (err) {
        setError('Failed to process evidences');
        console.error('Evidence processing error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    processEvidences();
  }, [evidences]);

  // Process meta evidence from IPFS
  useEffect(() => {
    const processMetaEvidence = async () => {
      if (!metaEvidence) return;

      try {
        const metaData = await fetchFromIPFS(metaEvidence);
        
        setProcessedMetaEvidence({
          title: metaData.title || 'Dispute',
          description: metaData.description || '',
          question: metaData.question || '',
          rulingOptions: metaData.rulingOptions || {
            type: 'single-select',
            titles: ['Refuse to Arbitrate', 'Yes', 'No'],
            descriptions: ['Refuse to rule', 'Answer is Yes', 'Answer is No'],
          },
        });
      } catch (err) {
        console.error('Failed to fetch meta evidence:', err);
        setProcessedMetaEvidence({
          title: 'Dispute (Meta evidence failed to load)',
          description: '',
          question: '',
          rulingOptions: {
            type: 'single-select',
            titles: ['Refuse to Arbitrate', 'Yes', 'No'],
            descriptions: ['Refuse to rule', 'Answer is Yes', 'Answer is No'],
          },
        });
      }
    };

    processMetaEvidence();
  }, [metaEvidence]);

  return {
    // Raw dispute data from reality-data-service
    disputeId,
    dispute,
    disputeLoading,
    arbitrableContractAddress,
    
    // Processed IPFS data
    processedEvidences,
    processedMetaEvidence,
    isProcessing,
    error,
    
    // Helper functions
    hasDispute: !!disputeId,
    canSubmitEvidence: dispute && !dispute.ruled,
    disputePhase: dispute?.period || 'Unknown',
  };
};
```

### Evidence Fetching Flow
1. Get raw dispute data from `reality-data-service` using `useDisputeData`
2. Extract evidence URIs from the dispute data
3. Fetch evidence content from IPFS using `https://cdn.kleros.link/ipfs/{hash}`
4. Process and validate the evidence metadata
5. Handle errors with fallback data

### Complete Evidence Display Component
```typescript
// components/EvidenceDisplay.tsx
import React from 'react';
import { useDisputeDataProcessor } from '../hooks/useDisputeDataProcessor';

interface EvidenceDisplayProps {
  question: Question;
}

export const EvidenceDisplay: React.FC<EvidenceDisplayProps> = ({ question }) => {
  const {
    processedEvidences,
    processedMetaEvidence,
    isProcessing,
    error,
    hasDispute,
  } = useDisputeDataProcessor(question);

  if (!hasDispute) {
    return (
      <div className="text-gray-500 text-center py-4">
        No dispute for this question
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading evidence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">Error loading evidence: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Meta Evidence */}
      {processedMetaEvidence && (
        <div className="bg-gray-50 border rounded p-4">
          <h3 className="font-semibold text-lg mb-2">{processedMetaEvidence.title}</h3>
          {processedMetaEvidence.description && (
            <p className="text-gray-700 mb-3">{processedMetaEvidence.description}</p>
          )}
          
          <div className="mt-3">
            <h4 className="font-medium text-sm text-gray-600 mb-2">Ruling Options:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {processedMetaEvidence.rulingOptions.titles.map((title, index) => (
                <div key={index} className="bg-white border rounded p-2">
                  <div className="font-medium text-sm">{title}</div>
                  {processedMetaEvidence.rulingOptions.descriptions[index] && (
                    <div className="text-xs text-gray-600 mt-1">
                      {processedMetaEvidence.rulingOptions.descriptions[index]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Evidence List */}
      <div>
        <h3 className="font-semibold text-lg mb-4">
          Evidence ({processedEvidences.length})
        </h3>
        
        {processedEvidences.length === 0 ? (
          <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded">
            No evidence submitted yet
          </div>
        ) : (
          <div className="space-y-4">
            {processedEvidences.map((evidence) => (
              <EvidenceItem key={evidence.id} evidence={evidence} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Evidence Item Component
interface EvidenceItemProps {
  evidence: ProcessedEvidence;
}

const EvidenceItem: React.FC<EvidenceItemProps> = ({ evidence }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSideColor = (side: string) => {
    return side === 'requester' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  };

  const openFile = (fileURI: string) => {
    const url = fileURI.startsWith('ipfs://') 
      ? `https://cdn.kleros.link/ipfs/${fileURI.replace('ipfs://', '')}`
      : fileURI;
    window.open(url, '_blank');
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-lg">{evidence.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSideColor(evidence.side)}`}>
              {evidence.side === 'requester' ? 'Requester' : 'Challenger'}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            Submitted by: <code className="bg-gray-100 px-1 rounded">{evidence.submittedBy}</code>
          </div>
          
          <div className="text-sm text-gray-500">
            {formatDate(evidence.timestamp)}
          </div>
        </div>
      </div>

      {evidence.description && (
        <div className="mb-3">
          <p className="text-gray-700 whitespace-pre-wrap">{evidence.description}</p>
        </div>
      )}

      {evidence.fileURI && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => openFile(evidence.fileURI!)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            View Attachment
          </button>
        </div>
      )}
    </div>
  );
};
```

### Evidence Display Requirements
- Show meta-evidence with ruling options
- List all submitted evidence chronologically
- Display evidence by party (requester/challenger)
- Show submission timestamps and addresses
- Provide links to view attached files
- Handle loading and error states

### Evidence Validation Utilities
```typescript
// utils/evidenceValidation.ts
import { EvidenceMetadata, MetaEvidenceData } from './ipfs';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate evidence metadata structure
 */
export const validateEvidence = (evidence: Partial<EvidenceMetadata>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!evidence.name || evidence.name.trim().length === 0) {
    errors.push('Evidence name is required');
  } else if (evidence.name.length > 200) {
    errors.push('Evidence name must be 200 characters or less');
  }

  if (!evidence.description || evidence.description.trim().length === 0) {
    errors.push('Evidence description is required');
  } else if (evidence.description.length > 2000) {
    warnings.push('Evidence description is very long (over 2000 characters)');
  }

  // Optional file validation
  if (evidence.fileURI) {
    if (!evidence.fileURI.startsWith('ipfs://') && !evidence.fileURI.startsWith('http')) {
      errors.push('File URI must be a valid IPFS or HTTP URL');
    }
  }

  // Category validation
  const validCategories = ['general', 'document', 'image', 'video', 'link'];
  if (evidence.category && !validCategories.includes(evidence.category)) {
    warnings.push(`Unknown category "${evidence.category}". Valid categories: ${validCategories.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate meta evidence structure
 */
export const validateMetaEvidence = (metaEvidence: Partial<MetaEvidenceData>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!metaEvidence.title || metaEvidence.title.trim().length === 0) {
    errors.push('Meta evidence title is required');
  }

  if (!metaEvidence.question || metaEvidence.question.trim().length === 0) {
    errors.push('Meta evidence question is required');
  }

  // Ruling options validation
  if (!metaEvidence.rulingOptions) {
    errors.push('Ruling options are required');
  } else {
    if (!metaEvidence.rulingOptions.titles || metaEvidence.rulingOptions.titles.length < 2) {
      errors.push('At least 2 ruling options are required');
    }

    if (metaEvidence.rulingOptions.descriptions && 
        metaEvidence.rulingOptions.descriptions.length !== metaEvidence.rulingOptions.titles.length) {
      warnings.push('Number of ruling descriptions should match number of titles');
    }

    const validTypes = ['single-select', 'multiple-select'];
    if (metaEvidence.rulingOptions.type && !validTypes.includes(metaEvidence.rulingOptions.type)) {
      warnings.push(`Unknown ruling type "${metaEvidence.rulingOptions.type}". Valid types: ${validTypes.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Sanitize evidence data before upload
 */
export const sanitizeEvidence = (evidence: EvidenceMetadata): EvidenceMetadata => {
  return {
    ...evidence,
    name: evidence.name.trim().substring(0, 200),
    description: evidence.description.trim().substring(0, 2000),
    category: evidence.category || 'general',
  };
};

/**
 * Check if IPFS URI is accessible
 */
export const checkIPFSAccessibility = async (uri: string): Promise<boolean> => {
  try {
    const cleanUri = uri.replace('ipfs://', '');
    const response = await fetch(`https://cdn.kleros.link/ipfs/${cleanUri}`, { 
      method: 'HEAD',
      timeout: 10000 
    });
    return response.ok;
  } catch (error) {
    console.warn('IPFS accessibility check failed:', error);
    return false;
  }
};
```

### IPFS URL Handling
- Remove `ipfs://` prefix and use CDN
- Example: `ipfs://QmHash` → `https://cdn.kleros.link/ipfs/QmHash`
- Implement timeout for IPFS requests (10 seconds)
- Provide fallback for failed evidence loads

### Evidence Submission Form with IPFS Upload
```typescript
// components/EvidenceSubmissionForm.tsx
import React, { useState } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { uploadEvidence, EvidenceMetadata } from '../utils/ipfs';
import { ARBITRATOR_PROXY_ABI } from '../contracts/abis';
import { chainConfig } from '../utils/web3';

interface EvidenceSubmissionFormProps {
  arbitrationId: string;
  selectedChain: string;
  onSuccess: () => void;
}

export const EvidenceSubmissionForm: React.FC<EvidenceSubmissionFormProps> = ({
  arbitrationId,
  selectedChain,
  onSuccess,
}) => {
  const [evidenceData, setEvidenceData] = useState({
    name: '',
    description: '',
    category: 'general',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const config = chainConfig[selectedChain];

  const { write, data, error, isLoading } = useContractWrite({
    address: config.arbitratorProxy,
    abi: ARBITRATOR_PROXY_ABI,
    functionName: 'submitEvidence',
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evidenceData.name || !evidenceData.description) {
      setUploadError('Name and description are required');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      let fileURI = '';
      
      // Upload file to IPFS if provided
      if (file) {
        console.log('Uploading file to IPFS...');
        fileURI = await uploadToIPFS(file);
      }

      // Prepare evidence metadata
      const evidence: EvidenceMetadata = {
        name: evidenceData.name,
        description: evidenceData.description,
        category: evidenceData.category,
        ...(fileURI && { 
          fileURI, 
          fileTypeExtension: file?.name.split('.').pop() || 'unknown' 
        }),
      };

      // Upload evidence metadata to IPFS
      console.log('Uploading evidence metadata to IPFS...');
      const evidenceURI = await uploadEvidence(evidence);

      // Submit evidence to contract
      console.log('Submitting evidence to contract...');
      await write({
        args: [arbitrationId, evidenceURI],
      });

      if (isSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Evidence submission failed:', err);
      setUploadError(`Failed to submit evidence: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = isUploading || isLoading || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Evidence Title *
        </label>
        <input
          type="text"
          value={evidenceData.name}
          onChange={(e) => setEvidenceData({ ...evidenceData, name: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Brief title for your evidence"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Evidence Description *
        </label>
        <textarea
          value={evidenceData.description}
          onChange={(e) => setEvidenceData({ ...evidenceData, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Detailed description of your evidence and how it supports your position"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Category
        </label>
        <select
          value={evidenceData.category}
          onChange={(e) => setEvidenceData({ ...evidenceData, category: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="general">General</option>
          <option value="document">Document</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="link">External Link</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Attach File (Optional)
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />
        {file && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <div className="bg-blue-50 p-3 rounded">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Evidence will be uploaded to IPFS and permanently stored. 
          Make sure your evidence is relevant and supports your position in the dispute.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting Evidence...' : 'Submit Evidence'}
      </button>

      {(uploadError || error) && (
        <div className="text-red-500 text-sm">
          Error: {uploadError || error?.message}
        </div>
      )}
    </form>
  );
};
```

### Deliverables
- IPFS upload/download utilities
- Evidence processing pipeline
- Evidence display UI with meta-evidence
- Validation and sanitization functions
- Error handling with user-friendly messages
- Complete evidence submission form with file upload
- Real-time evidence loading and display

---

## Prompt 5: Next.js Routing and IPFS Deployment

### Title: Set up Next.js App Router with IPFS-Compatible Hash Routing

### Context
Building on all previous features, implement Next.js 14 App Router with IPFS-compatible hash routing for deployment on distributed networks. This enables the application to work on IPFS gateways and ENS domains.

### Requirements
1. Configure Next.js 14 App Router structure:
   - `/chain/[chainId]` - Questions list page
   - `/chain/[chainId]/question/[questionId]` - Question detail page
2. Implement `HashRouting` component for IPFS compatibility
3. Create chain mapping utilities for URL handling
4. Configure `next.config.js` for static export
5. Build shareable deep links with hash routing

### Project Structure
```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page (redirects to /chain/1)
├── chain/
│   ├── [chainId]/
│   │   ├── page.tsx           # Questions list page
│   │   └── question/
│   │       └── [questionId]/
│   │           └── page.tsx   # Question detail page
│   └── page.tsx               # Chain index (redirects to /chain/1)
├── components/
│   ├── ChainProvider.tsx      # Chain context provider
│   ├── HashRouting.tsx        # Client-side hash routing
│   └── ...
utils/
├── chainMapping.ts
└── environment.ts
```

### URL Structure Design

#### Regular Hosting
- Homepage: `https://yourapp.com/`
- Ethereum questions: `https://yourapp.com/chain/1`
- Gnosis questions: `https://yourapp.com/chain/100`
- Polygon questions: `https://yourapp.com/chain/137`
- Specific question: `https://yourapp.com/chain/1/question/0x1234...`

#### IPFS Hosting with Hash Routing
- Homepage: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/1`
- Ethereum questions: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/1`
- Gnosis questions: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/100`
- Specific question: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/1/question/0x1234...`

#### ENS Domain with IPFS
- Homepage: `https://yourapp.eth.link/#/chain/1`
- Specific question: `https://yourapp.eth.link/#/chain/1/question/0x1234...`

### Chain Mapping Implementation

#### Complete Chain Mapping Utilities (utils/chainMapping.ts)
```typescript
import { mainnet, gnosis, polygon } from 'viem/chains';

// Map chain IDs to chain names and configs
export const CHAIN_ID_TO_NAME: Record<number, string> = {
  1: 'ethereum',      // Ethereum Mainnet
  100: 'gnosis',      // Gnosis Chain
  137: 'polygon',     // Polygon
};

export const CHAIN_NAME_TO_ID: Record<string, number> = {
  ethereum: 1,
  gnosis: 100,
  polygon: 137,
};

// Default chain (Ethereum mainnet)
export const DEFAULT_CHAIN_ID = 1;
export const DEFAULT_CHAIN_NAME = 'ethereum';

export const getChainNameFromId = (chainId: number): string => {
  return CHAIN_ID_TO_NAME[chainId] || DEFAULT_CHAIN_NAME;
};

export const getChainIdFromName = (chainName: string): number => {
  return CHAIN_NAME_TO_ID[chainName] || DEFAULT_CHAIN_ID;
};

export const isValidChainId = (chainId: number): boolean => {
  return chainId in CHAIN_ID_TO_NAME;
};

// URL-safe chain validation
export const validateAndNormalizeChainId = (chainIdParam: string): number => {
  const chainId = parseInt(chainIdParam, 10);
  return isValidChainId(chainId) ? chainId : DEFAULT_CHAIN_ID;
};

// Next.js specific URL utilities
export const buildChainUrl = (chainId: number): string => {
  return `/chain/${chainId}`;
};

export const buildQuestionUrl = (chainId: number, questionId: string): string => {
  return `/chain/${chainId}/question/${questionId}`;
};

// Hash-based routing for IPFS
export const buildHashUrl = (path: string): string => {
  return `#${path}`;
};

export const parseHashUrl = (hash: string): { chainId?: number; questionId?: string } => {
  const match = hash.match(/^#?\/chain\/(\d+)(?:\/question\/([^?]+))?/);
  if (!match) return {};
  
  const chainId = parseInt(match[1], 10);
  const questionId = match[2];
  
  return { 
    chainId: isValidChainId(chainId) ? chainId : DEFAULT_CHAIN_ID,
    questionId 
  };
};
```

### Next.js Configuration

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  distDir: 'out',
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
```

### Complete Hash Routing Implementation

#### Hash Routing Component for IPFS Compatibility (app/components/HashRouting.tsx)
```typescript
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { parseHashUrl, buildChainUrl, buildQuestionUrl, DEFAULT_CHAIN_ID } from '../../utils/chainMapping';

interface HashRoutingProps {
  children: React.ReactNode;
}

export const HashRouting: React.FC<HashRoutingProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Handle hash-based routing for IPFS compatibility
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const { chainId, questionId } = parseHashUrl(hash);
        
        let targetPath = '';
        if (questionId) {
          targetPath = buildQuestionUrl(chainId || DEFAULT_CHAIN_ID, questionId);
        } else if (chainId) {
          targetPath = buildChainUrl(chainId);
        } else {
          targetPath = buildChainUrl(DEFAULT_CHAIN_ID);
        }
        
        // Only navigate if we're not already on the target path
        if (pathname !== targetPath) {
          router.push(targetPath);
        }
      }
    };

    // Handle initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [router, pathname]);

  return <>{children}</>;
};
```

#### Enhanced Chain Context with Next.js Integration (app/components/ChainProvider.tsx)
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useAccount, useNetwork } from 'wagmi';
import { 
  getChainNameFromId, 
  getChainIdFromName, 
  validateAndNormalizeChainId,
  DEFAULT_CHAIN_ID,
  buildChainUrl,
  buildQuestionUrl,
  buildHashUrl,
  isValidChainId
} from '../../utils/chainMapping';

interface ChainContextType {
  selectedChain: string;
  selectedChainId: number;
  setSelectedChain: (chain: string) => void;
  setSelectedChainId: (chainId: number) => void;
  supportedChains: string[];
  supportedChainIds: number[];
  isConnected: boolean;
  switchChain: (chainName: string) => Promise<void>;
  navigateToChain: (chainId: number) => void;
  navigateToQuestion: (chainId: number, questionId: string) => void;
  updateUrlHash: (chainId: number, questionId?: string) => void;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  // Get chain from URL or default to Ethereum
  const urlChainId = params?.chainId ? validateAndNormalizeChainId(params.chainId as string) : DEFAULT_CHAIN_ID;
  const [selectedChainId, setSelectedChainIdState] = useState(urlChainId);
  const selectedChain = getChainNameFromId(selectedChainId);

  const { isConnected } = useAccount();
  const { chain, switchNetwork } = useNetwork();

  const supportedChains = ['ethereum', 'gnosis', 'polygon'];
  const supportedChainIds = [1, 100, 137];

  // Update URL hash for IPFS compatibility
  const updateUrlHash = (chainId: number, questionId?: string) => {
    const path = questionId ? buildQuestionUrl(chainId, questionId) : buildChainUrl(chainId);
    window.location.hash = buildHashUrl(path);
  };

  // Update URL when chain changes
  const setSelectedChainId = (chainId: number) => {
    if (!isValidChainId(chainId)) return;
    
    setSelectedChainIdState(chainId);
    
    // Update URL to reflect chain change
    if (pathname.includes('/question/')) {
      // If on question detail page, stay on same question but change chain
      const questionId = params?.questionId as string;
      if (questionId) {
        const newPath = buildQuestionUrl(chainId, questionId);
        router.push(newPath);
        updateUrlHash(chainId, questionId);
      } else {
        const newPath = buildChainUrl(chainId);
        router.push(newPath);
        updateUrlHash(chainId);
      }
    } else {
      // Navigate to questions list for new chain
      const newPath = buildChainUrl(chainId);
      router.push(newPath);
      updateUrlHash(chainId);
    }
  };

  const setSelectedChain = (chainName: string) => {
    const chainId = getChainIdFromName(chainName);
    setSelectedChainId(chainId);
  };

  const switchChain = async (chainName: string) => {
    const config = chainConfig[chainName];
    if (switchNetwork) {
      await switchNetwork(config.chain.id);
    }
    setSelectedChain(chainName);
  };

  const navigateToChain = (chainId: number) => {
    const path = buildChainUrl(chainId);
    router.push(path);
    updateUrlHash(chainId);
  };

  const navigateToQuestion = (chainId: number, questionId: string) => {
    const path = buildQuestionUrl(chainId, questionId);
    router.push(path);
    updateUrlHash(chainId, questionId);
  };

  // Sync with URL changes
  useEffect(() => {
    const urlChainId = params?.chainId ? validateAndNormalizeChainId(params.chainId as string) : DEFAULT_CHAIN_ID;
    if (urlChainId !== selectedChainId) {
      setSelectedChainIdState(urlChainId);
    }
  }, [params?.chainId]);

  // Sync with wallet network changes
  useEffect(() => {
    if (chain && chain.id !== selectedChainId) {
      const chainName = getChainNameFromId(chain.id);
      if (supportedChains.includes(chainName)) {
        setSelectedChainId(chain.id);
      }
    }
  }, [chain]);

  // Update hash when route changes
  useEffect(() => {
    const questionId = params?.questionId as string;
    updateUrlHash(selectedChainId, questionId);
  }, [selectedChainId, params?.questionId]);

  return (
    <ChainContext.Provider value={{
      selectedChain,
      selectedChainId,
      setSelectedChain,
      setSelectedChainId,
      supportedChains,
      supportedChainIds,
      isConnected,
      switchChain,
      navigateToChain,
      navigateToQuestion,
      updateUrlHash,
    }}>
      {children}
    </ChainContext.Provider>
  );
};

export const useChain = () => {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
};
```

### Complete Environment Detection (utils/environment.ts)
```typescript
export const isIPFS = () => {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'ipfs:' || 
         window.location.hostname.includes('ipfs') ||
         window.location.hostname.includes('.eth') ||
         window.location.hostname.includes('gateway');
};

export const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  if (isIPFS()) {
    // For IPFS, use relative paths
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
  }
  return window.location.origin;
};

export const getShareableUrl = (chainId: number, questionId?: string) => {
  const basePath = questionId ? `/chain/${chainId}/question/${questionId}` : `/chain/${chainId}`;
  const hashPath = `#${basePath}`;
  
  if (isIPFS()) {
    return `${getBaseUrl()}${hashPath}`;
  }
  return `${window.location.origin}${basePath}`;
};
```

### Complete Next.js Pages Implementation

#### Root Layout with IPFS Support (app/layout.tsx)
```typescript
import React from 'react';
import { ChainProvider } from './components/ChainProvider';
import { HashRouting } from './components/HashRouting';
import './globals.css';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // IPFS hash routing fallback
              if (typeof window !== 'undefined' && window.location.hash) {
                const hash = window.location.hash.substring(1);
                if (hash && !window.location.pathname.includes(hash)) {
                  window.history.replaceState(null, '', hash);
                }
              }
            `,
          }}
        />
      </head>
      <body>
        <ChainProvider>
          <HashRouting>
            {children}
          </HashRouting>
        </ChainProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: 'Kleros Optimistic Oracle',
  description: 'Multi-chain Reality.eth questions and disputes',
};
```

#### Home Page with Default Redirect (app/page.tsx)
```typescript
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/chain/1');
}
```

#### Chain Index Page (app/chain/page.tsx)
```typescript
import { redirect } from 'next/navigation';

export default function ChainIndexPage() {
  redirect('/chain/1');
}
```

#### Questions List Page (app/chain/[chainId]/page.tsx)
```typescript
'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChain } from '../../components/ChainProvider';
import { useEnhancedQuestions } from '../../../hooks/useEnhancedQuestions';
import { QuestionsList } from '../../../components/QuestionsList';
import { ChainSelector } from '../../../components/ChainSelector';
import { validateAndNormalizeChainId, getChainNameFromId } from '../../../utils/chainMapping';

export default function QuestionsPage() {
  const params = useParams();
  const { selectedChain, selectedChainId, setSelectedChainId, navigateToQuestion } = useChain();
  
  // Validate and sync chain from URL
  useEffect(() => {
    if (params.chainId) {
      const chainId = validateAndNormalizeChainId(params.chainId as string);
      if (chainId !== selectedChainId) {
        setSelectedChainId(chainId);
      }
    }
  }, [params.chainId, selectedChainId, setSelectedChainId]);

  const { questions, loading, error, hasMore, loadMore } = useEnhancedQuestions(
    selectedChain,
    {} // Default filters
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 m-4">
        <h2 className="text-red-800 font-semibold">Error Loading Questions</h2>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with chain selector */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reality.eth Questions</h1>
          <p className="text-gray-600">
            Chain: {getChainNameFromId(selectedChainId)} (ID: {selectedChainId})
          </p>
        </div>
        <ChainSelector />
      </div>

      {/* Questions list */}
      <QuestionsList 
        questions={questions}
        hasMore={hasMore}
        loadMore={loadMore}
        onQuestionClick={(questionId) => {
          // Navigate to question detail with current chain
          navigateToQuestion(selectedChainId, questionId);
        }}
      />
    </div>
  );
}
```

#### Question Detail Page with Deep Linking (app/chain/[chainId]/question/[questionId]/page.tsx)
```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChain } from '../../../../components/ChainProvider';
import { useDisputeDataProcessor } from '../../../../../hooks/useDisputeDataProcessor';
import { QuestionDetail } from '../../../../../components/QuestionDetail';
import { EvidenceDisplay } from '../../../../../components/EvidenceDisplay';
import { ShareButton } from '../../../../../components/ShareButton';
import { validateAndNormalizeChainId, getChainNameFromId } from '../../../../../utils/chainMapping';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedChain, selectedChainId, setSelectedChainId, navigateToChain } = useChain();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const questionId = params.questionId as string;
  const urlChainId = params.chainId ? validateAndNormalizeChainId(params.chainId as string) : null;

  // Validate URL parameters
  useEffect(() => {
    if (!questionId) {
      navigateToChain(selectedChainId);
      return;
    }

    if (urlChainId && urlChainId !== selectedChainId) {
      setSelectedChainId(urlChainId);
    }
  }, [questionId, urlChainId, selectedChainId, setSelectedChainId, navigateToChain]);

  // Fetch question data
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId || !selectedChain) return;

      setLoading(true);
      setError(null);

      try {
        // Use reality-data-service to fetch specific question
        // This is a simplified example - you'd use the actual API
        const response = await fetch(`/api/questions/${selectedChain}/${questionId}`);
        if (!response.ok) throw new Error('Question not found');
        
        const questionData = await response.json();
        setQuestion(questionData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, selectedChain]);

  // Get dispute data for the question
  const disputeData = useDisputeDataProcessor(question);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h2 className="text-red-800 font-semibold">Question Not Found</h2>
          <p className="text-red-600">{error || 'The requested question could not be found.'}</p>
          <button
            onClick={() => navigateToChain(selectedChainId)}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <button 
          onClick={() => navigateToChain(selectedChainId)}
          className="hover:text-blue-600"
        >
          {getChainNameFromId(selectedChainId)} Questions
        </button>
        <span className="mx-2">›</span>
        <span className="text-gray-800">Question {questionId.slice(0, 8)}...</span>
      </nav>

      {/* Share button */}
      <div className="flex justify-end mb-4">
        <ShareButton questionId={questionId} />
      </div>

      {/* Question details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuestionDetail question={question} />
        </div>
        
        <div className="lg:col-span-1">
          <EvidenceDisplay question={question} />
        </div>
      </div>
    </div>
  );
}
```

### Enhanced URL Handling and Validation

#### URL Validation and Fallbacks (utils/urlHandling.ts)
```typescript
import { DEFAULT_CHAIN_ID, isValidChainId } from './chainMapping';

export const handleInvalidUrl = (chainId?: string, questionId?: string) => {
  const validChainId = chainId ? 
    (isValidChainId(parseInt(chainId)) ? parseInt(chainId) : DEFAULT_CHAIN_ID) : 
    DEFAULT_CHAIN_ID;
  
  if (questionId && !isValidQuestionId(questionId)) {
    // Invalid question ID, redirect to chain questions
    return `/chain/${validChainId}`;
  }
  
  return questionId ? `/chain/${validChainId}/question/${questionId}` : `/chain/${validChainId}`;
};

export const isValidQuestionId = (questionId: string): boolean => {
  // Basic validation for question ID format
  return /^0x[a-fA-F0-9]{64}$/.test(questionId);
};
```

#### Deep Linking Implementation (components/ShareButton.tsx)
```typescript
'use client';

import React from 'react';
import { useChain } from './ChainProvider';
import { getShareableUrl } from '../utils/environment';

interface ShareButtonProps {
  questionId?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ questionId, className = '' }) => {
  const { selectedChainId } = useChain();
  
  const handleShare = async () => {
    const url = getShareableUrl(selectedChainId, questionId);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: questionId ? 'Reality.eth Question' : 'Reality.eth Questions',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        // Show toast notification
        console.log('URL copied to clipboard:', url);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <button
      onClick={handleShare}
      className={`px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border ${className}`}
    >
      📋 Share Link
    </button>
  );
};
```

### Contract Address Management

#### Using reality-data-service for Contract Addresses
**Important**: You do NOT need to hardcode Reality.eth or arbitrator proxy contract addresses. The `reality-data-service` package manages all contract addresses through its `BRIDGES` configuration system.

```typescript
// utils/contractLookup.ts
import { BRIDGES, getBridgeByName } from 'reality-data-service';

export const getContractAddresses = (chainName: string, arbitratorAddress?: string) => {
  // Find bridges for the specified chain
  const chainBridges = BRIDGES.filter(bridge => 
    bridge['Home Chain'].toLowerCase() === chainName.toLowerCase()
  );
  
  // If arbitrator address is provided, find specific bridge
  if (arbitratorAddress) {
    const bridge = chainBridges.find(bridge => 
      bridge['Home Proxy'].toLowerCase() === arbitratorAddress.toLowerCase()
    );
    
    return {
      realityContract: bridge?.Oracle,
      arbitratorProxy: bridge?.['Home Proxy'],
      foreignProxy: bridge?.['Foreign Proxy'],
      bridgeName: bridge?.Name
    };
  }
  
  // Return all available contracts for the chain
  return chainBridges.map(bridge => ({
    realityContract: bridge.Oracle,
    arbitratorProxy: bridge['Home Proxy'],
    foreignProxy: bridge['Foreign Proxy'],
    bridgeName: bridge.Name,
    appeals: bridge.Appeals,
    testnet: bridge.Testnet === 'Yes'
  }));
};

// Usage example
const ethereumContracts = getContractAddresses('ethereum');
const gnosisContracts = getContractAddresses('gnosis', '0x68154ea682f95bf582b80dd6453fa401737491dc');
```

### Adding Support for New Chains

The architecture is designed to make adding new chains extremely simple. To add support for a new blockchain (e.g., Arbitrum, Optimism, Base), you only need to:

#### 1. Add Chain Configuration
```typescript
// utils/web3.ts - Add to chainConfig object
arbitrum: {
  chain: arbitrum, // from viem/chains
  rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
  // Note: Contract addresses are managed by reality-data-service via BRIDGES configuration
  // They will be retrieved dynamically based on questions and dispute data
},
```

#### 2. Add Environment Variables
```env
# .env - Add only RPC URL (contract addresses handled by reality-data-service)
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
```

#### 3. Update Chain Selector
```typescript
// contexts/ChainContext.tsx - Add to supportedChains array
const supportedChains = ['ethereum', 'gnosis', 'polygon', 'arbitrum'];
```

#### 4. Verify reality-data-service Support
Ensure the `reality-data-service` package supports the new chain's subgraph endpoint. If not, you may need to:
- Request support from the package maintainers, or
- Fork and extend the package with the new chain's subgraph URL

**That's it!** All components, hooks, and functionality will automatically work with the new chain.

### Build Configuration and Scripts

#### Package.json Configuration
```json
{
  "scripts": {
    "build": "next build",
    "build:ipfs": "next build && echo 'Build complete. Upload the out/ folder to IPFS.'",
    "serve:ipfs": "npx serve -s out -l 3000",
    "export": "next export"
  }
}
```

### Validation Requirements
- Chain ID validation (only 1, 100, 137 allowed)
- Question ID format validation (0x followed by 64 hex characters)
- Fallback to default chain for invalid IDs
- Redirect logic for invalid URLs
- IPFS accessibility checks for evidence

### URL Examples and Deep Linking

#### URL Structure Examples

1. **Development/Regular Hosting:**
   - Homepage: `https://yourapp.com/`
   - Ethereum questions: `https://yourapp.com/chain/1`
   - Gnosis questions: `https://yourapp.com/chain/100`
   - Polygon questions: `https://yourapp.com/chain/137`
   - Specific question: `https://yourapp.com/chain/1/question/0x1234...`

2. **IPFS Hosting with Hash Routing:**
   - Homepage: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/1`
   - Ethereum questions: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/1`
   - Gnosis questions: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/100`
   - Polygon questions: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/137`
   - Specific question: `https://gateway.ipfs.io/ipfs/QmHash/#/chain/1/question/0x1234...`

3. **ENS Domain with IPFS:**
   - Homepage: `https://yourapp.eth.link/#/chain/1`
   - Ethereum questions: `https://yourapp.eth.link/#/chain/1`
   - Gnosis questions: `https://yourapp.eth.link/#/chain/100`
   - Specific question: `https://yourapp.eth.link/#/chain/1/question/0x1234...`

### Deliverables
- Complete Next.js App Router structure with dynamic routes
- IPFS-compatible hash routing system
- Static site generation configuration ready for deployment
- Deep linking support with shareable URLs across all environments
- Chain and question navigation functions
- URL validation and error handling
- Build output optimized for IPFS deployment
- Contract address management via reality-data-service
- Extensible architecture for adding new chains

---

## Implementation Notes

### Execution Order
These prompts should be executed sequentially:
1. **Prompt 1**: Sets up the foundation with Web3 integration
2. **Prompt 2**: Adds question creation functionality
3. **Prompt 3**: Implements answer submission and dispute creation
4. **Prompt 4**: Adds IPFS integration and evidence display
5. **Prompt 5**: Completes the app with routing and deployment configuration

### Key Technical Considerations

#### Contract Address Management
- Contract addresses are dynamically retrieved from `reality-data-service`
- Use the `BRIDGES` configuration system for address lookup
- Do NOT hardcode contract addresses

#### Adding New Chains
To add support for a new chain (e.g., Arbitrum):
1. Add chain configuration to `utils/web3.ts`
2. Add RPC URL environment variable
3. Update supported chains in ChainContext
4. Verify `reality-data-service` support

#### Security Considerations
1. Contract Verification: Ensure all contract addresses are verified
2. Input Validation: Comprehensive validation for all user inputs
3. Transaction Simulation: Simulate before execution
4. Private Key Management: Use wallet integration properly
5. Rate Limiting: Implement for API calls
6. Error Handling: Graceful handling with user-friendly messages
7. Gas Limit Management: Proper estimation and limits
8. Slippage Protection: For bond calculations

#### Testing Strategy
1. Unit Tests: Test individual components and hooks
2. Integration Tests: Test full user flows across chains
3. Contract Tests: Test interactions with forked networks
4. E2E Tests: Complete user journeys
5. Security Tests: Audit contract interactions

### Dependencies
```json
{
  "dependencies": {
    "viem": "^2.7.0",
    "wagmi": "^2.5.0",
    "@tanstack/react-query": "^5.0.0",
    "react-router-dom": "^6.8.0",
    "reality-data-service": "^0.6.2",
    "light-curate-data-service": "^1.0.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Environment Variables
```env
# RPC URLs
ETHEREUM_RPC_URL=https://eth.llamarpc.com
GNOSIS_RPC_URL=https://rpc.gnosischain.com
POLYGON_RPC_URL=https://polygon-rpc.com

# API Keys
ALCHEMY_API_KEY=your_alchemy_key
INFURA_API_KEY=your_infura_key
WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

This implementation guide provides a complete roadmap for building a fully functional multi-chain Kleros Optimistic Oracle with question creation, answer submission, and dispute functionality while maintaining compatibility with IPFS deployment.