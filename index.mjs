/**
 * clean-reply — Zero-dependency Inbound Email Thread & Signature Parser
 * Designed for Resend Inbound webhooks & conversational AI pipelines.
 */

const QUOTE_PATTERNS = [
  /^(?:On|Le|Am|El|Op)\s+.{1,250}\s+(?:wrote|écrit|geschrieben|escribió|schreef):/im,
  /^-{3,}\s*(?:Original Message|Message d'origine|Ursprüngliche Nachricht)\s*-{3,}/im,
  /^\s*From:\s+.*[\r\n]+\s*Sent:\s+.*[\r\n]+\s*To:\s+.*[\r\n]+\s*Subject:\s+.*/im,
  /^-{3,}\s*(?:Forwarded message|Message transféré|Weitergeleitete Nachricht)\s*-{3,}/im,
  /^_{10,}/m,
  /^-{10,}/m,
];

const SIGNATURE_PATTERNS = [
  /^--\s*$/m,
  /^---\s*$/m,
  /^Sent from my (?:iPhone|iPad|Mac|Galaxy|Android)/im,
  /^Get Outlook for (?:iOS|Android|Windows)/im,
  /^Sent from (?:Mailbox|ProtonMail|Superhuman)/im,
  /^(?:Warm regards|Best regards|Kind regards|Best|Cheers|Thanks|Thank you|Sincerely),?\s*$/im,
];

const DISCLAIMER_PATTERNS = [
  /(?:This e-mail|This email|This message) and any files transmitted with it are confidential/i,
  /The information contained in this communication is confidential/i,
];

export function cleanReply(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return { clean: "", signature: null, quoted: null, disclaimer: null, isForward: false };
  }

  let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const isForward = /-{3,}\s*Forwarded message\s*-{3,}/i.test(text) || /^From:.*\nSubject: Fwd:/im.test(text);

  let cleanText = text;
  let quotedText = null;
  let signatureText = null;
  let disclaimerText = null;

  let earliestQuoteIndex = -1;
  for (const pattern of QUOTE_PATTERNS) {
    const match = cleanText.match(pattern);
    if (match && match.index !== undefined) {
      if (earliestQuoteIndex === -1 || match.index < earliestQuoteIndex) {
        earliestQuoteIndex = match.index;
      }
    }
  }

  const lines = cleanText.split("\n");
  let quoteLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(">")) {
      quoteLineIndex = i;
      break;
    }
  }

  if (quoteLineIndex !== -1) {
    const charIndex = lines.slice(0, quoteLineIndex).join("\n").length + (quoteLineIndex > 0 ? 1 : 0);
    if (earliestQuoteIndex === -1 || charIndex < earliestQuoteIndex) {
      earliestQuoteIndex = charIndex;
    }
  }

  if (earliestQuoteIndex !== -1) {
    quotedText = cleanText.slice(earliestQuoteIndex).trim();
    cleanText = cleanText.slice(0, earliestQuoteIndex).trim();
  }

  for (const dPattern of DISCLAIMER_PATTERNS) {
    const dMatch = cleanText.match(dPattern);
    if (dMatch && dMatch.index !== undefined) {
      disclaimerText = cleanText.slice(dMatch.index).trim();
      cleanText = cleanText.slice(0, dMatch.index).trim();
      break;
    }
  }

  for (const sPattern of SIGNATURE_PATTERNS) {
    const sMatch = cleanText.match(sPattern);
    if (sMatch && sMatch.index !== undefined && sMatch.index > 0) {
      signatureText = cleanText.slice(sMatch.index).trim();
      cleanText = cleanText.slice(0, sMatch.index).trim();
      break;
    }
  }

  return {
    clean: cleanText.trim(),
    signature: signatureText || null,
    quoted: quotedText || null,
    disclaimer: disclaimerText || null,
    isForward,
  };
}

export default cleanReply;
