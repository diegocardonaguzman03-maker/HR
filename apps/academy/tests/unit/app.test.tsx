import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { App } from '../../src/app/App';
import { useApp } from '../../src/stores/useApp';
import { content, idx } from '../../src/lib/content';
import { DISCLAIMER } from '../../src/components/ui/Disclaimer';
import type { QuestionT } from '../../src/lib/content/schema';

const initial = useApp.getState();
beforeEach(() => { localStorage.clear(); act(() => useApp.setState({ ...initial, mode: 'explore', selectedEq: null, selectedStage: null, moduleId: null, wiId: null, assessmentId: null, docId: null, videoId: null, assistantOpen: false }, true)); location.hash = ''; });

describe('arranque', () => {
  it('muestra el aviso permanente, los modos y la bienvenida', () => {
    render(<App />);
    expect(screen.getByTestId('disclaimer')).toHaveTextContent(DISCLAIMER);
    for (const m of ['explore', 'learn', 'perform', 'assess', 'library']) expect(screen.getByTestId(`mode-${m}`)).toBeInTheDocument();
    expect(screen.getByTestId('welcome')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

describe('navegación y equipos', () => {
  it('abre un equipo desde la lista y recorre sus 9 pestañas', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('eq-eq.electrodes'));
    const panel = screen.getByTestId('equipment-panel');
    expect(within(panel).getByRole('heading', { name: /Electrodos/ })).toBeInTheDocument();
    for (const t of ['overview', 'operation', 'components', 'safety', 'controls', 'maintenance', 'training', 'documents', 'videos']) {
      fireEvent.click(screen.getByTestId(`tab-${t}`));
      expect(screen.getByTestId(`tab-${t}`)).toHaveAttribute('aria-selected', 'true');
    }
    fireEvent.click(screen.getByTestId('tab-safety'));
    expect(screen.getByTestId('safety-list').textContent).toMatch(/SME_REQUIRED/);
    expect(location.hash).toBe('#/explore/eq.electrodes');
  });
  it('muestra una etapa del mapa del proceso con valores pendientes de planta', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('stage-stage.melt'));
    expect(screen.getByTestId('stage-panel').textContent).toMatch(/PENDIENTE DE VALIDACIÓN DE PLANTA \(SME_REQUIRED\)/);
  });
  it('las flechas del teclado cambian de pestaña', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('eq-eq.transformer'));
    fireEvent.keyDown(screen.getByTestId('tab-overview'), { key: 'ArrowRight' });
    expect(screen.getByTestId('tab-operation')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('modos', () => {
  it('cambia entre los cinco modos', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('mode-learn')); expect(screen.getByTestId('module-list')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mode-perform')); expect(screen.getByTestId('wi-list')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mode-assess')); expect(screen.getByTestId('assessment-list')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mode-library')); expect(screen.getByTestId('library')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mode-explore')); expect(screen.getByTestId('welcome')).toBeInTheDocument();
  });
  it('avanza por las lecciones de un módulo hasta completarlo', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('mode-learn'));
    fireEvent.click(screen.getByTestId('open-mod.electrode-melting'));
    const n = idx.module.get('mod.electrode-melting')!.lessons.length;
    for (let i = 0; i < n; i++) fireEvent.click(screen.getByTestId('next-lesson'));
    expect(screen.getByTestId('module-complete')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('adx.progress')!).lessons['mod.electrode-melting']).toHaveLength(n);
  });
  it('EJECUTAR: muestra el aviso de no aprobada, verifica pasos y termina', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('mode-perform'));
    fireEvent.click(screen.getByTestId('open-wi.electrode-system-check'));
    expect(screen.getByTestId('not-approved-banner')).toHaveTextContent(/no es una instrucción aprobada/);
    fireEvent.click(screen.getByTestId('wi-begin'));
    const wi = idx.wi.get('wi.electrode-system-check')!;
    for (let i = 0; i < wi.steps.length; i++) { fireEvent.click(screen.getByTestId('step-check')); fireEvent.click(screen.getByTestId('next-step')); }
    expect(screen.getByTestId('wi-complete')).toHaveTextContent(`${wi.steps.length}/${wi.steps.length}`);
  });
});

function answer(q: QuestionT) {
  const box = screen.getByTestId(`question-${q.id}`);
  if (q.kind === 'mcq') fireEvent.click(within(box).getByLabelText(q.options[q.answer]));
  if (q.kind === 'identify') fireEvent.change(within(box).getByTestId('identify-select'), { target: { value: q.answerEquipmentId } });
  if (q.kind === 'match') q.pairs.forEach((p, i) => fireEvent.change(within(box).getByLabelText(`Relaciona: ${p.left}`), { target: { value: String(i) } }));
  if (q.kind === 'order') {
    const want = q.correctOrder.map((k) => q.items[k]);
    for (let pos = 0; pos < want.length; pos++) {
      for (let guard = 0; guard < 20; guard++) {
        const cur = within(box).getAllByRole('listitem').map((li) => li.querySelector('span.flex-1')!.textContent);
        const at = cur.indexOf(want[pos]);
        if (at === pos) break;
        fireEvent.click(within(box).getByLabelText(`Subir «${want[pos]}»`));
      }
    }
  }
}

describe('evaluación', () => {
  it('completa la evaluación con todas correctas y muestra que no certifica competencia', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('mode-assess'));
    fireEvent.click(screen.getByTestId('start-asm.eaf-electrode'));
    const a = content.assessments[0];
    a.questionIds.forEach((id, i) => {
      answer(idx.question.get(id)!);
      fireEvent.click(screen.getByTestId(i < a.questionIds.length - 1 ? 'next-question' : 'finish-assessment'));
    });
    const res = screen.getByTestId('assessment-result');
    expect(res).toHaveTextContent(/Aprobado/);
    expect(res).toHaveTextContent(/no certifica competencia/);
  });
});

describe('biblioteca y documentos', () => {
  it('filtra, abre la vista previa y ofrece descarga con atributo download', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('mode-library'));
    fireEvent.change(screen.getByTestId('filter-type'), { target: { value: 'JobAid' } });
    expect(screen.getAllByTestId(/^doc-doc\./)).toHaveLength(content.documents.filter((d) => d.type === 'JobAid').length);
    const d = content.documents.find((x) => x.type === 'JobAid')!;
    const link = screen.getByTestId(`download-${d.id}`);
    expect(link).toHaveAttribute('download');
    expect(link.getAttribute('href')).toBe(`./${d.file}`);
    fireEvent.click(screen.getByTestId(`preview-${d.id}`));
    expect(screen.getByTestId('document-viewer')).toHaveTextContent(/NO aprobado para operación/);
  });
});

describe('asistente', () => {
  it('responde "sin fuente aprobada" a un valor de planta', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('open-assistant'));
    fireEvent.change(screen.getByTestId('assistant-input'), { target: { value: '¿Cuál es la presión máxima del sistema hidráulico?' } });
    fireEvent.click(screen.getByTestId('assistant-send'));
    expect(await screen.findByText(/No tengo una fuente aprobada para esa información/)).toBeInTheDocument();
  });
});
