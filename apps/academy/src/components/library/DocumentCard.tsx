import type { DocumentT } from '../../types/content';
import { useApp } from '../../stores/useApp';
import { StatusChip, btn } from '../ui/Status';
import { asset, fileName } from '../../lib/download';
import { track } from '../../lib/analytics';

const TYPE: Record<DocumentT['type'], string> = { SOP: 'Procedimiento', WI: 'Instrucción de trabajo', Checklist: 'Lista de verificación', JobAid: 'Ayuda de trabajo', TrainingGuide: 'Guía de capacitación', TechnicalManual: 'Manual técnico', SafetyProcedure: 'Procedimiento de seguridad' };
export const typeLabel = (t: DocumentT['type']) => TYPE[t];

export function DownloadLink({ doc, className = btn }: { doc: DocumentT; className?: string }) {
  return (
    <a className={className} href={asset(doc.file)} download={fileName(doc.file)} data-testid={`download-${doc.id}`} onClick={() => track('downloaded', doc.id)}>
      <span aria-hidden>↓</span> Descargar PDF
    </a>
  );
}

export function DocumentCard({ doc }: { doc: DocumentT }) {
  return (
    <article className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3" data-testid={`doc-${doc.id}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <StatusChip status={doc.status} compact />
        <span className="font-mono text-[11px] text-[var(--color-text-3)]">{typeLabel(doc.type)} · v{doc.version}{doc.approvalDate ? ` · aprobado ${doc.approvalDate}` : ' · sin aprobación'}</span>
      </div>
      <h4 className="font-semibold">{doc.title}</h4>
      <p className="mt-1 text-[12.5px] text-[var(--color-text-2)]">{doc.description}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button className={btn} onClick={() => useApp.getState().set({ docId: doc.id })} data-testid={`preview-${doc.id}`}><span aria-hidden>◱</span> Vista previa</button>
        <DownloadLink doc={doc} />
      </div>
    </article>
  );
}
