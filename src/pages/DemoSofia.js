
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import SofiaReflectionCard from '../components/SofiaReflectionCard';
import './DemoSofia.css';

const DemoSofiaPage = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', '372d20c2-4c5b-4bfc-8a70-bd88a7e84190')
        .order('timestamp', { ascending: true });

      if (!error && data) setEntries(data);
    };
    fetchEntries();
  }, []);

  return (
    <div className="demo-sofia-wrapper">
      <h2 style={{ fontSize: '1.5rem' }}>🌸 Sofia — The Loyalty Trap</h2>
      <p style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        Sofia just found out her husband cheated—again. They’ve got two kids, a shared home, and over a decade together.
        She’s torn between reclaiming her dignity and preserving her children’s home. Each day feels like a battle between betrayal and guilt.
      </p>
  
      <SofiaReflectionCard
        entryText="I keep telling myself I can forgive him, but deep down, I don’t think I believe it. It’s like I’m trying to convince myself of something my gut already knows isn’t true."
        loopName="Cycle of Self-Doubt"
        themeTags={['internal conflict', 'Vulnerability & Trust']}
        severity={3}
        mirrorResponse="Your gut’s got a point. You’re trying to sell yourself a story you don’t buy. Why do you think you’re pushing this forgiveness angle? What’s the real play here?"
        voiceName="Tony"  
      />
  
      <SofiaReflectionCard
        entryText="Last night I had a dream where I was packing bags. Not even crying, just numb. Woke up and realized I’m more afraid of starting over than I am of staying in this mess."
        loopName="Cycle of Avoidance"
        themeTags={['Fear of change', 'Change & Uncertainty']}
        severity={4}
        mirrorResponse="Dreams can be a hell of a mirror, can’t they? You know what’s up—you’re scared of change. But here’s the deal. What’s more important—staying safe in the mess or taking a shot at something better?"
        voiceName="Tony"  
      />
    </div>
  );
};

export default DemoSofiaPage;
