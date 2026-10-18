// Verfassungs-Box: wie weit der kritisierte Beitrag vom Auftrag nach Art. 93 Abs. 2 BV abweicht.
// Daten kommen aus dem Frontmatter `verfassung` (geschrieben vom 9min-Hub, Stufen 0–4).
import type { Verfassung } from '@/lib/content'

const GRAD = ['erfüllt', 'geringfügig', 'deutlich', 'erheblich', 'schwer']
const FARBE = ['#8A9C8A', '#8A9C8A', '#D4A847', '#B04040', '#7A1F1F']
const KRITERIEN: { key: 'sachgerecht' | 'vielfalt' | 'meinungsbildung'; label: string }[] = [
  { key: 'sachgerecht', label: 'Sachgerechte Darstellung' },
  { key: 'vielfalt', label: 'Vielfalt der Ansichten' },
  { key: 'meinungsbildung', label: 'Freie Meinungsbildung' },
]
const OMBUD: Record<string, string> = {
  aussichtsreich: 'Beanstandung aussichtsreich',
  'möglich': 'Beanstandung möglich',
  unwahrscheinlich: 'Beanstandung wenig aussichtsreich',
}
const serif = "'GT Sectra', Georgia, serif"

function Skala({ stufe }: { stufe: number }) {
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: '3px' }}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} style={{
          width: '22px', height: '6px', borderRadius: '1px',
          background: i <= stufe ? FARBE[stufe] : '#E8E4DC',
        }} />
      ))}
    </span>
  )
}

export function VerfassungBox({ v }: { v: Verfassung }) {
  const g = Math.max(0, Math.min(4, v.gesamt))
  return (
    <aside aria-label="Verfassungsauftrag" style={{
      border: '1px solid #D4D0C8', borderTop: `3px solid ${FARBE[g]}`, borderRadius: '2px',
      padding: '24px 24px 20px', margin: '48px 0 0', background: '#FBFAF7',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: serif, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A9C8A' }}>
          Verfassungsauftrag · Art. 93 Abs. 2 BV
        </span>
        <span style={{ fontFamily: serif, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: FARBE[g] }}>
          {OMBUD[v.ombudsstelle] ?? ''}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', margin: '14px 0 18px' }}>
        <span style={{ fontFamily: serif, fontSize: '44px', lineHeight: 1, color: FARBE[g] }}>
          {g}<span style={{ fontSize: '20px', color: '#8A9C8A' }}>/4</span>
        </span>
        <span style={{ fontFamily: serif, fontSize: '17px', color: '#1A2E1A' }}>
          Abweichung: {GRAD[g]}
        </span>
      </div>

      <dl style={{ margin: 0, display: 'grid', gap: '12px' }}>
        {KRITERIEN.map(({ key, label }) => {
          const k = v[key]
          if (!k) return null
          return (
            <div key={key}>
              <dt style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: serif, fontSize: '14px', color: '#1A2E1A' }}>{label}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Skala stufe={k.stufe} />
                  <span style={{ fontSize: '12px', color: '#4A5C4A', minWidth: '78px' }}>{k.stufe}/4 {GRAD[k.stufe]}</span>
                </span>
              </dt>
              <dd style={{ margin: '4px 0 0', fontSize: '13px', lineHeight: 1.5, color: '#4A5C4A' }}>{k.begruendung}</dd>
            </div>
          )
        })}
      </dl>

      <p style={{ margin: '18px 0 0', paddingTop: '14px', borderTop: '1px solid #E8E4DC', fontFamily: serif, fontSize: '15px', lineHeight: 1.5, color: '#1A2E1A' }}>
        {v.satz}
      </p>
      <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#8A9C8A' }}>
        Stufen 0 (erfüllt) bis 4 (schwer), gemessen an Art. 4 RTVG und der Praxis der UBI. Beanstandungen
        nimmt die Ombudsstelle SRG innert 20 Tagen nach Veröffentlichung entgegen.
      </p>
    </aside>
  )
}
