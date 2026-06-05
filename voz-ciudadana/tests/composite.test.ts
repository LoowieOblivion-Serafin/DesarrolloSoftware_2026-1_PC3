import { describe, it, expect } from 'vitest';
import {
  DocumentLeaf,
  VideoLeaf,
  LinkLeaf,
  FolderComposite
} from '../src/patterns/structural/CompositeResource.js';

describe('Composite Pattern — Recursos', () => {
  it('RF-2: calcula tamaño recursivo', () => {
    const root = new FolderComposite('r');
    const sub = new FolderComposite('s');
    sub.add(new DocumentLeaf('a.pdf', 100));
    sub.add(new VideoLeaf('v.mp4', 1000));
    root.add(sub);
    root.add(new LinkLeaf('lnk', 'https://x.pe'));
    expect(root.sizeBytes()).toBe(100 + 1000 + 'https://x.pe'.length);
  });

  it('cuenta hojas recursivamente', () => {
    const root = new FolderComposite('r');
    const sub = new FolderComposite('s');
    sub.add(new DocumentLeaf('a', 1));
    sub.add(new DocumentLeaf('b', 2));
    root.add(sub);
    root.add(new DocumentLeaf('c', 3));
    expect(root.count()).toBe(3);
  });

  it('detecta ciclo y rechaza', () => {
    const a = new FolderComposite('a');
    const b = new FolderComposite('b');
    a.add(b);
    expect(() => b.add(a)).toThrow(/Ciclo/);
  });

  it('serializa estructura', () => {
    const root = new FolderComposite('r');
    root.add(new DocumentLeaf('a', 1));
    const s = root.serialize();
    expect(s.kind).toBe('FOLDER');
    expect(s.children?.length).toBe(1);
    expect(s.children?.[0].kind).toBe('DOCUMENT');
  });

  it('describe genera árbol legible', () => {
    const root = new FolderComposite('r');
    root.add(new DocumentLeaf('a', 1));
    const s = root.describe();
    expect(s).toContain('[DIR] r');
    expect(s).toContain('[DOC] a');
  });
});
