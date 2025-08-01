// ChatBubble.js   
import dayjs from 'dayjs';
export default function ChatBubble({ entry, styleVariant = "A" }) {
  const isUser = entry.tone_mode === 'user'
  const isInsight = entry.entry_type === 'insight';
  const style = getToneStyle(entry.tone_mode || 'frank');
  const isUserEntry = !entry.response_text && !isInsight;

const bubbleStyle = (() => {
  switch (styleVariant) {
    case "B":
      return {
        base: {
          backgroundColor: '#fefefe',
          border: '1px solid #ddd',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '0.75rem',
          maxWidth: '80%',
          fontSize: '0.95rem',
        },
        alignment: { alignSelf: isUser ? 'flex-start' : 'flex-end' }
      };
    case "C":
      return {
        base: {
          backgroundColor: 'transparent',
          padding: '0.5rem 0',
          marginBottom: '0.5rem',
          maxWidth: '85%',
          fontSize: '1rem',
        },
        alignment: { alignSelf: isUser ? 'flex-start' : 'flex-end' }
      };
    case "D":
      return {
        base: {
          backgroundColor: isInsight ? '#f4f0ff' : style.backgroundColor,
          borderLeft: `5px solid ${style.borderColor}`,
          padding: '0.9rem 1rem',
          borderRadius: '12px',
          marginBottom: '0.75rem',
          maxWidth: '75%',
          fontSize: '0.95rem',
        },
        alignment: { alignSelf: isUser ? 'flex-start' : 'flex-end' }
      };
    case "A":
    default:
      return {
        base: {
          backgroundColor: isInsight ? '#f4f0ff' : '#e0f7fa',
          padding: '0.8rem 1rem',
          borderRadius: isUser ? '16px 16px 0 16px' : '16px 16px 16px 0',
          marginBottom: '0.75rem',
          maxWidth: '75%',
        },
        alignment: { alignSelf: isUser ? 'flex-start' : 'flex-end' }
      };
  }
})();

return (
  <div style={{ 
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    marginBottom: '1.2rem'
  }}>
    <div style={{
      backgroundColor: isUser ? '#f0f0f0' : style.backgroundColor,
      borderLeft: isInsight ? '4px solid #5c6ac4' : `4px solid ${style.borderColor}`,
      padding: '0.8rem 1rem',
      borderRadius: isUser ? '16px 16px 16px 0' : '16px 16px 0 16px',
      maxWidth: '75%',
      textAlign: 'left',
      fontWeight: isInsight ? '600' : 'normal',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: 'bold',
        marginBottom: '0.4rem',
        color: isUser ? '#444' : style.borderColor
      }}>
        {isUser ? 'You' : style.label}{isInsight ? ' • Insight' : ''}
      </div>

      {isUser && entry.entry_text && (
        <p style={{ marginBottom: '0.5rem' }}>{entry.entry_text}</p>
        )}
      {entry.response_text && (
        entry.response_text.split('\n').map((para, idx) => (
          <p key={idx} style={{ marginBottom: '0.5rem' }}>{para}</p>
        ))
      )}

      {/* Timestamp */}
      <div style={{
        fontSize: '0.75rem',
        color: '#999',
        marginTop: '0.4rem',
        textAlign: isUser ? 'left' : 'right'
      }}>
        {dayjs(entry.timestamp).format('h:mm A')}
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
