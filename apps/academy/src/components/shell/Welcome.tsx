import { content } from '../../lib/content';
import { STATUS_META } from '../../lib/content/status';
import { useApp } from '../../stores/useApp';
import { StatusChip, btn, btnPrimary } from '../ui/Status';
import type { ValidationStatus } from '../../lib/content/schema';

export function Welcome() {
  const { set, setMode, selectEquipment } = useApp();
  return (
    <div className="scroll-thin h-full overflow-y-auto px-4 py-4" data-testid="welcome">
      <p className="label">Módulo inicial</p>
      <h1 className="mb-2 text-[22px] font-semibold leading-tight">Horno de arco eléctrico — entorno interactivo de aprendizaje</h1>
      <p className="mb-4 text-[13.5px] text-[var(--color-text-2)]">
        Recorre el horno en 3D, aprende qué hace cada sistema y practica una ayuda de trabajo. En GASM el horno se carga con DRI propio (HYL y Midrex) por el 5.º agujero, con retornos internos; no se usa chatarra comprada.
      </p>
      <div className="mb-5 grid gap-2">
        <button className={btnPrimary + ' justify-start'} onClick={() => selectEquipment('eq.electrodes')}>Empezar por el sistema de electrodos (MVP)</button>
        <button className={btn + ' justify-start'} onClick={() => { set({ moduleId: 'mod.eaf-orientation', lessonIdx: 0 }); setMode('learn'); }}>Tomar la orientación guiada</button>
      </div>
      <h2 className="label mb-2">Cómo usarlo</h2>
      <ul className="mb-5 space-y-1.5 text-[13px] text-[var(--color-text-2)]">
        <li>• Haz clic en un <strong>punto numerado</strong>, en el modelo o en la lista de equipos.</li>
        <li>• Arrastra para girar, rueda o pellizco para acercar, clic derecho para desplazar.</li>
        <li>• Usa <strong>Rayos X</strong>, <strong>Corte</strong> y <strong>Despiece</strong> para ver el interior.</li>
        <li>• Todo se puede usar con teclado (Tab, Enter, flechas en pestañas).</li>
      </ul>
      <h2 className="label mb-2">Estados del contenido</h2>
      <ul className="space-y-1.5" data-testid="status-legend">
        {(Object.keys(STATUS_META) as ValidationStatus[]).map((k) => (
          <li key={k} className="flex items-start gap-2 text-[12.5px] text-[var(--color-text-2)]"><StatusChip status={k} compact /><span>{STATUS_META[k].help}{k === 'PLANT_APPROVED' ? ' (Aún no hay contenido aprobado en este módulo.)' : ''}</span></li>
        ))}
      </ul>
      <p className="mt-5 font-mono text-[11px] text-[var(--color-text-3)]">Contenido: {content.equipment.length} equipos · {content.processes.length} etapas · {content.hazards.length} peligros · modelo esquemático, no a escala de planta.</p>
    </div>
  );
}
