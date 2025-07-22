// Step 1: Import dependencies at the top of JournalTimeline.js
import React, { useEffect, useState, useMemo } from 'react';
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

// const TOPIC_AND_SEVERITY_PROMPT = `
// You are an emotional insight detector. Given a user's journal reflection, extract two things:

// 1. Topics: the literal subjects driving the reflection — people, situations, unfinished tasks, real-world concerns. Each should be 1–3 word noun phrases. No vague emotions. Ask: “What are they actually talking about?”

// 2. Severity: the level of emotional entrenchment or distress, on a scale of 1–5.

// Format:
// Topics: [comma-separated, lowercase, literal phrases]
// Severity: [1–5]
// `;

export default function JournalTimeline({userId, refreshTrigger }) {
  const [journalEntries, setJournalEntries] = useState([]);
  // const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedDays, setCollapsedDays] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  // const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [collaspedMonths, setCollapsedMonths] = useState({});
//   const extractTopicsAndSeverity = async (entryText) => {
//   const gptResponse = await callOpenAIChat([
//     { role: 'system', content: TOPIC_AND_SEVERITY_PROMPT },
//     { role: 'user', content: entryText }
//   ]);
//   const topicMatch = gptResponse.match(/Topics:\s*\[(.*?)\]/i);
//   const parsedTopics = topicMatch
//     ? topicMatch[1].split(',').map(t => t.trim().toLowerCase())
//     : [];
//   const severityMatch = gptResponse.match(/Severity:\s*(\d)/i);
//   const severityRating = severityMatch && severityMatch[1]
//     ? parseInt(severityMatch[1])
//     : 1;
//   return { parsedTopics, severityRating };
// };

// ✅ Canonical theme list for dropdown
const canonicalThemes = [
  'Meaning / Existential Anxiety',
  'Identity / Role Confusion',
  'Purpose / Direction',
  'Control / Safety',
  'Attachment / Relationships',
  'Autonomy / Power',
  'Vulnerability / Trust',
  'Self-worth / Shame',
  'Motivation / Change',
  'Grief / Loss'
];

const [themeOptions, setThemeOptions] = useState([]);
useEffect(() => {
setThemeOptions(canonicalThemes);
}, []);

// Smart Insight Card 
const [showSmartInsight, setShowSmartInsight] = useState(true);
const [insightTheme, setInsightTheme] = useState('');

// 🧠 Compute monthly mention count for selected theme
const monthlyMentions = insightTheme
  ? journalEntries.filter(entry => {
      const isMatch =
        entry.primary_theme === insightTheme ||
        entry.secondary_theme === insightTheme;
      const inThisMonth =
        dayjs(entry.timestamp).isSame(dayjs(), 'month');
      return isMatch && inThisMonth;
    }).length
  : 0;

const [themeInsight, setThemeInsight] = useState(null);

useEffect(() => {
  const fetchInsight = async () => {
    if (!insightTheme || !userId) {
      setThemeInsight(null);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/mention-count?user_id=${userId}&theme=${encodeURIComponent(insightTheme)}`
      );
      const data = await response.json();
      if (response.ok) {
        setThemeInsight(data);
      } else {
        console.error('❌ Error fetching theme insight:', data.error);
        setThemeInsight(null);
      }
    } catch (err) {
      console.error('❌ Fetch failed:', err);
      setThemeInsight(null);
    }
  };

  fetchInsight();
}, [insightTheme, userId]);
  
useEffect(() => {
  const fetchJournals = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('journals')
      .select('*')  // ✅ Include all fields for flexibility
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Error fetching journals:', error.message);
      setLoading(false);
      return;
    }

    setJournalEntries(data || []);
    console.log('✅ journalEntries populated:', data); // Add this
    setLoading(false);
  };

  fetchJournals();
}, [userId, refreshTrigger]);



 // ✅ FILTER THEMES: Step 1: Filter entries by selected theme before grouping
const filteredEntries = selectedTheme
  ? journalEntries.filter(entry =>
      entry.primary_theme?.toLowerCase() === selectedTheme.toLowerCase() || 
      entry.secondary_theme?.toLowerCase() === selectedTheme.toLowerCase()
    )
  : journalEntries;

// console.log('🧠 selectedTheme:', selectedTheme);
// console.log('🧾 filteredEntries:', filteredEntries.map(e => ({
//   id: e.id,
//   primary_theme: e.primary_theme,
//   secondary_theme: e.secondary_theme,
//   timestamp: e.timestamp
// })));

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

  const themeSet = new Set();

journalEntries.forEach(entry => {
  if (entry.primary_theme) themeSet.add(entry.primary_theme);
  if (entry.secondary_theme && entry.secondary_theme !== 'NONE') {
    themeSet.add(entry.secondary_theme);
  }
});


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
          
{/* ✅ Add Theme Filter Dropdown Toggle */} 
        <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="themeFilter">🧠 Filter by theme:</label>   

         <select
      id="themeFilter"
      value={selectedTheme}
      onChange={(e) => setSelectedTheme(e.target.value)}
      style={{ marginLeft: '0.5rem', padding: '0.3rem' }}
    >
      <option value="all">All Themes</option>
      {themeOptions.map(theme => (
        <option key={theme} value={theme}>
          {theme}
        </option>
      ))}
</select>
    </div>

{/* 🧠 Smart Topic Insight Card */}
{showSmartInsight && (
  <div style={{ 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    padding: '1rem', 
    marginBottom: '2rem',
    backgroundColor: '#f9fafb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Smart Topic Insight</h2>

    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.75rem' }}>
      <label style={{ display: 'flex', alignItems: 'center' }}>
        <input 
          type="checkbox" 
          checked={showSmartInsight} 
          onChange={() => setShowSmartInsight(!showSmartInsight)} 
          style={{ marginRight: '0.5rem' }}
        />
        Filter by theme:
      </label>

      <select
        value={insightTheme}
        onChange={(e) => setInsightTheme(e.target.value)}
        style={{ marginLeft: '0.5rem', padding: '0.3rem' }}
      >
        <option value="">Select theme</option>
        {themeOptions.map(theme => (
          <option key={theme} value={theme}>
            {theme}
          </option>
        ))}
      </select>
    </div>

{themeInsight && (
  <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
    <li>🧠 You’ve mentioned this theme <strong>{themeInsight.totalMentions}</strong> times total.</li>
    <li>🗓️ <strong>{themeInsight.recentMentions}</strong> entries were in the past 10 days.</li>
    <li>📉 Compared to <strong>{themeInsight.earlierMentions}</strong> earlier entries, your pattern is trending <strong>{themeInsight.trend}</strong>.</li>
  </ul>
)}

 </div>
)}

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

  
