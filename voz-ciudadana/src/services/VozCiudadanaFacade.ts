import { Proposal } from '../domain/Proposal.js';
import type { Signature } from '../domain/Signature.js';
import type { Comment } from '../domain/Comment.js';
import type { Collective } from '../domain/Collective.js';
import type { ResourceComponent } from '../patterns/structural/CompositeResource.js';
import { CoreSignatureService, SignatureProxy } from '../patterns/structural/SignatureProxy.js';
import { AuditDecorator, RateLimitDecorator, type SignatureService } from '../patterns/structural/AuditDecorator.js';
import {
  buildDefaultChain,
  type ValidationHandler
} from '../patterns/behavioral/SignatureValidationChain.js';
import type { CongressPort, RENIECPort } from '../patterns/structural/Adapters.js';
import { CryptoService } from './CryptoService.js';

export interface FacadeDeps {
  reniec: RENIECPort;
  congress: CongressPort;
  crypto?: CryptoService;
  blacklist?: Set<string>;
  rateLimitPerMinute?: number;
}

export class VozCiudadanaFacade {
  private proposals = new Map<string, Proposal>();
  private signatureService: SignatureService;
  private auditDecorator: AuditDecorator;
  private crypto: CryptoService;
  private reniec: RENIECPort;
  private congress: CongressPort;

  constructor(deps: FacadeDeps) {
    this.reniec = deps.reniec;
    this.congress = deps.congress;
    this.crypto = deps.crypto ?? new CryptoService();
    const chain: ValidationHandler = buildDefaultChain(
      deps.blacklist ?? new Set(),
      (dni) => this.reniec.checkDni(dni)
    );
    const core = new CoreSignatureService();
    const proxy = new SignatureProxy(core, chain);
    this.auditDecorator = new AuditDecorator(proxy);
    this.signatureService = new RateLimitDecorator(
      this.auditDecorator,
      deps.rateLimitPerMinute ?? 60
    );
  }

  createProposal(id: string, title: string, body: string, owner: Collective): Proposal {
    const p = new Proposal(id, title, body, owner);
    this.proposals.set(id, p);
    return p;
  }

  getProposal(id: string): Proposal {
    const p = this.proposals.get(id);
    if (!p) throw new Error(`Propuesta ${id} no encontrada.`);
    return p;
  }

  attachResource(proposalId: string, r: ResourceComponent): void {
    this.getProposal(proposalId).attachResource(r);
  }

  activateProposal(proposalId: string, now: Date = new Date()): void {
    this.getProposal(proposalId).activate(now);
  }

  sign(proposalId: string, sig: Signature, now: Date = new Date()): void {
    const p = this.getProposal(proposalId);
    this.signatureService.submit(p, sig, now);
    if (p.isThresholdReached() && p.getState().name === 'Active') {
      this.freezeProposal(proposalId, now);
    }
  }

  comment(proposalId: string, c: Comment): void {
    this.getProposal(proposalId).addComment(c);
  }

  freezeProposal(proposalId: string, now: Date = new Date()): { hash: string; signedHash: string } {
    const p = this.getProposal(proposalId);
    const payload = p.canonicalize();
    const hash = this.crypto.sha256(payload);
    const signedHash = this.crypto.hmacSign(hash);
    p.freeze(hash, signedHash, now);
    return { hash, signedHash };
  }

  async distributeToCongress(proposalId: string, now: Date = new Date()): Promise<string> {
    const p = this.getProposal(proposalId);
    if (!p.frozenHash || !p.frozenSignedHash || !p.frozenAt) {
      throw new Error('Propuesta debe estar congelada antes de distribuir.');
    }
    const r = await this.congress.distribute({
      proposalId: p.id,
      title: p.title,
      hash: p.frozenHash,
      signedHash: p.frozenSignedHash,
      signatureCount: p.signatureCount(),
      frozenAt: p.frozenAt.toISOString()
    });
    p.distribute(now);
    return r.receipt;
  }

  verifyFrozenIntegrity(proposalId: string): boolean {
    const p = this.getProposal(proposalId);
    if (!p.frozenHash || !p.frozenSignedHash) return false;
    return this.crypto.verify(p.frozenHash, p.frozenSignedHash);
  }

  getAuditLog() {
    return this.auditDecorator.getLog();
  }
}
