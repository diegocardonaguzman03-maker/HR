import { idx } from '../../lib/content';
import { useApp } from '../../stores/useApp';
import { Modal } from '../ui/Modal';
import { StatusChip } from '../ui/Status';
import { DownloadLink, typeLabel } from './DocumentCard';
import { asset } from '../../lib/download';

export function DocumentViewer() {
  const { docId, set } = useApp();
  const doc = docId ? idx.document.get(docId) : null;
  if (!doc) return null;
  const notApproved = doc.status !== 'PLANT_APPROVED';
  return (
    <Modal title={doc.title} onClose={() => set({ docId: null })} wide testid="document-viewer">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] px-4 py-2 text-[12px] text-[var(--color-text-2)]">
        <StatusChip status={doc.status} />
        <span>{typeLabel(doc.type)} · v{doc.version} · Dueño: {doc.owner}</span>
        <span className="ml-auto"><DownloadLink doc={doc} /></span>
      </div>
      {notApproved && (
        <p role="alert" className="mx-4 mt-3 rounded border border-[var(--color-st-draft)]/60 bg-[var(--color-st-draft)]/10 px-3 py-2 text-[13px]">
          <strong><span aria-hidden>✎ </span>Documento NO aprobado para operación.</strong> Es material de capacitación o demostración. Para operar usa únicamente el procedimiento aprobado vigente de la planta.
        </p>
      )}
      <div className="p-4">
        <iframe title={`Vista previa: ${doc.title}`} src={asset(doc.file)} className="h-[64vh] w-full rounded border border-[var(--color-line)] bg-white" />
        <p className="mt-2 text-[12px] text-[var(--color-text-3)]">Si tu navegador no muestra PDF incrustados, usa «Descargar PDF».</p>
      </div>
    </Modal>
  );
}
