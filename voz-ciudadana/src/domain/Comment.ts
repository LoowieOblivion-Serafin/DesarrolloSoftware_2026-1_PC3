export type CommentKind = 'OPINION' | 'MODIFICATION_SUGGESTION';

export interface Comment {
  commentId: string;
  proposalId: string;
  authorDni: string;
  body: string;
  kind: CommentKind;
  createdAt: Date;
}
