import { VozCiudadanaFacade } from './services/VozCiudadanaFacade.js';
import { FakeRENIEC, FakeCongress } from './patterns/structural/Adapters.js';
import {
  DocumentLeaf,
  VideoLeaf,
  LinkLeaf,
  FolderComposite
} from './patterns/structural/CompositeResource.js';
import {
  CollectiveNotifier,
  CongressNotifier,
  CitizenBroadcaster
} from './services/NotificationObservers.js';
import { SIGNATURE_THRESHOLD } from './domain/constants.js';
import type { Signature } from './domain/Signature.js';

function banner(t: string): void {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${t}`);
  console.log('='.repeat(60));
}

async function main(): Promise<void> {
  banner('DEMO — Voz Ciudadana');

  const facade = new VozCiudadanaFacade({
    reniec: new FakeRENIEC(),
    congress: new FakeCongress(),
    rateLimitPerMinute: 100000
  });

  const collective = {
    id: 'COL-001',
    name: 'Colectivo Ciudadano Andino',
    legalRepresentative: 'María Quispe',
    contactEmail: 'col@ciudadano.pe'
  };

  const p = facade.createProposal(
    'ILC-2026-001',
    'Ley de Transparencia Algorítmica',
    'Obliga al Estado a publicar el código fuente de sistemas que tomen decisiones automatizadas sobre ciudadanos.',
    collective
  );

  const colObs = new CollectiveNotifier(collective.id);
  const conObs = new CongressNotifier();
  const citObs = new CitizenBroadcaster();
  p.attach(colObs);
  p.attach(conObs);
  p.attach(citObs);

  banner('1. Patrón Composite — Recursos de Soporte');
  const root = new FolderComposite('Expediente-ILC-2026-001');
  const docs = new FolderComposite('documentos');
  docs.add(new DocumentLeaf('exposicion-motivos.pdf', 245_000));
  docs.add(new DocumentLeaf('analisis-impacto.pdf', 512_000));
  const media = new FolderComposite('multimedia');
  media.add(new VideoLeaf('mensaje-ciudadano.mp4', 18_500_000));
  media.add(new LinkLeaf('webinar', 'https://voz.gob.pe/webinar/001'));
  root.add(docs);
  root.add(media);
  facade.attachResource(p.id, root);
  console.log(root.describe());
  console.log(`Tamaño total: ${root.sizeBytes()} B, archivos: ${root.count()}`);

  banner('2. Patrón State — Activar propuesta');
  facade.activateProposal(p.id);
  console.log(`Estado actual: ${p.getState().name}`);
  console.log(`Días restantes: ${p.daysRemaining()}`);

  banner('3. Patrón Proxy + Chain — Recolectar firmas');
  const target = SIGNATURE_THRESHOLD;
  console.log(`Inyectando ${target} firmas válidas...`);
  for (let i = 0; i < target; i++) {
    const dni = (10_000_000 + i).toString().padStart(8, '0');
    const sig: Signature = {
      signatureId: `SIG-${i}`,
      citizenDni: dni,
      proposalId: p.id,
      timestamp: new Date(),
      method: 'DNI_RENIEC',
      hash: 'h'.repeat(40)
    };
    try {
      facade.sign(p.id, sig);
    } catch (e) {
      if (i < target - 5) {
        console.log(`Firma ${i} falló: ${(e as Error).message}`);
      }
    }
  }
  console.log(`Firmas recolectadas: ${p.signatureCount()}`);
  console.log(`Estado: ${p.getState().name}`);

  banner('4. Congelamiento criptográfico');
  console.log(`Hash SHA-256: ${p.frozenHash}`);
  console.log(`Firma HMAC:    ${p.frozenSignedHash}`);
  console.log(`Integridad verificada: ${facade.verifyFrozenIntegrity(p.id)}`);

  banner('5. Distribución al Congreso (Adapter)');
  const receipt = await facade.distributeToCongress(p.id);
  console.log(`Recibo Congreso: ${receipt}`);
  console.log(`Estado final: ${p.getState().name}`);

  banner('6. Observers — Notificaciones recibidas');
  console.log(`Colectivo: ${colObs.received.length} eventos`);
  console.log(`Congreso:  ${conObs.received.length} eventos`);
  console.log(`Ciudadanos:${citObs.received.length} eventos`);

  banner('7. Audit log (últimos 3)');
  const log = facade.getAuditLog();
  for (const entry of log.slice(-3)) {
    console.log(entry.toLine());
  }

  banner('Demo finalizada con éxito');
}

main().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
