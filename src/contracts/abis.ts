// src/contracts/abis.ts
// Reality.eth v3.0 ABI - Essential functions for question creation and management
export const REALITY_ETH_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "template_id", "type": "uint256" },
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "address", "name": "arbitrator", "type": "address" },
      { "internalType": "uint32", "name": "timeout", "type": "uint32" },
      { "internalType": "uint32", "name": "opening_ts", "type": "uint32" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" }
    ],
    "name": "askQuestion",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "template_id", "type": "uint256" },
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "address", "name": "arbitrator", "type": "address" },
      { "internalType": "uint32", "name": "timeout", "type": "uint32" },
      { "internalType": "uint32", "name": "opening_ts", "type": "uint32" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" },
      { "internalType": "uint256", "name": "min_bond", "type": "uint256" }
    ],
    "name": "askQuestionWithMinBond",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "question_id", "type": "bytes32" },
      { "internalType": "bytes32", "name": "answer", "type": "bytes32" },
      { "internalType": "uint256", "name": "max_previous", "type": "uint256" }
    ],
    "name": "submitAnswer",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "question_id", "type": "bytes32" }
    ],
    "name": "fundAnswerBounty",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "question_id", "type": "bytes32" }
    ],
    "name": "getArbitrator",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "question_id", "type": "bytes32" }
    ],
    "name": "getBounty",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "question_id", "type": "bytes32" }
    ],
    "name": "getBestAnswer",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "content", "type": "string" }
    ],
    "name": "createTemplate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "content", "type": "string" },
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "address", "name": "arbitrator", "type": "address" },
      { "internalType": "uint32", "name": "timeout", "type": "uint32" },
      { "internalType": "uint32", "name": "opening_ts", "type": "uint32" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" }
    ],
    "name": "createTemplateAndAskQuestion",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "payable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "question_id", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "template_id", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "question", "type": "string" },
      { "indexed": true, "internalType": "bytes32", "name": "content_hash", "type": "bytes32" },
      { "indexed": false, "internalType": "address", "name": "arbitrator", "type": "address" },
      { "indexed": false, "internalType": "uint32", "name": "timeout", "type": "uint32" },
      { "indexed": false, "internalType": "uint32", "name": "opening_ts", "type": "uint32" },
      { "indexed": false, "internalType": "uint256", "name": "nonce", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "created", "type": "uint256" }
    ],
    "name": "LogNewQuestion",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "question_id", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "answer", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "bond", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "ts", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "is_commitment", "type": "bool" }
    ],
    "name": "LogNewAnswer",
    "type": "event"
  }
] as const;

// ArbitratorProxy ABI for arbitration requests
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
  {
    "inputs": [
      {"internalType": "bytes32", "name": "_questionID", "type": "bytes32"}
    ],
    "name": "getDisputeFee",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "arbitratorExtraData",
    "outputs": [
      {"internalType": "bytes", "name": "", "type": "bytes"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_arbitrationID", "type": "uint256"},
      {"internalType": "uint256", "name": "_answer", "type": "uint256"}
    ],
    "name": "fundAppeal",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_arbitrationID", "type": "uint256"},
      {"internalType": "string", "name": "_evidenceURI", "type": "string"}
    ],
    "name": "submitEvidence",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_arbitrationID", "type": "uint256"},
      {"internalType": "address", "name": "_beneficiary", "type": "address"},
      {"internalType": "uint256", "name": "_round", "type": "uint256"},
      {"internalType": "uint256", "name": "_answer", "type": "uint256"}
    ],
    "name": "withdrawFeesAndRewards",
    "outputs": [
      {"internalType": "uint256", "name": "reward", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_arbitrationID", "type": "uint256"},
      {"internalType": "address", "name": "_beneficiary", "type": "address"},
      {"internalType": "uint256", "name": "_contributedTo", "type": "uint256"}
    ],
    "name": "withdrawFeesAndRewardsForAllRounds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_arbitrationID", "type": "uint256"},
      {"internalType": "address", "name": "_beneficiary", "type": "address"},
      {"internalType": "uint256", "name": "_contributedTo", "type": "uint256"}
    ],
    "name": "getTotalWithdrawableAmount",
    "outputs": [
      {"internalType": "uint256", "name": "sum", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "_questionID", "type": "bytes32"},
      {"internalType": "address", "name": "_requester", "type": "address"}
    ],
    "name": "handleFailedDisputeCreation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_arbitrationID", "type": "uint256"}
    ],
    "name": "getNumberOfRounds",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_arbitrationID", "type": "uint256"},
      {"internalType": "uint256", "name": "_round", "type": "uint256"}
    ],
    "name": "getRoundInfo",
    "outputs": [
      {"internalType": "uint256[]", "name": "paidFees", "type": "uint256[]"},
      {"internalType": "uint256", "name": "feeRewards", "type": "uint256"},
      {"internalType": "uint256[]", "name": "fundedAnswers", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_arbitrationID", "type": "uint256"},
      {"internalType": "uint256", "name": "_round", "type": "uint256"},
      {"internalType": "uint256", "name": "_answer", "type": "uint256"}
    ],
    "name": "getFundingStatus",
    "outputs": [
      {"internalType": "uint256", "name": "raised", "type": "uint256"},
      {"internalType": "bool", "name": "fullyFunded", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "_questionID", "type": "bytes32"}
    ],
    "name": "questionIDToArbitrationID",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "questionID", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "requester", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "maxPrevious", "type": "uint256"}
    ],
    "name": "ArbitrationRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "questionID", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "requester", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "disputeID", "type": "uint256"}
    ],
    "name": "ArbitrationCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "questionID", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "requester", "type": "address"}
    ],
    "name": "ArbitrationCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "questionID", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "requester", "type": "address"}
    ],
    "name": "ArbitrationFailed",
    "type": "event"
  }
] as const;

// Default arbitrator addresses for different chains
export const DEFAULT_ARBITRATORS: { [key: string]: string } = {
  ethereum: '0x988b3A538b618C7A603e1c11Ab82Cd16dbE28069', // Kleros Court
  gnosis: '0x68154EA682f95BF582b80Dd6453FA401737491Dc', // Kleros Court on Gnosis
  polygon: '0x5AFa42b30955f137e10f89dfb5EF1542a186F90e', // Kleros Court on Polygon
};

// Template for single-select questions
export const SINGLE_SELECT_TEMPLATE = '{"title":"%s","type":"single-select","outcomes":[%s],"category":"%s","lang":"en"}';

// Helper to format question for Reality.eth
export const formatQuestionForReality = (
  title: string,
  outcomes: string[],
  category: string,
  description?: string
) => {
  // Reality.eth template format: {title}␟{category}␟{language}
  // Using \u241f as the separator character
  const language = 'en';
  
  return `${title}\u241f${category}\u241f${language}`;
}; // Fixed Reality.eth template format for proper question creation
// Fixed Reality.eth template format - now using proper separator
// Fixed Reality.eth template format with proper separator characters
