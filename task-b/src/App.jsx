import React, { useState, useEffect, useCallback, useMemo } from 'react';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

function TaskList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/api/tasks?title=${encodeURIComponent(debouncedSearch)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTasks(data.items);
    } catch (err) {
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const TaskItem = useCallback(({ task }) => {
    return (
      <li style={{ marginBottom: '8px' }}>
        <strong>{task.title}</strong> - <em>{task.status}</em> (Priority: {task.priority})
      </li>
    );
  }, []);

  const renderedTasks = useMemo(() => {
    return tasks.map(task => <TaskItem key={task._id} task={task} />);
  }, [tasks, TaskItem]);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '500px',
          boxSizing: 'border-box',
        }}
      >
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '20px',
            boxSizing: 'border-box',
          }}
        />

        {loading && <p style={{ color: '#555' }}>Loading...</p>}

        {error && (
          <div style={{ marginBottom: '20px', color: 'red' }}>
            <p>Error: {error}</p>
            <button
              onClick={fetchTasks}
              style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && <p style={{ color: '#777' }}>No tasks found.</p>}

        <ul style={{ paddingLeft: '20px', color: '#333' }}>{renderedTasks}</ul>
      </div>
    </div>
  );
}

export default TaskList;
