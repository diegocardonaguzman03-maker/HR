import { useState } from 'react';
import { useStore, fmtTime } from '../store/useStore';
import { AGENTS, STATUS_META, agentById } from '../data/agents';

/** Bottom dock: agent roster (quick select) and the live activity log. */
export function Dock() {
  const agents = useStore((s) => s.agents);
  const selected = useStore((s) => s.selected);
  const feed = useStore((s) => s.feed);
  const meeting = useStore((s) => s.meetingNow);
  const [expanded, setExpanded] = useState(false);
  const st = useStore.getState;
  return (
    <div className={`dock ${expanded ? 'exp' : ''}`}>
      {meeting && (
        <button className="meeting-banner" onClick={() => st().flyTo('zone', 'war')}>
          <span className="pulse" /> Reunión en el War Room: <b>{meeting.title}</b> · {meeting.members.map((m) => agentById(m)?.name).join(', ')}
        </button>
      )}
      <div className="roster">
        {AGENTS.map((a) => {
          const m = STATUS_META[agents[a.id].status];
          return (
            <button
              key={a.id}
              className={`chip ${selected === a.id ? 'on' : ''}`}
              onClick={() => {
                st().select(a.id);
                st().flyTo('agent', a.id);
              }}
              title={`${a.name} · ${m.label} · ${agents[a.id].task}`}
            >
              <span className="ava" style={{ background: a.shirt }}>{a.name.slice(0, 1)}</span>
              <span className="nm">{a.name.split(' ')[0]}</span>
              <span className="dot" style={{ background: m.color }} />
            </button>
          );
        })}
      </div>
      <div className="feed">
        <div className="feed-h">
          <span><i className="live" /> Actividad en vivo</span>
          <button onClick={() => setExpanded(!expanded)}>{expanded ? 'Contraer' : 'Expandir'}</button>
        </div>
        <div className="feed-list">
          {feed.slice(0, expanded ? 60 : 4).map((f) => (
            <button
              key={f.id}
              className={`feed-item ${f.kind ?? ''}`}
              onClick={() => {
                if (f.agent) {
                  st().select(f.agent);
                  st().flyTo('agent', f.agent);
                }
              }}
            >
              <time>{fmtTime(f.at)}</time>
              <span>{f.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
