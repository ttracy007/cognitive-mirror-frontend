import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';
import groupBy from 'lodash.groupby';

const JournalGroupedView = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [collapsedWeeks, setCollapsedWeeks] = useState({});
  const [collapsedDays, setCollapsedDays] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries:', error.message);
      } else {
        setJournalEntries(data);
        const allTopics = [...new Set(data.flatMap(entry => JSON.parse(entry.emotion_tags || '[]')))].sort();
        setTopics(allTopics);
      }
    };

    fetchEntries();
  }, []);

  const toggleCollapse = (key, stateSetter, stateObj) => {
    stateSetter({ ...stateObj, [key]: !stateObj[key] });
  };

  const toggleAll = () => {
    const newCollapsed = !allCollapsed;
    const nextMonth = {};
    const nextWeek = {};
    const nextDay = {};

    journalEntries.forEach(entry => {
      const monthKey = dayjs(entry.timestamp).format('YYYY-MM');
      const weekKey = dayjs(entry.timestamp).format('YYYY-[W]WW');
      const dayKey = dayjs(entry.timestamp).format('YYYY-MM-DD');
      nextMonth[monthKey] = newCollapsed;
      nextWeek[weekKey] = newCollapsed;
      nextDay[dayKey] = newCollapsed;
    });

    setCollapsedMonths(nextMonth);
    setCollapsedWeeks(nextWeek);
    setCollapsedDays(nextDay);
    setAllCollapsed(newCollapsed);
  };

  const filteredEntries = activeTopic
    ? journalEntries.filter(entry => (entry.emotion_tags || '').includes(activeTopic))
    : journalEntries;

  const groupedByMonth = groupBy(filteredEntries, entry => dayjs(entry.timestamp).format('YYYY-MM'));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Journal Entries</h2>
        <button
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          onClick={toggleAll}
        >
          {allCollapsed ? 'Expand All' : 'Collapse All'}
        </button>
      </div>

      {topics.length > 0 && (
        <div className="mb-4">
          <label className="font-medium mr-2">Filter by topic:</label>
          <select
            className="border px-2 py-1 rounded"
            value={activeTopic || ''}
            onChange={(e) => setActiveTopic(e.target.value || null)}
          >
            <option value=''>All</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
      )}

      {Object.entries(groupedByMonth).map(([monthKey, monthEntries]) => {
        const groupedByWeek = groupBy(monthEntries, entry => dayjs(entry.timestamp).format('YYYY-[W]WW'));
        return (
          <div key={monthKey} className="mb-6">
            <button
              className="text-lg font-semibold underline mb-2"
              onClick={() => toggleCollapse(monthKey, setCollapsedMonths, collapsedMonths)}
            >
              {dayjs(monthKey).format('MMMM YYYY')}
            </button>

            {!collapsedMonths[monthKey] && (
              <div className="ml-4">
                {Object.entries(groupedByWeek).map(([weekKey, weekEntries]) => {
                  const groupedByDay = groupBy(weekEntries, entry => dayjs(entry.timestamp).format('YYYY-MM-DD'));
                  return (
                    <div key={weekKey} className="mb-4">
                      <button
                        className="font-medium underline"
                        onClick={() => toggleCollapse(weekKey, setCollapsedWeeks, collapsedWeeks)}
                      >
                        {weekKey}
                      </button>
                      {!collapsedWeeks[weekKey] && (
                        <div className="ml-4">
                          {Object.entries(groupedByDay).map(([dayKey, dayEntries]) => (
                            <div key={dayKey} className="mb-2">
                              <button
                                className="text-sm underline"
                                onClick={() => toggleCollapse(dayKey, setCollapsedDays, collapsedDays)}
                              >
                                {dayjs(dayKey).format('dddd, MMM D')}
                              </button>
                              {!collapsedDays[dayKey] && (
                                <div className="ml-4 border-l border-gray-300 pl-4">
                                  {dayEntries.map(entry => (
                                    <div key={entry.id} className="mb-2 p-2 bg-gray-50 rounded shadow">
                                      <p>{entry.entry_text}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
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
};

export default JournalGroupedView;
