import { describe, it, expect } from 'vitest';
import { Proposal } from '../src/domain/Proposal.js';
import { TEST_COLLECTIVE, makeSig } from './helpers.js';
import {
  CollectiveNotifier,
  CongressNotifier,
  CitizenBroadcaster
} from '../src/services/NotificationObservers.js';

describe('Observer Pattern — Notificaciones', () => {
  it('RF-7: notifica STATE_CHANGED en activación', () => {
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    const obs = new CollectiveNotifier('COL-T');
    p.attach(obs);
    p.activate();
    expect(obs.received.some((e) => e.event === 'STATE_CHANGED')).toBe(true);
  });

  it('Congress observer solo recibe FROZEN/DISTRIBUTED', () => {
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    const con = new CongressNotifier();
    p.attach(con);
    p.activate();
    p.addSignature(makeSig(1, 'P'));
    expect(con.received.length).toBe(0);
  });

  it('Citizen broadcaster recibe THRESHOLD_REACHED', () => {
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    const cit = new CitizenBroadcaster();
    p.attach(cit);
    p.activate();
    for (let i = 0; i < 25_000; i++) p.addSignature(makeSig(i, 'P'));
    expect(cit.received.some((e) => e.event === 'THRESHOLD_REACHED')).toBe(true);
  });

  it('detach detiene notificaciones', () => {
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    const obs = new CollectiveNotifier('COL-T');
    p.attach(obs);
    p.detach(obs);
    p.activate();
    expect(obs.received.length).toBe(0);
  });
});
