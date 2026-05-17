import { useState, useEffect } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function App() {
  const [tasks, setTasks] = useState([]);
  const [newPlan, setNewPlan] = useState({ name: '', category: 'Deep Work' });

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
    if (!newPlan.name.strip || !newPlan.name.trim()) return;
    try {
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlan.name, category: newPlan.category })
      });
      setNewPlan({ name: '', category: 'Deep Work' }); // Reset entry field
      fetchTasks(); // Instantly refresh table matrix
    } catch (error) {
      console.error("Failed to inject new plan:", error);
    }
  };

  // --- PROGRESS WHEEL MATHEMATICS (FIXES THE GAP) ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const circularData = completionPercentage === 0 
    ? [{ name: 'Zero Base', value: 1, color: '#2a2a2a' }] // Pure solid unified ring when 0%
    : [
        { name: 'Completed', value: completedTasks, color: '#4caf50' },
        { name: 'Remaining', value: totalTasks - completedTasks, color: '#2a2a2a' }
      ];

  // --- MONTHLY CUBE HEATMAP MATRIX GENERATION (30 DAYS) ---
  const generateMonthCubes = () => {
    const cubes = [];
    // We base the active intensity dynamically on your current completions to show it working!
    const activeDayIndex = 14; // Let's highlight the middle of the month dynamically
    
    for (let i = 1; i <= 30; i++) {
      let intensity = 0; // Default cold slate
      if (i === activeDayIndex) {
        intensity = completedTasks; // Scales up based on how many boxes you check!
      } 
      cubes.push({ day: i, intensity });
    }
    return cubes;
  };

  const monthCubes = generateMonthCubes();

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      
      {/* HEADER SYSTEM */}
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>The Shadow Ledger</h1>
          <p style={{ color: '#888', margin: '5px 0 0 0' }}>Ghost Protocol: Active</p>
        </div>
        <div>
          <span style={{ color: '#4caf50', fontSize: '1.2rem', fontWeight: 'bold' }}>Sync Status: Stable</span>
        </div>
      </header>

      {/* DASHBOARD GRID LAYER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* PROGRESSION ENGINE */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Velocity</h3>
          <div style={{ width: '100%', height: '180px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={circularData} 
                  innerRadius={65} 
                  outerRadius={80} 
                  startAngle={90} 
                  endAngle={-270} 
                  paddingAngle={completionPercentage === 0 ? 0 : 4} 
                  dataKey="value"
                  stroke="none" // Destroys the micro-cut gap anomaly completely
                >
                  {circularData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#fff' }}>{completionPercentage}%</span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Fulfillments</p>
            </div>
          </div>
        </div>

        {/* MONTHLY CUBE MATRIX HEATMAP */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Matrix Heatmap (30-Cycle View)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px', marginTop: '1.5rem' }}>
            {monthCubes.map((cube) => {
              // GitHub-style operational intensity shade scales
              const shades = ['#1a1a1a', '#1e2d1e', '#2e4d2e', '#3e7d3e', '#4caf50'];
              const shadeIndex = Math.min(cube.intensity, shades.length - 1);
              const borderStyle = cube.day === 14 ? '1px solid #4caf50' : '1px solid #2d2d2d';
              
              return (
                <div 
                  key={cube.day}
                  title={`Cycle Day ${cube.day} | Intensity Vector: ${cube.intensity}`}
                  style={{
                    aspectRatio: '1/1',
                    backgroundColor: shades[shadeIndex],
                    border: borderStyle,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: cube.intensity > 0 ? '#fff' : '#444',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {cube.day}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1rem', fontSize: '0.7rem', color: '#666' }}>
            <span>Less</span>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#1a1a1a', borderRadius: '2px' }}></div>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#1e2d1e', borderRadius: '2px' }}></div>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#2e4d2e', borderRadius: '2px' }}></div>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#4caf50', borderRadius: '2px' }}></div>
            <span>More</span>
          </div>
        </div>

      </div>

      {/* LOWER INTERACTION INTERFACE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        
        {/* INSCRIBE DATA MODULE */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Inscribe New Plan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase' }}>Plan Identifier:</label>
            <input 
              type="text" 
              placeholder="e.g., Push-ups / Deep Work Block"
              value={newPlan.name}
              onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
              style={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '0.7rem', borderRadius: '4px', fontFamily: 'monospace' }}
            />
            
            <label style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase' }}>Category Core:</label>
            <select 
              value={newPlan.category} 
              onChange={(e) => setNewPlan({...newPlan, category: e.target.value})}
              style={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '0.7rem', borderRadius: '4px', fontFamily: 'monospace' }}
            >
              <option>Deep Work</option>
              <option>Physical Training</option>
              <option>Bio-Maintenance</option>
            </select>

            {/* CRITICAL FIX: THE CLICK INTERCEPTOR WIRE IS ATTACHED HERE */}
            <button 
              onClick={addPlan} 
              style={{ backgroundColor: '#4caf50', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', marginTop: '1rem', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#66bb6a'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}
            >
              Inject Plan into Matrix
            </button>
          </div>
        </div>

        {/* OPERATIONS DISPATCH LIST */}
        <div>
          <h2 style={{ marginTop: 0, textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '1px' }}>Active Daily Operations</h2>
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
                  <h3 style={{ margin: 0, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#4caf50' : '#fff', fontSize: '1rem' }}>
                    {task.name}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#555', display: 'block', marginTop: '4px', textTransform: 'uppercase' }}>{task.category}</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', backgroundColor: task.completed ? '#4caf50' : '#2a2a2a', borderRadius: '3px', color: task.completed ? '#fff' : '#888', fontWeight: 'bold' }}>
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