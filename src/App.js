const handleSubmit = async () => {
  const user = session?.user;
  if (!user || !entry.trim()) return;

  const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry, tone }),
  });

  const data = await res.json();
  const responseText = data.response || 'No response received.';

  const { error } = await supabase.from('journals').insert([
    {
      user_id: user.id,
      entry_text: entry,
      tone_mode: tone,
      response_text: responseText,
    },
  ]);

  if (error) {
    console.error('Save error:', error.message);
  }

  setEntry('');
  fetchHistory();
};
