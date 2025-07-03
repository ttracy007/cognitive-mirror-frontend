// Step 1: Import dependencies at the top of JournalTimeline.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import Card from './Card';
import { Button } from './Button';

export default function JournalTimeline() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedDays, setCollapsedDays] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [collaspedMonths, setCollapsedMonths] = useState({});

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);

      // Fetch journals
      const { data: journalData, error: journalError } = await supabase
        .from('journals')
        .select('*')
        .order('timestamp', { ascending: false });

      if (journalError) {
        console.error('Error fetching journals:', journalError.message);
        return;
      }

      //Fetch topics
      const { data: topicData, error: topicError } = await supabase
        .from('topic_mentions')
        .select('journal_id, topic');

      if (topicError) {
        console.error('Error fetching topics:', topicError.message);
        return;
      }

     // Join topics to journal entries
const entriesWithTopics = journalData.map(entry => {
  const relatedTopics = topicData
    .filter(t => t.journal_id === entry.id)
    .map(t => t.topic);

  return {
    ...entry,
    topics: relatedTopics
  };
});

setJournalEntries(entriesWithTopics);

const allTopics = [...new Set(topicData.map(t => t.topic))];
setTopics(allTopics);

     setLoading(false); // ✅ Finish loading state
    };

    fetchEntries(); // ✅ Kick off data fetching
  }, []);

  // ✅ Step 1: Filter entries by topic before grouping
  const filteredEntries = selectedTopic === 'all'
    ? journalEntries
    : journalEntries.filter(entry =>
        entry.topics && entry.topics.includes(selectedTopic)
      );
  
  // ✅ Then group filtered entries by month
  const groupedByMonth = groupBy(filteredEntries, entry =>
    dayjs(entry.created_at).format('YYYY-MM')
  );

  //Visual Feedback for Empty Results
  {filteredEntries.length === 0 && (
    <p style={{ marginTop:'1rem', fontStyle: 'italic', color: '#666' }}>
      No journal entries found for this topic. 
        </p>
    )}
  
  const timeline = Object.entries(groupedByMonth).map(([month, monthEntries]) => {
    const groupedByDay = groupBy(monthEntries, entry =>
      dayjs(entry.created_at).format('YYYY-MM-DD')
    );

    return {
      month,
      days: Object.entries(groupedByDay).map(([day, entries]) => ({
        day,
        entries: entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }))
    };
  });

  if (loading) {
    return <div>Loading journal entries...</div>;
  }

  if (!journalEntries.length) {
    return <div>No entries found.</div>;
  }

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
        {topics.map(topic => (
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
            const isCollapsed = collapsedDays[dayKey];

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
                     <Card>
                      <p>{entry.entry_text}</p>
                      </Card>
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
