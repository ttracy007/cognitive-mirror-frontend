
import React, { useEffect, useState } from 'react';
import './App.css';
import AuthForm from './AuthForm';
import { supabase } from './supabaseClient';
import Journal from './Journal';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [forcedTone, setForcedTone] = useState("frank");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [hasUsedOverride, setHasUsedOverride] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHistory(data);
        if (data.length > 0) {
          setLatestEntryId(data[0].id);
          const firstDate = new Date(data[data.length - 1].created_at);
          const now = new Date();
          const diffDays = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24));
          if (diffDays >= 5) setShowSummary(true);
        }
      }
    };

    fetchEntries();
  }, [session]);

  return (
    <div className="App">
      {session ? (
        <Journal
          session={session}
          entry={entry}
          setEntry={setEntry}
          history={history}
          setHistory={setHistory}
          forcedTone={forcedTone}
          setForcedTone={setForcedTone}
          latestEntryId={latestEntryId}
          showSummary={showSummary}
          hasUsedOverride={hasUsedOverride}
          setHasUsedOverride={setHasUsedOverride}
        />
      ) : (
        <AuthForm />
      )}
    </div>
  );
};

export default App;
