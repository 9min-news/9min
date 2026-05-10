import type { AudioMeta } from '@/lib/content'
import { formatDuration, formatFileSizeDisplay, audioUrl } from '@/lib/audio'
import { formatDate } from '@/lib/utils'

interface AudioPlayerProps {
  audio: AudioMeta
  className?: string
  style?: React.CSSProperties
}

export function AudioPlayer({ audio, className, style }: AudioPlayerProps) {
  const src = audioUrl(audio.file)

  return (
    <div
      className={className}
      style={{
        background: '#F4F1EB',
        border: '1px solid #D4D0C8',
        borderRadius: '4px',
        padding: '20px 24px',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '14px',
        }}
      >
        <span
          style={{
            fontFamily: "'GT Sectra', Georgia, serif",
            fontSize: '12px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#8A9C8A',
          }}
        >
          Diesen Essay anhören
        </span>
        <span
          style={{
            fontFamily: "'GT Sectra', Georgia, serif",
            fontSize: '13px',
            fontStyle: 'italic',
            color: '#8A9C8A',
          }}
        >
          Gelesen vom Autor
        </span>
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        controls
        preload="metadata"
        style={{ width: '100%', display: 'block' }}
      >
        <source src={src} type="audio/mpeg" />
      </audio>

      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontFamily: "'GT Sectra', Georgia, serif",
          fontSize: '13px',
          color: '#8A9C8A',
        }}
      >
        <span>{formatDuration(audio.duration)}</span>
        <span aria-hidden="true" style={{ color: '#D4D0C8' }}>·</span>
        <span>aufgenommen {formatDate(audio.recorded)}</span>
        <span aria-hidden="true" style={{ color: '#D4D0C8' }}>·</span>
        <a
          href={src}
          download
          style={{
            color: '#8A9C8A',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          MP3 ({formatFileSizeDisplay(audio.size)})
        </a>
      </div>
    </div>
  )
}
