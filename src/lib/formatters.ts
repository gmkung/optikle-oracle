
/**
 * Formats a timestamp to a readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Formats an address to a shortened form
 */
export function shortenAddress(address: string | undefined | null): string {
  // Check if address is falsy (null, undefined, empty string)
  if (!address) return 'Unknown';
  
  // Check if address is already an Ethereum format (starts with 0x)
  // and has sufficient length to be shortened
  if (typeof address === 'string' && address.startsWith('0x') && address.length >= 10) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  // If address exists but isn't in the right format, return it as is
  // so we can see what format is coming from the API
  console.log("Address format received:", address);
  return String(address);
}

/**
 * Formats a bond amount (usually in wei) to a readable form
 */
export function formatBond(bond: string, nativeCurrency?: string): string {
  if (!bond) return '0';
  
  const currency = nativeCurrency || '';
  const bondValue = parseInt(bond);
  
  // Always display in native currency units (convert from wei to native currency units)
  const formattedValue = (bondValue / 1e18).toFixed(6);
  
  // Remove trailing zeros after decimal point
  const cleanedValue = parseFloat(formattedValue).toString();
  
  return `${cleanedValue} ${currency}`;
}

/**
 * Returns a color class based on the question phase
 */
export function getPhaseColor(phase: string): string {
  switch (phase) {
    case 'OPEN':
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950';
    case 'UPCOMING':
      return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950';
    case 'PENDING_ARBITRATION':
      return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950';
    case 'FINALIZED':
      return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  }
}

/**
 * Returns time remaining in a human-readable format
 */
export function formatTimeRemaining(timeMs: number): string {
  if (timeMs <= 0) return 'Expired';
  
  const seconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Truncates text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
// Improved formatting utilities for better data display
// Improved data formatting for better display consistency
