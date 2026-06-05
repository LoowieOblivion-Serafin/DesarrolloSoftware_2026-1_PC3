export interface RENIECPort {
  checkDni(dni: string): boolean;
}

export interface LegacyRENIECApi {
  ConsultarDocumentoIdentidad(input: { num: string }): { exists: boolean; status: string };
}

export class LegacyRENIECAdapter implements RENIECPort {
  constructor(private legacy: LegacyRENIECApi) {}
  checkDni(dni: string): boolean {
    const r = this.legacy.ConsultarDocumentoIdentidad({ num: dni });
    return r.exists && r.status === 'ACTIVE';
  }
}

export class FakeRENIEC implements RENIECPort {
  constructor(private invalid: Set<string> = new Set()) {}
  checkDni(dni: string): boolean {
    return /^[0-9]{8}$/.test(dni) && !this.invalid.has(dni);
  }
}

export interface CongressPort {
  distribute(envelope: CongressEnvelope): Promise<{ receipt: string }>;
}

export interface CongressEnvelope {
  proposalId: string;
  title: string;
  hash: string;
  signedHash: string;
  signatureCount: number;
  frozenAt: string;
}

export interface SoapCongressService {
  EnviarExpediente_v2(body: { xml: string }): { codigo: string; ok: boolean };
}

export class SoapCongressAdapter implements CongressPort {
  constructor(private soap: SoapCongressService) {}
  async distribute(envelope: CongressEnvelope): Promise<{ receipt: string }> {
    const xml = `<expediente><id>${envelope.proposalId}</id><hash>${envelope.hash}</hash><sig>${envelope.signedHash}</sig><n>${envelope.signatureCount}</n></expediente>`;
    const r = this.soap.EnviarExpediente_v2({ xml });
    if (!r.ok) throw new Error('Congreso rechazó el expediente.');
    return { receipt: r.codigo };
  }
}

export class FakeCongress implements CongressPort {
  public received: CongressEnvelope[] = [];
  async distribute(envelope: CongressEnvelope): Promise<{ receipt: string }> {
    this.received.push(envelope);
    return { receipt: `CONG-${envelope.proposalId}-${Date.now()}` };
  }
}
