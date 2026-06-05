import type { Signature } from '../../domain/Signature.js';
import type { Proposal } from '../../domain/Proposal.js';

export interface ValidationContext {
  proposal: Proposal;
  signature: Signature;
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
  stepName: string;
}

export abstract class ValidationHandler {
  protected next: ValidationHandler | null = null;

  setNext(h: ValidationHandler): ValidationHandler {
    this.next = h;
    return h;
  }

  handle(ctx: ValidationContext): ValidationResult {
    const r = this.process(ctx);
    if (!r.ok) return r;
    if (this.next) return this.next.handle(ctx);
    return r;
  }

  protected abstract process(ctx: ValidationContext): ValidationResult;
}

export class FormatHandler extends ValidationHandler {
  protected process(ctx: ValidationContext): ValidationResult {
    const dni = ctx.signature.citizenDni;
    if (!/^[0-9]{8}$/.test(dni)) {
      return { ok: false, reason: 'DNI con formato inválido', stepName: 'Format' };
    }
    return { ok: true, stepName: 'Format' };
  }
}

export class DuplicateHandler extends ValidationHandler {
  protected process(ctx: ValidationContext): ValidationResult {
    if (ctx.proposal.hasSignedDni(ctx.signature.citizenDni)) {
      return { ok: false, reason: 'DNI duplicado', stepName: 'Duplicate' };
    }
    return { ok: true, stepName: 'Duplicate' };
  }
}

export class BlacklistHandler extends ValidationHandler {
  constructor(private blacklist: Set<string>) {
    super();
  }
  protected process(ctx: ValidationContext): ValidationResult {
    if (this.blacklist.has(ctx.signature.citizenDni)) {
      return { ok: false, reason: 'DNI en lista negra', stepName: 'Blacklist' };
    }
    return { ok: true, stepName: 'Blacklist' };
  }
}

export class RENIECHandler extends ValidationHandler {
  constructor(private renIECCheck: (dni: string) => boolean) {
    super();
  }
  protected process(ctx: ValidationContext): ValidationResult {
    if (!this.renIECCheck(ctx.signature.citizenDni)) {
      return { ok: false, reason: 'DNI no validado por RENIEC', stepName: 'RENIEC' };
    }
    return { ok: true, stepName: 'RENIEC' };
  }
}

export function buildDefaultChain(
  blacklist: Set<string>,
  renIECCheck: (dni: string) => boolean
): ValidationHandler {
  const format = new FormatHandler();
  const dup = new DuplicateHandler();
  const black = new BlacklistHandler(blacklist);
  const reniec = new RENIECHandler(renIECCheck);
  format.setNext(dup).setNext(black).setNext(reniec);
  return format;
}
