import type { Signature } from '../../domain/Signature.js';
import type { Proposal } from '../../domain/Proposal.js';

export interface SignatureService {
  submit(proposal: Proposal, sig: Signature, now?: Date): void;
}

export class AuditLogEntry {
  constructor(
    public timestamp: Date,
    public proposalId: string,
    public dni: string,
    public method: string,
    public outcome: 'OK' | 'ERROR',
    public detail?: string
  ) {}

  toLine(): string {
    return `[${this.timestamp.toISOString()}] prop=${this.proposalId} dni=${this.dni} method=${this.method} outcome=${this.outcome}${
      this.detail ? ' detail=' + this.detail : ''
    }`;
  }
}

export class AuditDecorator implements SignatureService {
  private log: AuditLogEntry[] = [];

  constructor(private inner: SignatureService) {}

  submit(proposal: Proposal, sig: Signature, now: Date = new Date()): void {
    try {
      this.inner.submit(proposal, sig, now);
      this.log.push(
        new AuditLogEntry(now, proposal.id, sig.citizenDni, sig.method, 'OK')
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.log.push(
        new AuditLogEntry(now, proposal.id, sig.citizenDni, sig.method, 'ERROR', msg)
      );
      throw e;
    }
  }

  getLog(): ReadonlyArray<AuditLogEntry> {
    return this.log;
  }
}

export class RateLimitDecorator implements SignatureService {
  private hits = new Map<string, number[]>();

  constructor(
    private inner: SignatureService,
    private maxPerMinute: number = 60
  ) {}

  submit(proposal: Proposal, sig: Signature, now: Date = new Date()): void {
    const key = sig.citizenDni;
    const t = now.getTime();
    const arr = (this.hits.get(key) ?? []).filter((x) => t - x < 60_000);
    if (arr.length >= this.maxPerMinute) {
      throw new Error(`Rate limit excedido para DNI ${sig.citizenDni}.`);
    }
    arr.push(t);
    this.hits.set(key, arr);
    this.inner.submit(proposal, sig, now);
  }
}
