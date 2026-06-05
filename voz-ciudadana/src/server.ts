import { createServer, IncomingMessage, ServerResponse } from 'http';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { VozCiudadanaFacade } from './services/VozCiudadanaFacade.js';
import { FakeRENIEC, FakeCongress } from './patterns/structural/Adapters.js';
import {
  FolderComposite,
  DocumentLeaf,
  VideoLeaf,
  LinkLeaf,
  ResourceComponent
} from './patterns/structural/CompositeResource.js';
import {
  CollectiveNotifier,
  CongressNotifier,
  CitizenBroadcaster
} from './services/NotificationObservers.js';
import type { Signature } from './domain/Signature.js';
import type { Comment } from './domain/Comment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = join(__dirname, '../public');

// Instancia de Fachada con configuración de alta velocidad de firma para la demo
const facade = new VozCiudadanaFacade({
  reniec: new FakeRENIEC(),
  congress: new FakeCongress(),
  rateLimitPerMinute: 1000000 // Permitir firmas rápidas en la UI
});

const collective = {
  id: 'COL-001',
  name: 'Colectivo Ciudadano Andino',
  legalRepresentative: 'María Quispe',
  contactEmail: 'col@ciudadano.pe'
};

// Crear propuesta inicial por defecto para demostración
const proposalId = 'ILC-2026-001';
const proposal = facade.createProposal(
  proposalId,
  'Ley de Transparencia Algorítmica',
  'Obliga al Estado a publicar el código fuente de sistemas que tomen decisiones automatizadas sobre ciudadanos.',
  collective
);

// Adjuntar observadores para capturar eventos de notificaciones en memoria
const colObs = new CollectiveNotifier(collective.id);
const conObs = new CongressNotifier();
const citObs = new CitizenBroadcaster();
proposal.attach(colObs);
proposal.attach(conObs);
proposal.attach(citObs);

// Estructura de recursos iniciales usando el patrón Composite
const rootFolder = new FolderComposite('Expediente-ILC-2026-001');
const docsFolder = new FolderComposite('documentos');
docsFolder.add(new DocumentLeaf('exposicion-motivos.pdf', 245_000));
docsFolder.add(new DocumentLeaf('analisis-impacto.pdf', 512_000));
const mediaFolder = new FolderComposite('multimedia');
mediaFolder.add(new VideoLeaf('mensaje-ciudadano.mp4', 18_500_000));
mediaFolder.add(new LinkLeaf('webinar-presentacion', 'https://voz.gob.pe/webinar/001'));
rootFolder.add(docsFolder);
rootFolder.add(mediaFolder);

facade.attachResource(proposalId, rootFolder);

// Capturar todos los logs del sistema
const systemEvents: any[] = [];
proposal.attach({
  update(payload) {
    systemEvents.push(payload);
  }
});

