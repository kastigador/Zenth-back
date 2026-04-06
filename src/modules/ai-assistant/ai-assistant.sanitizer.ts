import { Injectable } from '@nestjs/common';

type RedactionResult = {
  text: string;
  blocked: boolean;
};

@Injectable()
export class AiAssistantSanitizer {
  private readonly blockedResponsePatterns: RegExp[] = [
    /password/i,
    /contrase(?:ñ|n)a/i,
    /passwd/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /authorization/i,
    /bearer\s+[a-z0-9\-_.]+/i,
    /cookie/i,
    /refresh[_-]?token/i,
    /private[_-]?key/i,
    /-----BEGIN [A-Z ]+PRIVATE KEY-----/i,
    /\.env/i,
    /database_url/i,
    /select\s+\*\s+from\s+"?user"?/i,
    /union\s+select/i,
    /ignore previous instructions/i,
    /developer mode/i,
  ];

  private readonly redactPatterns: Array<{ pattern: RegExp; replacement: string }> = [
    {
      pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      replacement: '[REDACTED_EMAIL]',
    },
    {
      pattern: /\b\+?\d{7,15}\b/g,
      replacement: '[REDACTED_PHONE]',
    },
    {
      pattern: /\b\d{7,12}\b/g,
      replacement: '[REDACTED_ID]',
    },
  ];

  containsBlockedIntent(input: string): boolean {
    const value = input ?? '';
    return this.blockedResponsePatterns.some((pattern) => pattern.test(value));
  }

  sanitizeOutput(input: string): RedactionResult {
    let output = input ?? '';
    let blocked = false;

    for (const pattern of this.blockedResponsePatterns) {
      if (pattern.test(output)) {
        blocked = true;
        output = output.replace(pattern, '[REDACTED_SENSITIVE]');
      }
    }

    for (const rule of this.redactPatterns) {
      output = output.replace(rule.pattern, rule.replacement);
    }

    return { text: output, blocked };
  }
}
