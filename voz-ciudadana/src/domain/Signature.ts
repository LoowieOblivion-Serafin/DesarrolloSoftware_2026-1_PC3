export type ValidationMethod = 'DNI_RENIEC' | 'DIGITAL_CERT' | 'BIOMETRIC';

export interface Signature {
  signatureId: string;
  citizenDni: string;
  proposalId: string;
  timestamp: Date;
  method: ValidationMethod;
  hash: string;
}
