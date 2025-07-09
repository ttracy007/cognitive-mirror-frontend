// Step 1: Import dependencies at the top of JournalTimeline.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/timezone';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import Card from './Card';
import { Button } from './Button';
import ChatBubble from './ChatBubble';

const TOPIC_AND_SEVERITY_PROMPT = `
You are an emotional insight detector. Given a user's journal reflection, extract two things:

1. Topics: the literal subjects driving the reflection — people, situations, unfinished tasks, real-world concerns. Each should be 1–3 word noun phrases. No vague emotions. Ask: “What are they actually talking about?”

2. Severity: the level of emotional entrenchment or distress, on a scale of 1–5.

Format:
Topics: [comma-separated, lowercase, literal phrases]
Severity: [1–5]
`;

export default function JournalTimeline({userId, refreshTrigger }) {
  const [journalEntries, setJournalEntries] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedDays, setCollapsedDays] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [collaspedMonths, setCollapsedMonths] = useState({});
  const extractTopicsAndSeverity = async (entryText) => {
  const gptResponse = await callOpenAIChat([
    { role: 'system', content: TOPIC_AND_SEVERITY_PROMPT },
    { role: 'user', content: entryText }
  ]);
  const topicMatch = gptResponse.match(/Topics:\s*\[(.*?)\]/i);
  const parsedTopics = topicMatch
    ? topicMatch[1].split(',').map(t => t.trim().toLowerCase())
    : [];
  const severityMatch = gptResponse.match(/Severity:\s*(\d)/i);
  const severityRating = severityMatch && severityMatch[1]
    ? parseInt(severityMatch[1])
    : 1;
  return { parsedTopics, severityRating };
};

 useEffect(() => {
  const fetchEntries = async () => {
    setLoading(true);

    // ✅ Step 1: Fetch journals
    const { data: journalData, error: journalError } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (journalError) {
      console.error('❌ Error fetching journals:', journalError.message);
      return;
    }
  
    // ✅ Step 2: Fetch topic_mentions to join with user_topic_aliases
    const { data: topicData, error: topicError } = await supabase
      .from('topic_mentions')
      .select(`
          journal_id, 
          topic 
        `)
      .eq('user_id', userId)
      .order('journal_id', {ascending: false });

    if (topicError) {
      console.error('❌ Error fetching topics:', topicError.message);
      return;
    }

    // ✅ Step 3: Fetch user_topic_aliases
    const { data: aliasData, error: aliasError } = await supabase
      .from('user_topic_aliases')
      .select('alias, variant')
      .eq('user_id', userId);

    if (aliasError) {
      console.error('❌ Error fetching aliases:', aliasError.message);
      return;
    }

    // ✅ Step 4: Build alias lookup map (variant → alias)
    const aliasMap = {};
    aliasData.forEach(({ alias, variant }) => {
      aliasMap[variant] = alias;
    });
    
    // ✅ Step 5: Join topic_mentions to journal entries with resolved aliases
const entriesWithTopics = journalData.map(entry => {
  const relatedTopics = topicData
    .filter(t => t.journal_id === entry.id)
    .map(t => aliasMap[t.topic]) // Only use mapped aliases
    .filter(Boolean); // Remove undefineds

  return {
    ...entry,
    aliases: relatedTopics.length > 0 ? relatedTopics : ['misc']
  };
});

setJournalEntries(entriesWithTopics);
   
  // ✅ Step 6: Normalize topic list for dropdown
const allAliases = [...new Set(entriesWithTopics.flatMap(e => e.aliases || []))];
setTopics(allAliases);
    
    setLoading(false);
  };

  fetchEntries(); // Kick off data fetching
}, [refreshTrigger]);

  // ✅ Step 1: Filter entries by topic before grouping
  const filteredEntries = selectedTopic === 'all'
  ? journalEntries
  : journalEntries.filter(entry =>
      entry.aliases && entry.aliases.includes(selectedTopic)
    );

console.log('🧠 selectedTopic:', selectedTopic);
console.log('🧾 filteredEntries:', filteredEntries.map(e => ({
  id: e.id,
  aliases: e.aliases,
  timestamp: e.timestamp
})));
  
  // ✅ Then group filtered entries by month
  const groupedByMonth = groupBy(filteredEntries, entry =>
    dayjs(entry.timestamp).format('YYYY-MM')
  );

  //Visual Feedback for Empty Results
  {filteredEntries.length === 0 && (
    <p style={{ marginTop:'1rem', fontStyle: 'italic', color: '#666' }}>
      No journal entries found for this topic. 
        </p>
    )}
  
  const timeline = Object.entries(groupedByMonth).map(([month, monthEntries]) => {
    const groupedByDay = groupBy(monthEntries, entry =>
      dayjs(entry.timestamp).format('YYYY-MM-DD')
    );
    
    return {
      month,
      days: Object.entries(groupedByDay).map(([day, entries]) => ({
        day,
        entries: entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      }))
    };
  });

  if (loading) {
    return <div>Loading journal entries...</div>;
  }

  if (!journalEntries.length) {
    return <div>No entries found.</div>;
  }

// const aliasOptions = [...new Set(journalEntries.flatMap(entry => entry.aliases || []))].sort();
  const aliasOptions = [
  ...new Set(
    journalEntries
      .filter(entry => Array.isArray(entry.aliases)) // Only entries with canonical aliases
      .flatMap(entry => entry.aliases)
  )
].sort();

  return (
    <div className="journal-timeline">
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            const newCollapsed = !allCollapsed;
            setAllCollapsed(newCollapsed);

            const updatedState = {};
            timeline.forEach(month =>
              month.days.forEach(day => {
                updatedState[day.day] = newCollapsed;
              })
            );
            setCollapsedDays(updatedState);
          }}
        >
          {allCollapsed ? 'Expand All' : 'Collapse All'}
        </button>
      </div>
          
{/* ✅ Add Topic Filter Dropdown Toggle */} 
        <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="topicFilter">🧠 Filter by topic:</label>   

         <select
      id="topicFilter"
      value={selectedTopic}
      onChange={(e) => setSelectedTopic(e.target.value)}
      style={{ marginLeft: '0.5rem', padding: '0.3rem' }}
    >
      <option value="all">All Topics</option>
      {aliasOptions.map(topic => (
        <option key={topic} value={topic}>
          {topic}
        </option>
      ))}
</select>
    </div>

    {timeline.map(monthBlock => (
        <div key={monthBlock.month} className="month-block">
          <h2>{dayjs(monthBlock.month).format('MMMM YYYY')}</h2>

          {monthBlock.days.map(dayBlock => {
            const dayKey = dayBlock.day;
            const dayEntries = dayBlock.entries;
            // Collapse all days by default except the 5 most recent
            const allDayKeys = timeline.flatMap(month => month.days.map(d => d.day));
            const recentDayKeys = allDayKeys.slice(0, 5); // Adjust to 3 or 7 if needed   
            const isCollapsed = collapsedDays[dayKey] ?? !recentDayKeys.includes(dayKey);
                        
          return (
              <div key={dayKey} className="day-block mb-4">
                <button
                  className="text-left font-semibold text-gray-800 underline mb-2"
                  onClick={() =>
                    setCollapsedDays(prev => ({
                      ...prev,
                      [dayKey]: !prev[dayKey]
                    }))
                  }
                >
                  {dayjs(dayKey).format('dddd, MMM D')}
                </button>

                {!isCollapsed && (
                  <div style={{ marginLeft: '1rem', borderLeft: '1px solid #d1d5db', paddingLeft: '1rem' }}>
                    {dayEntries.map(entry => (
                      <ChatBubble entry={entry} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
