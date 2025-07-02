import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';
import groupBy from 'lodash.groupby';

export default function JournalTimeline() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedDays, setCollapsedDays] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries:', error);
      } else {
        setJournalEntries(data);

        const allTopics = [...new Set(
          data.flatMap(entry => {
            try {
              return JSON.parse(entry.emotion_tags || '[]');
            } catch {
              return [];
            }
          })
        )].sort();
        setTopics(allTopics);
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  const groupedByMonth = groupBy(journalEntries, entry =>
    dayjs(entry.created_at).format('YYYY-MM')
  );

  const timeline = Object.entries(groupedByMonth).map(([month, monthEntries]) => {
    const groupedByDay = groupBy(monthEntries, entry =>
      dayjs(entry.created_at).format('YYYY-MM-DD')
    );

  const groupedByMonth = groupBy(entries, (entry) =>
    daysjs(entry.timestamp).format('MMMM YYYY')
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
  <div className="p-4">
    {timeline.map(({ month, days }) => {
      const isMonthCollapsed = collapsedMonths[month];
      return (
        <div key={month} className="month-block mb-6">
          <button
            className="text-xl font-bold text-indigo-700 mb-3"
            onClick={() =>
              setCollapsedMonths(prev => ({
                ...prev,
                [month]: !prev[month],
              }))
            }
          >
            {month}
          </button>

          {!isMonthCollapsed && (
            <div className="ml-4">
              {days.map(({ day, entries }) => {
                const isDayCollapsed = collapsedDays[day];
                return (
                  <div key={day} className="day-block mb-4">
                    <button
                      className="text-left font-semibold text-gray-800 underline mb-2"
                      onClick={() =>
                        setCollapsedDays(prev => ({
                          ...prev,
                          [day]: !prev[day],
                        }))
                      }
                    >
                      {dayjs(day).format('dddd, MMM D')}
                    </button>

                    {!isDayCollapsed && (
                      <div className="ml-4 border-l border-gray-300 pl-4">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="mb-2 p-2 bg-gray-50 rounded shadow"
                          >
                            <p>{entry.entry_text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })}
  </div>
);
}
