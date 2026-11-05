export interface CleanReplyResult {
  /** The clean message body with quoted threads, signatures, and disclaimers removed */
  clean: string;
  /** Detected email signature (e.g. 'Best regards, Alex', 'Sent from my iPhone') */
  signature: string | null;
  /** Quoted historical message thread */
  quoted: string | null;
  /** Extracted corporate confidentiality disclaimer */
  disclaimer: string | null;
  /** Whether the message is a forwarded email */
  isForward: boolean;
}

/**
 * Parses raw inbound email text into structured components
 * @param rawText Raw incoming email plain text or converted HTML body
 */
export function cleanReply(rawText: string): CleanReplyResult;

export default cleanReply;
