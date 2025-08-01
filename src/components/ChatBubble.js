// ChatBubble.js
export default function ChatBubble({ entry }) {
  const style = getToneStyle(entry.tone_mode || 'frank');

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* User bubble - LEFT */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <div style={{
          backgroundColor: '#e0f7fa',
          padding: '0.8rem 1rem',
          borderRadius: '16px 16px 16px 0',
          maxWidth: '75%',
          textAlign: 'left',
          marginBottom: '0.3rem'
        }}>
          <span>
            <strong>
              {entry.entry_type === 'insight' ? '🧭 ' : ''}
            </strong>
            {entry.entry_text}
          </span>
        </div>
      </div>

      {/* Mirror bubble - RIGHT */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          backgroundColor: style.backgroundColor,
          borderLeft: `4px solid ${style.borderColor}`,
          padding: '0.8rem 1rem',
          borderRadius: '16px 16px 0 16px',
          maxWidth: '75%',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            marginBottom: '0.3rem',
            color: style.borderColor
          }}>
            {style.label}
          </div>
          {entry.response_text
            ? entry.response_text.split('\n').map((para, idx) => (
                <p key={idx} style={{ margin: '0 0 0.8rem 0' }}>{para}</p>
              ))
            : <p style={{ color: '#777' }}><em>No reflections yet.</em></p>
          }
        </div>
      </div>
    </div>
  );
}

function getToneStyle(tone) {
  switch (tone.toLowerCase()) {
    case 'frank':
      return { backgroundColor: '#fff3e0', borderColor: '#fb8c00', label: 'Tony' };
    case 'marcus':
      return { backgroundColor: '#e8f5e9', borderColor: '#388e3c', label: 'Marcus' };
    case 'therapist':
      return { backgroundColor: '#e0f7f6', borderColor: '#673ab7', label: 'Clara' };
    case 'movie':
      return { backgroundColor: '#fce4ec', borderColor: '#c2185b', label: 'Movie Metaphor™' };
    case 'verena':
      return { backgroundColor: '#ffeaf0', borderColor: '#ec407a', label: '🌸 Verena' };
    default:
      return { backgroundColor: '#f0f0f0', borderColor: '#ccc', label: 'Mirror' };
  }
}
