export type ResourceKind = 'DOCUMENT' | 'VIDEO' | 'LINK' | 'FOLDER';

export interface SerializedResource {
  kind: ResourceKind;
  name: string;
  sizeBytes: number;
  children?: SerializedResource[];
  uri?: string;
}

export abstract class ResourceComponent {
  constructor(public name: string) {}
  abstract sizeBytes(): number;
  abstract count(): number;
  abstract describe(indent?: number): string;
  abstract serialize(): SerializedResource;
}

export class DocumentLeaf extends ResourceComponent {
  constructor(name: string, private bytes: number) {
    super(name);
  }
  sizeBytes(): number {
    return this.bytes;
  }
  count(): number {
    return 1;
  }
  describe(indent = 0): string {
    return `${' '.repeat(indent)}- [DOC] ${this.name} (${this.bytes} B)`;
  }
  serialize(): SerializedResource {
    return { kind: 'DOCUMENT', name: this.name, sizeBytes: this.bytes };
  }
}

export class VideoLeaf extends ResourceComponent {
  constructor(name: string, private bytes: number) {
    super(name);
  }
  sizeBytes(): number {
    return this.bytes;
  }
  count(): number {
    return 1;
  }
  describe(indent = 0): string {
    return `${' '.repeat(indent)}- [VID] ${this.name} (${this.bytes} B)`;
  }
  serialize(): SerializedResource {
    return { kind: 'VIDEO', name: this.name, sizeBytes: this.bytes };
  }
}

export class LinkLeaf extends ResourceComponent {
  constructor(name: string, public uri: string) {
    super(name);
  }
  sizeBytes(): number {
    return this.uri.length;
  }
  count(): number {
    return 1;
  }
  describe(indent = 0): string {
    return `${' '.repeat(indent)}- [LNK] ${this.name} -> ${this.uri}`;
  }
  serialize(): SerializedResource {
    return { kind: 'LINK', name: this.name, sizeBytes: this.uri.length, uri: this.uri };
  }
}

export class FolderComposite extends ResourceComponent {
  private children: ResourceComponent[] = [];

  add(c: ResourceComponent): void {
    if (this.containsCycle(c)) {
      throw new Error(`Ciclo detectado al añadir "${c.name}" a "${this.name}".`);
    }
    this.children.push(c);
  }

  remove(c: ResourceComponent): void {
    this.children = this.children.filter((x) => x !== c);
  }

  getChildren(): ReadonlyArray<ResourceComponent> {
    return this.children;
  }

  sizeBytes(): number {
    return this.children.reduce((acc, c) => acc + c.sizeBytes(), 0);
  }

  count(): number {
    return this.children.reduce((acc, c) => acc + c.count(), 0);
  }

  describe(indent = 0): string {
    const head = `${' '.repeat(indent)}+ [DIR] ${this.name} (${this.sizeBytes()} B)`;
    const body = this.children.map((c) => c.describe(indent + 2)).join('\n');
    return body ? `${head}\n${body}` : head;
  }

  serialize(): SerializedResource {
    return {
      kind: 'FOLDER',
      name: this.name,
      sizeBytes: this.sizeBytes(),
      children: this.children.map((c) => c.serialize())
    };
  }

  private containsCycle(candidate: ResourceComponent): boolean {
    if (candidate === this) return true;
    if (candidate instanceof FolderComposite) {
      for (const child of candidate.getChildren()) {
        if (this.containsCycle(child)) return true;
      }
    }
    return false;
  }
}
