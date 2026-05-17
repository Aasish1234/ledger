import { useState, useEffect } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

function App() {
  const [tasks, setTasks] = useState([]);
  const [newPlan, setNewPlan] = useState({ name: '', category: 'Deep Work', priority: 'Medium' });

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
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };
  const addPlan = async () => {
    if (!newPlan.name) return;
    try {
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlan.name, category: newPlan.category })
      });
      setNewPlan({ name: '', category: 'Deep Work', priority: 'Medium' }); // Reset form
      fetchTasks(); // Refresh list to show new item
    } catch (error) {
      console.error("Failed to inject new plan:", error);
    }
  };
   // --- MATHEMATICAL DATA CALCULATIONS ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Data structure for the Circular Progression Graph
  const circularData = [
    { name: 'Completed', value: completedTasks, color: '#4caf50' },
    { name: 'Remaining', value: totalTasks - completedTasks, color: '#2a2a2a' }
  ];

  // Simulated Heatmap/Activity Matrix Data for the last 7 cycles
  const weeklyHeatmapData = [
    { day: 'Mon', intensity: 4 },
    { day: 'Tue', intensity: 7 },
    { day: 'Wed', intensity: 5 },
    { day: 'Thu', intensity: 8 },
    { day: 'Fri', intensity: 6 },
    { day: 'Sat', intensity: 9 },
    { day: 'Sun', intensity: completedTasks * 3 } // Dynamically shifts based on your current clicks!
  ];

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      
      {/* HEADER BANNER */}
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>The Shadow Ledger</h1>
          <p style={{ color: '#888', margin: '5px 0 0 0' }}>Ghost Protocol: Active</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#4caf50', fontSize: '1.2rem', fontWeight: 'bold' }}>Sync Status: Stable</span>
        </div>
      </header>

      {/* VISUAL INTELLIGENCE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* THE CIRCULAR PROGRESSION GRAPH */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase' }}>Daily Velocity</h3>
          <div style={{ width: '100%', height: '200px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={circularData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {circularData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{completionPercentage}%</span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Fulfillments</p>
            </div>
          </div>
        </div>

        {/* THE WEEKLY ACTIVITY HEATMAP MATRIX */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase' }}>Weekly Matrix Heatmap</h3>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHeatmapData}>
                <XAxis dataKey="day" stroke="#888" />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }} />
                <Bar dataKey="intensity" radius={[4, 4, 0, 0]}>
                  {weeklyHeatmapData.map((entry, index) => {
                    // Simulating a heatmap color intensity scale dynamically
                    const colors = ['#1e251e', '#2e3d2e', '#3e543e', '#4caf50', '#66bb6a'];
                    const colorIdx = Math.min(Math.floor(entry.intensity / 2), colors.length - 1);
                    return <Cell key={`cell-${index}`} fill={colors[colorIdx]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* LOWER INTERACTION SYSTEM */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        
        {/* INCRIPTION MATRIX: DETAILED PLANS ENTRY */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', textTransform: 'uppercase' }}>Inscribe New Plan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Plan Identifier:</label>
            <input 
              type="text" 
              placeholder="e.g., Target Acquisition / Lab Sprint"
              value={newPlan.name}
              onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
              style={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '0.7rem', borderRadius: '4px', fontFamily: 'monospace' }}
            />
            
            <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Category Core:</label>
            <select 
              value={newPlan.category} 
              onChange={(e) => setNewPlan({...newPlan, category: e.target.value})}
              style={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '0.7rem', borderRadius: '4px', fontFamily: 'monospace' }}
            >
              <option>Deep Work</option>
              <option>Physical Training</option>
              <option>Bio-Maintenance</option>
            </select>

            <button style={{ backgroundColor: '#4caf50', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', marginTop: '1rem' }}>
              Inject Plan into Matrix
            </button>
          </div>
        </div>

        {/* PROTOCOL LIST FRAME */}
        <div>
          <h2 style={{ marginTop: 0 }}>Active Daily Operations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                style={{ 
                  padding: '1.2rem', 
                  backgroundColor: task.completed ? '#1e3a1e' : '#1e1e1e', 
                  border: task.completed ? '1px solid #4caf50' : '1px solid #333',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#4caf50' : '#fff' }}>
                    {task.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginTop: '4px' }}>CORE PROTOCOL</span>
                </div>
                <span style={{ fontSize: '0.8rem', padding: '2px 6px', backgroundColor: '#333', borderRadius: '3px', color: '#aaa' }}>
                  {task.completed ? "FULFILLED" : "PENDING"}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

export default App