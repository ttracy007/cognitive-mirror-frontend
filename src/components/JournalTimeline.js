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

export default function JournalTimeline({userId, refreshTrigger, styleVariant }) {
  const [journalEntries, setJournalEntries] = useState([]);
  // const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedDays, setCollapsedDays] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  // const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [collaspedMonths, setCollapsedMonths] = useState({});

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
        entries: sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // 📈 Old-to-new per day
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
  <div style={{ padding: '1rem', paddingBottom: '5rem' }}>
    {Object.entries(
      journalEntries.reduce((acc, entry) => {
        const dateKey = dayjs(entry.timestamp).format('YYYY-MM-DD');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(entry);
        return acc;
      }, {})
    )
      .sort((a, b) => new Date(b[0]) - new Date(a[0])) // 🪃 Recent date first
      .map(([dateKey, entries]) => (
        <div key={dateKey} style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#444'
          }}>
            {dayjs(dateKey).format('MMMM D, YYYY')}
          </h3>
          {entries
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map(entry => (
              <div key={entry.id || entry.timestamp} style={{ marginBottom: '1rem' }}>
                {entry.entry_text && (
                  <ChatBubble
                    entry={{
                      entry_text: entry.entry_text,
                      tone_mode: 'user',
                      entry_type: 'reflection'
                    }}
                    styleVariant={styleVariant}
                  />
                )}
          
                {entry.response_text && (
                  <ChatBubble
                    entry={entry}
                    styleVariant={styleVariant}
                  />
                )}
              </div>
          ))}
        </div>
      ))}
  </div>
);

}

  
