// ChatBubble.js 
export default function ChatBubble({ entry, styleVariant = "A" }) {
  const style = getToneStyle(entry.tone_mode || 'frank');
  const isInsight = entry.entry_type === 'insight';

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
        alignment: { alignSelf: isUserEntry ? 'flex-end' : 'flex-start' }
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
        alignment: { alignSelf: 'flex-start' }
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
        alignment: { alignSelf: isUserEntry ? 'flex-end' : 'flex-start' }
      };
    case "A":
    default:
      return {
        base: {
          backgroundColor: isInsight ? '#f4f0ff' : '#e0f7fa',
          padding: '0.8rem 1rem',
          borderRadius: isUserEntry ? '16px 16px 0 16px' : '16px 16px 16px 0',
          marginBottom: '0.75rem',
          maxWidth: '75%',
        },
        alignment: { alignSelf: isUserEntry ? 'flex-end' : 'flex-start' }
      };
  }
})();

return (
  <div style={{ display: 'flex', ...bubbleStyle.alignment }}>
    <div style={{ ...bubbleStyle.base }}>
      {!isUserEntry && (
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: style.borderColor,
          marginBottom: '0.25rem'
        }}>
          {style.label} {isInsight && '• Insight'}
        </div>
      )}

      {entry.response_text
        ? entry.response_text.split('\n').map((para, idx) => (
            <p key={idx} style={{ margin: '0 0 0.8rem 0' }}>{para}</p>
          ))
        : <p>{entry.entry_text}</p>}
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
    case 'movies':
      return { backgroundColor: '#fce4ec', borderColor: '#c2185b', label: 'Movie Metaphor™' };
    case 'verena':
      return { backgroundColor: '#ffeaf0', borderColor: '#ec407a', label: '🌸 Verena' };
    default:
      return { backgroundColor: '#f0f0f0', borderColor: '#ccc', label: 'Mirror' };
  }
}
