import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([]);
  
  // Connects to your future Python API. 
  // It falls back to localhost:8000 when you are testing on your own computer.
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch from the armory:", error);
    }
  };

  const toggleTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}/toggle`, { method: 'POST' });
      fetchTasks(); // Refresh the list to show the green highlight
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0' }}>The Shadow Ledger</h1>
        <p style={{ color: '#888', margin: 0 }}>Ghost Protocol: Active</p>
      </header>

      <main>
        <h2>Daily Protocol Matrix</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
          {tasks.length === 0 ? (
            <p style={{ color: '#555' }}>Awaiting connection to backend vault...</p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                style={{ 
                  padding: '1rem', 
                  backgroundColor: task.completed ? '#1e3a1e' : '#1e1e1e', 
                  border: task.completed ? '1px solid #4caf50' : '1px solid #333',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease'
                }}
              >
                <h3 style={{ margin: 0, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#4caf50' : '#fff' }}>
                  {task.name}
                </h3>
              </div>
            ))
          )}
        </div>
      </main>

    </div>
  )
}

export default App