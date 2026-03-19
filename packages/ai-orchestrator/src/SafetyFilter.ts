export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  sanitizedContent?: string;
}

export class SafetyFilter {
  private readonly secretPatterns: RegExp[] = [
    /(?:api[_-]?key|apikey)[\s:=]+['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
    /(?:secret[_-]?key|secretkey)[\s:=]+['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
    /(?:access[_-]?token|accesstoken)[\s:=]+['"]?([a-zA-Z0-9_\-\.]{20,})['"]?/gi,
    /(?:password|passwd|pwd)[\s:=]+['"]?([^\s'"]{8,})['"]?/gi,
    /ghp_[a-zA-Z0-9]{36}/g,
    /gho_[a-zA-Z0-9]{36}/g,
    /ghu_[a-zA-Z0-9]{36}/g,
    /ghs_[a-zA-Z0-9]{36}/g,
    /ghr_[a-zA-Z0-9]{36}/g,
    /sk-[a-zA-Z0-9]{48}/g,
    /sk-ant-[a-zA-Z0-9\-]{95}/g,
    /AKIA[0-9A-Z]{16}/g,
    /xox[baprs]-[a-zA-Z0-9\-]+/g,
  ];

  private readonly promptInjectionPatterns: RegExp[] = [
    /ignore\s+(all\s+)?previous\s+instructions?/gi,
    /disregard\s+(all\s+)?previous\s+instructions?/gi,
    /forget\s+(all\s+)?previous\s+instructions?/gi,
    /ignore\s+above/gi,
    /ignore\s+the\s+above/gi,
    /new\s+instructions?:/gi,
    /system:\s*you\s+are\s+now/gi,
    /\[SYSTEM\]/gi,
    /\[\/SYSTEM\]/gi,
    /\<\|im_start\|\>/gi,
    /\<\|im_end\|\>/gi,
  ];

  private readonly maliciousCommandPatterns: RegExp[] = [
    /rm\s+-rf\s+\//g,
    /:\(\)\{\s*:\|\:&\s*\};:/g,
    /mkfs\./g,
    /dd\s+if=/g,
    /wget.*\|\s*sh/g,
    /curl.*\|\s*bash/g,
  ];

  checkPromptSafety(prompt: string): SafetyCheckResult {
    for (const pattern of this.promptInjectionPatterns) {
      if (pattern.test(prompt)) {
        return {
          isSafe: false,
          reason: 'Potential prompt injection detected',
        };
      }
    }

    if (this.containsSecrets(prompt)) {
      return {
        isSafe: false,
        reason: 'Prompt contains potential secrets or API keys',
        sanitizedContent: this.redactSecrets(prompt),
      };
    }

    return { isSafe: true };
  }

  checkCodeSafety(code: string): SafetyCheckResult {
    for (const pattern of this.maliciousCommandPatterns) {
      if (pattern.test(code)) {
        return {
          isSafe: false,
          reason: 'Code contains potentially dangerous commands',
        };
      }
    }

    return { isSafe: true };
  }

  containsSecrets(text: string): boolean {
    for (const pattern of this.secretPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  redactSecrets(text: string): string {
    let redacted = text;
    
    for (const pattern of this.secretPatterns) {
      redacted = redacted.replace(pattern, (match) => {
        const parts = match.split(/[\s:=]+/);
        if (parts.length >= 2) {
          return `${parts[0]}=[REDACTED]`;
        }
        return '[REDACTED]';
      });
    }

    return redacted;
  }

  sanitizeOutput(output: string): string {
    return this.redactSecrets(output);
  }

  checkContentLength(content: string, maxLength: number): SafetyCheckResult {
    if (content.length > maxLength) {
      return {
        isSafe: false,
        reason: `Content exceeds maximum length of ${maxLength} characters`,
      };
    }
    return { isSafe: true };
  }

  validateUserInput(input: string): SafetyCheckResult {
    if (!input || input.trim().length === 0) {
      return {
        isSafe: false,
        reason: 'Input cannot be empty',
      };
    }

    if (input.length > 10000) {
      return {
        isSafe: false,
        reason: 'Input exceeds maximum allowed length',
      };
    }

    const promptSafety = this.checkPromptSafety(input);
    if (!promptSafety.isSafe) {
      return promptSafety;
    }

    return { isSafe: true };
  }

  checkRateLimitSafety(
    userId: string,
    requestCount: number,
    windowMs: number,
    maxRequests: number
  ): SafetyCheckResult {
    if (requestCount >= maxRequests) {
      return {
        isSafe: false,
        reason: `Rate limit exceeded: ${requestCount}/${maxRequests} requests in ${windowMs}ms`,
      };
    }
    return { isSafe: true };
  }

  filterSensitiveData(data: any): any {
    if (typeof data === 'string') {
      return this.redactSecrets(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.filterSensitiveData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const filtered: any = {};
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'apiSecret'];
      
      for (const [key, value] of Object.entries(data)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          filtered[key] = '[REDACTED]';
        } else {
          filtered[key] = this.filterSensitiveData(value);
        }
      }
      return filtered;
    }

    return data;
  }
}
