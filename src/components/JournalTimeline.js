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
  const [selectedTopic, setSelecteTopic] = useState('all');
  const [collaspedMonths, setCollapsedMonths] = useState({});

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);

      // Fetch journals
      const { data: journalData, error: journalError } = await supabase
        .from('journals')
        .select('*')
        .order('created_at', { ascending: false });

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

  const groupedByMonth = groupBy(journalEntries, entry =>
    dayjs(entry.created_at).format('YYYY-MM')
  );

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
                  <div className="ml-4 border-l border-gray-300 pl-4">
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
