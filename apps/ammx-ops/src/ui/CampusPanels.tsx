import { useMemo, useState } from 'react';
import { useStore, fmtTime, type AttendanceStatus, type Participant } from '../store/useStore';
import { DURATION_NOTE, ROOMS, WEEK, roomById, toMin, type CampusSession, type Category, type RoomId } from '../data/campus';
import { attendanceAt, dayPlans, minuteOfDay, participantsFor, phaseOf, summary, type LiveStatus } from '../sim/campus';

const STATUS_LABEL: Record<LiveStatus, string> = { presente: 'Presente', tarde: 'Tarde', ausente: 'Ausente', pendiente: 'Pendiente', 'en camino': 'En camino' };
const CAT_LABEL: Record<Category, string> = { seguridad: 'Seguridad', operativo: 'Operativo', webinar: 'Webinar' };

function DayPicker() {
  const day = useStore((s) => s.campusDay);
  const setDay = useStore((s) => s.setCampusDay);
  return (
    <div className="day-pick" role="tablist" aria-label="Día simulado">
      {WEEK.days.map((d, i) => (
        <button key={d} className={day === i ? 'on' : ''} onClick={() => setDay(i)}>
          {d}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- live class (side panel)
export function LivePanel({ room }: { room: RoomId }) {
  const r = roomById(room)!;
  const close = useStore((s) => s.close);
  const open = useStore((s) => s.open);
  const flyTo = useStore((s) => s.flyTo);
  const day = useStore((s) => s.campusDay);
  const attendance = useStore((s) => s.attendance);
  const setAttendance = useStore((s) => s.setAttendance);
  useStore((s) => s.sessions);
  useStore((s) => s.participants);
  useStore((s) => Math.floor(s.simMinute));
  const m = minuteOfDay(useStore.getState().simMinute);
  const plans = dayPlans().filter((p) => p.room.id === room);
  const cur = plans.find((p) => m >= p.start - 45 && m <= p.end + 10) ?? plans.find((p) => p.start > m) ?? plans[plans.length - 1];
  const [copied, setCopied] = useState(false);
  const ov = cur ? attendance[`${cur.session.id}|${day}`] : undefined;
  const sm = cur ? summary(cur, m, ov) : null;
  const live = cur && m >= cur.start && m <= cur.end;
  const progress = cur ? Math.max(0, Math.min(1, (m - cur.start) / (cur.end - cur.start))) : 0;

  const copyList = async () => {
    if (!cur) return;
    const rows = ['Nombre,Empresa o área,Asistencia', ...cur.people.map((p, i) => `${p.name},${p.org},${STATUS_LABEL[attendanceAt(cur, i, m, ov)]}`)];
    const text = `${cur.session.title} · ${WEEK.days[day]} ${cur.session.start} · ${r.name}\n${rows.join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      useStore.getState().notify('No se pudo copiar: el visor no permite usar el portapapeles.');
    }
  };

  return (
    <aside className="right-panel live-panel" aria-label={`Clase en vivo · ${r.name}`}>
      <div className="rp-head">
        <div className="avatar" style={{ background: r.accent }}>{r.short.slice(0, 1)}</div>
        <div className="rp-id">
          <div className="rp-name">{r.name}</div>
          <div className="rp-role">Campus de Capacitación · {WEEK.days[day]}</div>
          <div className="rp-meta">{live ? <b className="live-chip">● En vivo</b> : cur ? (m < cur.start ? 'Próxima clase' : 'Clase concluida') : 'Sin clase este día'}</div>
        </div>
        <button className="x" onClick={close} aria-label="Cerrar">×</button>
      </div>
      <div className="lp-scroll live-body">
        <DayPicker />
        {cur ? (
          <>
            <div className="live-card" style={{ borderTopColor: r.accent }}>
              <div className="eyebrow">{CAT_LABEL[cur.session.category]} · {cur.session.courseId ? `ID ${cur.session.courseId}` : cur.session.audience}</div>
              <div className="live-title">{cur.session.title}</div>
              <div className="live-meta">
                {cur.session.start}–{fmtTime(cur.end)} · Instructor: {cur.session.instructor} · Cupo {cur.session.cupo}
              </div>
              <div className="live-phase">{phaseOf(cur, m)}</div>
              <div className="rp-bar"><i style={{ width: `${progress * 100}%` }} /></div>
              {sm && (
                <div className="att-grid">
                  <div><b>{sm.presente}</b><small>Presentes</small></div>
                  <div><b>{sm.tarde}</b><small>Tarde</small></div>
                  <div><b>{sm.ausente}</b><small>Ausentes</small></div>
                  <div><b>{sm.pendiente}</b><small>Pendientes</small></div>
                </div>
              )}
              <div className="live-actions">
                <button className="primary" onClick={() => flyTo('room', r.id)}>Ver en 3D</button>
                <button onClick={() => open({ kind: 'session', id: cur.session.id, day })}>Editar sesión y participantes</button>
                <button onClick={copyList}>{copied ? 'Lista copiada' : 'Copiar lista (CSV)'}</button>
              </div>
            </div>
            <div className="sub-h">Lista de asistencia · captura de practicantes</div>
            <div className="att-list">
              {cur.people.map((p, i) => {
                const st = attendanceAt(cur, i, m, ov);
                const manual = ov?.[i];
                return (
                  <div key={i} className="att-row">
                    <span className="att-name">
                      {p.name}
                      <small>{p.org}</small>
                    </span>
                    <span className={`chip-st ${st.replace(' ', '-')}`}>{STATUS_LABEL[st]}{manual ? ' ✎' : ''}</span>
                    <span className="att-btns" aria-label={`Marcar asistencia de ${p.name}`}>
                      {(['presente', 'tarde', 'ausente'] as AttendanceStatus[]).map((s) => (
                        <button key={s} className={manual === s ? 'on' : ''} title={STATUS_LABEL[s]} onClick={() => setAttendance(cur.session.id, day, i, manual === s ? null : s)}>
                          {s[0].toUpperCase()}
                        </button>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="hint">
              {useStore.getState().participants[cur.session.id]?.length
                ? 'Participantes capturados por ti. La llegada y el registro son simulados; tus marcas (✎) mandan.'
                : 'Participantes simulados. Captura los reales en "Editar sesión y participantes".'}
            </div>
          </>
        ) : (
          <div className="hint">No hay clases en esta aula el {WEEK.days[day]}. Agrégalas desde la agenda.</div>
        )}
        {plans.length > 1 && (
          <>
            <div className="sub-h">Otras clases del día en esta aula</div>
            {plans.filter((p) => p !== cur).map((p) => (
              <button key={p.session.id} className="lp-row" onClick={() => open({ kind: 'session', id: p.session.id, day })}>
                <span className="lp-row-main">{p.session.start} · {p.session.title}</span>
                <span className="lp-row-sub">{phaseOf(p, m)}</span>
              </button>
            ))}
          </>
        )}
        <button className="link" onClick={() => open({ kind: 'agenda' })}>Ver agenda semanal ›</button>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------- weekly agenda (modal)
export function AgendaView() {
  const sessions = useStore((s) => s.sessions);
  const day = useStore((s) => s.campusDay);
  const open = useStore((s) => s.open);
  const resetCampus = useStore((s) => s.resetCampus);
  const participants = useStore((s) => s.participants);
  useStore((s) => Math.floor(s.simMinute / 5));
  const m = minuteOfDay(useStore.getState().simMinute);
  const [confirmReset, setConfirmReset] = useState(false);
  const safety = sessions.filter((s) => s.category === 'seguridad');
  const ops = sessions.filter((s) => s.category === 'operativo');
  const web = sessions.filter((s) => s.category === 'webinar');
  const statusOf = (s: CampusSession, d: number) => {
    if (d !== day) return d < day ? 'done' : 'next';
    const st = toMin(s.start);
    return m < st ? 'next' : m > st + s.durationMin ? 'done' : 'live';
  };
  return (
    <div className="modal wide agenda" role="dialog" aria-label="Agenda semanal de capacitación">
      <div className="modal-h">
        <div>
          <div className="modal-t">Agenda semanal de capacitación · Lázaro Cárdenas</div>
          <div className="modal-s">{WEEK.label} · día simulado: {WEEK.days[day]}</div>
        </div>
        <button className="x" onClick={() => useStore.getState().close()} aria-label="Cerrar">×</button>
      </div>
      <div className="modal-b">
        <div className="agenda-bar">
          <DayPicker />
          <button className="primary" onClick={() => open({ kind: 'session', day })}>+ Agregar sesión</button>
        </div>
        <div className="week-grid">
          {WEEK.days.map((d, i) => (
            <div key={d} className={`week-col ${i === day ? 'today' : ''}`}>
              <div className="week-h">{d}</div>
              {safety
                .filter((s) => s.days.includes(i))
                .sort((a, b) => a.start.localeCompare(b.start))
                .map((s) => (
                  <button key={s.id} className={`ses ses-${statusOf(s, i)}`} onClick={() => open({ kind: 'session', id: s.id, day: i })}>
                    <b>{s.start}</b>
                    <span>{s.title}</span>
                    <small>
                      {roomById(s.room)?.short ?? s.location}
                      {participants[s.id]?.length ? ` · ${participants[s.id].length} inscritos` : ''}
                    </small>
                    {statusOf(s, i) === 'live' && <i className="live-dot" />}
                  </button>
                ))}
              <button className="ses add" onClick={() => open({ kind: 'session', day: i })}>+ Sesión</button>
            </div>
          ))}
        </div>
        <div className="sub-h">Cursos operativos y específicos</div>
        <div className="ops-list">
          {ops.map((s) => (
            <button key={s.id} className="ops-row" onClick={() => open({ kind: 'session', id: s.id, day: s.days[0] })}>
              <span className="ops-title">{s.title}</span>
              <span>{s.dateLabel ?? s.days.map((d) => WEEK.days[d]).join(', ')}</span>
              <span>{s.start}</span>
              <span>{s.location}</span>
              <span>{s.courseId ? `ID ${s.courseId}` : '—'}</span>
              <span className="hrs">{s.totalHours ? `${s.totalHours} h` : ''}</span>
            </button>
          ))}
        </div>
        <div className="sub-h">Webinars y otros</div>
        {web.map((s) => (
          <button key={s.id} className="ops-row" onClick={() => open({ kind: 'session', id: s.id, day: s.days[0] })}>
            <span className="ops-title">{s.title}</span>
            <span>{s.days.map((d) => WEEK.days[d]).join(', ')}</span>
            <span>{s.start}–{fmtTime(toMin(s.start) + s.durationMin)}</span>
            <span>{s.location}</span>
            <span />
            <span />
          </button>
        ))}
        <div className="agenda-foot">
          <span className="hint">{DURATION_NOTE} Lo que captures se guarda solo en este navegador.</span>
          {confirmReset ? (
            <span className="confirm">
              ¿Borrar tus cambios y volver a la agenda original?
              <button onClick={() => { resetCampus(); setConfirmReset(false); }}>Sí, restaurar</button>
              <button onClick={() => setConfirmReset(false)}>Cancelar</button>
            </span>
          ) : (
            <button className="link" onClick={() => setConfirmReset(true)}>Restaurar agenda original</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- session editor (modal)
export function SessionEditor({ id, day }: { id?: string; day?: number }) {
  const sessions = useStore((s) => s.sessions);
  const participants = useStore((s) => s.participants);
  const upsert = useStore((s) => s.upsertSession);
  const del = useStore((s) => s.deleteSession);
  const setParticipants = useStore((s) => s.setParticipants);
  const open = useStore((s) => s.open);
  const existing = sessions.find((s) => s.id === id);
  const [f, setF] = useState<CampusSession>(
    () =>
      existing ?? {
        id: `u-${Date.now().toString(36)}`, title: '', category: 'seguridad', days: [day ?? useStore.getState().campusDay], start: '08:00', durationMin: 240,
        room: 'loto', location: 'Campus', instructor: '', cupo: 12, audience: 'Personal operativo',
      },
  );
  const simulated = useMemo(() => (existing ? participantsFor(existing, undefined, day ?? existing.days[0]) : []), [existing, day]);
  const [text, setText] = useState(() => (participants[f.id] ?? []).map((p) => (p.org ? `${p.name}, ${p.org}` : p.name)).join('\n'));
  const [confirmDel, setConfirmDel] = useState(false);
  const set = <K extends keyof CampusSession>(k: K, v: CampusSession[K]) => setF((x) => ({ ...x, [k]: v }));
  const valid = f.title.trim().length > 2 && f.days.length > 0 && /^\d{1,2}:\d{2}$/.test(f.start);
  const parsed: Participant[] = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, ...rest] = l.split(',');
      return { name: name.trim(), org: rest.join(',').trim() || f.audience };
    });
  const save = () => {
    const room = f.room;
    const loc = room === 'externo' ? f.location || 'Sede externa' : room === 'virtual' ? 'Virtual' : `Campus · ${roomById(room)?.short ?? ''}`;
    upsert({ ...f, title: f.title.trim(), location: loc, instructor: f.instructor.trim() || 'Por confirmar' });
    setParticipants(f.id, parsed);
    useStore.getState().log(`Agenda actualizada: ${f.title.trim()} (${f.days.map((d) => WEEK.days[d]).join(', ')} ${f.start}).`, undefined, 'info');
    if (roomById(room)) open({ kind: 'live', room: room as RoomId });
    else open({ kind: 'agenda' });
  };
  return (
    <div className="modal" role="dialog" aria-label="Sesión de capacitación">
      <div className="modal-h">
        <button className="back" onClick={() => open({ kind: 'agenda' })}>‹ Agenda</button>
        <div>
          <div className="modal-t">{existing ? 'Editar sesión' : 'Nueva sesión'}</div>
          <div className="modal-s">Cronograma y participantes del campus</div>
        </div>
        <button className="x" onClick={() => useStore.getState().close()} aria-label="Cerrar">×</button>
      </div>
      <div className="modal-b">
        <div className="form">
          <label htmlFor="ses-title">Curso<input id="ses-title" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej. Bloqueo y etiquetado" /></label>
          <div className="row">
            <label htmlFor="ses-cat">Tipo
              <select id="ses-cat" value={f.category} onChange={(e) => set('category', e.target.value as Category)}>
                <option value="seguridad">Seguridad</option>
                <option value="operativo">Operativo y específico</option>
                <option value="webinar">Webinar y otros</option>
              </select>
            </label>
            <label htmlFor="ses-room">Aula o sede
              <select id="ses-room" value={f.room} onChange={(e) => set('room', e.target.value as CampusSession['room'])}>
                {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                <option value="externo">Sede externa (CECATI, ITLAC, CONALEP…)</option>
                <option value="virtual">Virtual</option>
              </select>
            </label>
          </div>
          {f.room === 'externo' && (
            <label htmlFor="ses-loc">Sede externa<input id="ses-loc" value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="CECATI" /></label>
          )}
          <div className="lbl">Días</div>
          <div className="chips">
            {WEEK.days.map((d, i) => (
              <button key={d} type="button" className={f.days.includes(i) ? 'on' : ''} onClick={() => set('days', f.days.includes(i) ? f.days.filter((x) => x !== i) : [...f.days, i].sort())}>{d}</button>
            ))}
          </div>
          <div className="row">
            <label htmlFor="ses-start">Hora de inicio<input id="ses-start" type="time" value={f.start} onChange={(e) => set('start', e.target.value)} /></label>
            <label htmlFor="ses-dur">Duración (horas)<input id="ses-dur" type="number" min={0.5} max={10} step={0.5} value={f.durationMin / 60} onChange={(e) => set('durationMin', Math.round(Number(e.target.value) * 60) || 60)} /></label>
          </div>
          <div className="row">
            <label htmlFor="ses-inst">Instructor<input id="ses-inst" value={f.instructor === 'Por confirmar' ? '' : f.instructor} onChange={(e) => set('instructor', e.target.value)} placeholder="Por confirmar" /></label>
            <label htmlFor="ses-cupo">Cupo<input id="ses-cupo" type="number" min={0} max={60} value={f.cupo} onChange={(e) => set('cupo', Number(e.target.value) || 0)} /></label>
          </div>
          <div className="row">
            <label htmlFor="ses-aud">Dirigido a<input id="ses-aud" value={f.audience} onChange={(e) => set('audience', e.target.value)} /></label>
            <label htmlFor="ses-cid">ID del curso<input id="ses-cid" value={f.courseId ?? ''} onChange={(e) => set('courseId', e.target.value || undefined)} placeholder="Opcional" /></label>
          </div>
          <label htmlFor="ses-part">
            Participantes ({parsed.length}) · uno por línea: Nombre, Empresa o área
            <textarea
              id="ses-part"
              rows={7}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={simulated.length ? `Vacío = ${simulated.length} participantes simulados.\nEj.\nJuan Pérez, Contratista Norte\nAna López, Mantenimiento` : 'Juan Pérez, Contratista Norte'}
            />
          </label>
          <div className="hint">La lista se guarda solo en este navegador. No captures datos sensibles (salud, sueldos, evaluaciones).</div>
          <div className="form-foot">
            {existing ? (
              confirmDel ? (
                <span className="confirm">
                  ¿Quitar esta sesión de la agenda?
                  <button onClick={() => { del(existing.id); open({ kind: 'agenda' }); }}>Sí, quitar</button>
                  <button onClick={() => setConfirmDel(false)}>Cancelar</button>
                </span>
              ) : (
                <button className="link" onClick={() => setConfirmDel(true)}>Quitar de la agenda</button>
              )
            ) : (
              <span />
            )}
            <button className="primary" disabled={!valid} onClick={save}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Command Center section
export function CampusToday() {
  const open = useStore((s) => s.open);
  const day = useStore((s) => s.campusDay);
  useStore((s) => Math.floor(s.simMinute / 3));
  useStore((s) => s.sessions);
  const attendance = useStore((s) => s.attendance);
  const m = minuteOfDay(useStore.getState().simMinute);
  const plans = dayPlans();
  const live = plans.filter((p) => m >= p.start && m <= p.end);
  const next = plans.filter((p) => p.start > m).slice(0, 2);
  const present = live.reduce((n, p) => {
    const s = summary(p, m, attendance[`${p.session.id}|${day}`]);
    return n + s.presente + s.tarde;
  }, 0);
  return (
    <>
      <div className="campus-kpi">
        <div><b>{live.length}</b><small>Clases en vivo</small></div>
        <div><b>{present}</b><small>Participantes en aula</small></div>
        <div><b>{plans.length}</b><small>Clases del día</small></div>
      </div>
      {live.map((p) => (
        <button key={p.session.id} className="lp-row" onClick={() => open({ kind: 'live', room: p.room.id })}>
          <span className="lp-row-main"><i className="live-dot inline" /> {p.room.short} · {p.session.title}</span>
          <span className="lp-row-sub">{phaseOf(p, m)} · desde {p.session.start}</span>
        </button>
      ))}
      {next.map((p) => (
        <button key={p.session.id} className="lp-row" onClick={() => open({ kind: 'live', room: p.room.id })}>
          <span className="lp-row-main">{p.session.start} · {p.session.title}</span>
          <span className="lp-row-sub">Próxima · {p.room.short}</span>
        </button>
      ))}
      <button className="link" onClick={() => open({ kind: 'agenda' })}>Agenda semanal y captura ›</button>
    </>
  );
}