// Ayudante para leer el body en JSON
async function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('JSON inválido en el cuerpo de la solicitud'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

// Ayudante para responder en JSON
function sendJson(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

// Servidor
const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '', `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Manejo de CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API REST ---
  try {
    if (pathname === '/api/proposal' && req.method === 'GET') {
      const p = facade.getProposal(proposalId);
      sendJson(res, 200, {
        id: p.id,
        title: p.title,
        body: p.body,
        owner: p.owner,
        state: p.getState().name,
        signatureCount: p.signatureCount(),
        daysRemaining: p.daysRemaining(),
        isThresholdReached: p.isThresholdReached(),
        frozenHash: p.frozenHash,
        frozenSignedHash: p.frozenSignedHash,
        frozenAt: p.frozenAt ? p.frozenAt.toISOString() : null,
        distributedAt: p.distributedAt ? p.distributedAt.toISOString() : null,
        resources: rootFolder.serialize(),
        comments: p.comments.map(c => ({
          commentId: c.commentId,
          authorDni: c.authorDni,
          body: c.body,
          kind: c.kind,
          createdAt: c.createdAt.toISOString()
        }))
      });
      return;
    }

    if (pathname === '/api/proposal/activate' && req.method === 'POST') {
      facade.activateProposal(proposalId);
      sendJson(res, 200, { ok: true, state: facade.getProposal(proposalId).getState().name });
      return;
    }

    if (pathname === '/api/proposal/sign' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.citizenDni) {
        sendJson(res, 400, { ok: false, error: 'DNI requerido' });
        return;
      }

      const sig: Signature = {
        signatureId: `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        citizenDni: body.citizenDni,
        proposalId: proposalId,
        timestamp: new Date(),
        method: body.method || 'DNI_RENIEC',
        hash: 'h'.repeat(40)
      };

      facade.sign(proposalId, sig);
      const p = facade.getProposal(proposalId);
      sendJson(res, 200, {
        ok: true,
        signatureCount: p.signatureCount(),
        state: p.getState().name,
        frozenHash: p.frozenHash
      });
      return;
    }

    if (pathname === '/api/proposal/sign-bulk' && req.method === 'POST') {
      const p = facade.getProposal(proposalId);
      if (p.getState().name !== 'Active') {
        sendJson(res, 400, { ok: false, error: 'Propuesta no está activa para recibir firmas' });
        return;
      }
      
      const target = 25000;
      const startCount = p.signatureCount();
      const needed = target - startCount;
      
      if (needed <= 0) {
        sendJson(res, 200, { ok: true, message: 'Meta ya alcanzada', state: p.getState().name });
        return;
      }

      // Inyectar rápidamente firmas válidas ficticias
      for (let i = startCount; i < target; i++) {
        const dni = (10000000 + i).toString();
        const sig: Signature = {
          signatureId: `SIG-BULK-${i}`,
          citizenDni: dni,
          proposalId: proposalId,
          timestamp: new Date(),
          method: 'DNI_RENIEC',
          hash: 'h'.repeat(40)
        };
        facade.sign(proposalId, sig);
      }

      sendJson(res, 200, {
        ok: true,
        signatureCount: p.signatureCount(),
        state: p.getState().name,
        frozenHash: p.frozenHash,
        frozenSignedHash: p.frozenSignedHash
      });
      return;
    }

    if (pathname === '/api/proposal/comment' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.authorDni || !body.body || !body.kind) {
        sendJson(res, 400, { ok: false, error: 'DNI, cuerpo y tipo de comentario requeridos' });
        return;
      }

      const c: Comment = {
        commentId: `COM-${Date.now()}`,
        proposalId: proposalId,
        authorDni: body.authorDni,
        body: body.body,
        kind: body.kind,
        createdAt: new Date()
      };

      facade.comment(proposalId, c);
      sendJson(res, 200, { ok: true, commentsCount: facade.getProposal(proposalId).comments.length });
      return;
    }

    if (pathname === '/api/proposal/resource' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.name || !body.type) {
        sendJson(res, 400, { ok: false, error: 'Nombre y tipo de recurso requerido' });
        return;
      }

      let resource: ResourceComponent;
      if (body.type === 'DOCUMENT') {
        resource = new DocumentLeaf(body.name, Number(body.sizeBytes || 1024));
      } else if (body.type === 'VIDEO') {
        resource = new VideoLeaf(body.name, Number(body.sizeBytes || 50000));
      } else if (body.type === 'LINK') {
        resource = new LinkLeaf(body.name, body.uri || 'https://voz.gob.pe');
      } else if (body.type === 'FOLDER') {
        resource = new FolderComposite(body.name);
      } else {
        sendJson(res, 400, { ok: false, error: 'Tipo de recurso no válido' });
        return;
      }

      // Añadir bajo el Composite principal
      if (body.parentName && body.parentName !== rootFolder.name) {
        // Búsqueda simple en la carpeta principal
        const findFolder = (folder: FolderComposite, name: string): FolderComposite | null => {
          if (folder.name === name) return folder;
          for (const child of folder.getChildren()) {
            if (child instanceof FolderComposite) {
              const res = findFolder(child, name);
              if (res) return res;
            }
          }
          return null;
        };

        const targetFolder = findFolder(rootFolder, body.parentName);
        if (targetFolder) {
          targetFolder.add(resource);
        } else {
          rootFolder.add(resource);
        }
      } else {
        rootFolder.add(resource);
      }

      sendJson(res, 200, { ok: true, totalSize: rootFolder.sizeBytes(), count: rootFolder.count() });
      return;
    }

    if (pathname === '/api/proposal/distribute' && req.method === 'POST') {
      const receipt = await facade.distributeToCongress(proposalId);
      sendJson(res, 200, { ok: true, receipt, state: facade.getProposal(proposalId).getState().name });
      return;
    }

    if (pathname === '/api/audit' && req.method === 'GET') {
      const logs = facade.getAuditLog().map(l => ({
        timestamp: l.timestamp.toISOString(),
        proposalId: l.proposalId,
        dni: l.dni,
        method: l.method,
        outcome: l.outcome,
        detail: l.detail
      }));
      sendJson(res, 200, logs);
      return;
    }

    if (pathname === '/api/notifications' && req.method === 'GET') {
      sendJson(res, 200, {
        collective: colObs.received.map(ev => ({ event: ev.event, time: ev.timestamp.toISOString(), data: ev.data })),
        congress: conObs.received.map(ev => ({ event: ev.event, time: ev.timestamp.toISOString(), data: ev.data })),
        citizens: citObs.received.map(ev => ({ event: ev.event, time: ev.timestamp.toISOString(), data: ev.data })),
        system: systemEvents.map(ev => ({ event: ev.event, time: ev.timestamp.toISOString(), data: ev.data }))
      });
      return;
    }

    // --- ARCHIVOS ESTÁTICOS ---
    let filePath = join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = join(filePath, 'index.html');
      }

      const content = await fs.readFile(filePath);
      let contentType = 'text/html';
      if (filePath.endsWith('.css')) contentType = 'text/css';
      else if (filePath.endsWith('.js')) contentType = 'application/javascript';
      else if (filePath.endsWith('.json')) contentType = 'application/json';
      else if (filePath.endsWith('.png')) contentType = 'image/png';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Archivo no encontrado');
    }
  } catch (e: any) {
    sendJson(res, 500, { ok: false, error: e.message || 'Error interno del servidor' });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`🚀 Servidor de Voz Ciudadana iniciado correctamente.`);
  console.log(`🌍 Interfaz gráfica disponible en: http://localhost:${PORT}`);
  console.log(`============================================================\n`);
});
