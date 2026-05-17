import { useState, useEffect } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function App() {
  const [tasks, setTasks] = useState([]);
  const [newPlan, setNewPlan] = useState({ name: '', category: 'Deep Work' });
  // Tracks which category dropdown matrices are expanded locally
  const [expandedCategories, setExpandedCategories] = useState({
    'Deep Work': true,
    'Physical Training': true,
    'Bio-Maintenance': true
  });

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
    // FIXED: Removed the invalid python '.strip' handler causing the submission blockage
    if (!newPlan.name || !newPlan.name.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlan.name.trim(), category: newPlan.category })
      });
      if (response.ok) {
        setNewPlan({ name: '', category: newPlan.category }); // Clear input field but retain current category context
        fetchTasks(); // Instantly refresh matrix list
      }
    } catch (error) {
      console.error("Failed to inject new plan:", error);
    }
  };

  // --- PROGRESS WHEEL & HEATMAP MATHEMATICS ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const circularData = completionPercentage === 0 
    ? [{ name: 'Zero Base', value: 1, color: '#2a2a2a' }] 
    : [
        { name: 'Completed', value: completedTasks, color: '#4caf50' },
        { name: 'Remaining', value: totalTasks - completedTasks, color: '#2a2a2a' }
      ];

  const generateMonthCubes = () => {
    const cubes = [];
    const currentDay = new Date().getDate(); 
    for (let i = 1; i <= 30; i++) {
      let intensity = 0;
      if (i === currentDay) {
        intensity = completedTasks; 
      }
      cubes.push({ day: i, intensity });
    }
    return cubes;
  };

  const monthCubes = generateMonthCubes();

  // --- DYNAMIC CATEGORY CATEGORIZATION MATRIX ---
  const categoriesList = ['Deep Work', 'Physical Training', 'Bio-Maintenance'];
  
  // Group tasks into arrays matching their categorical core
  const groupedTasks = categoriesList.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category === cat);
    return acc;
  }, {});

  const toggleCategoryDropdown = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      
      {/* HEADER BANNER */}
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>The Shadow Ledger</h1>
          <p style={{ color: '#888', margin: '5px 0 0 0' }}>Ghost Protocol: Active</p>
        </div>
        <div>
          <span style={{ color: '#4caf50', fontSize: '1.2rem', fontWeight: 'bold' }}>Sync Status: Stable</span>
        </div>
      </header>

      {/* INTELLIGENCE ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* VELOCITY ENGINE */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Velocity</h3>
          <div style={{ width: '100%', height: '180px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={circularData} innerRadius={65} outerRadius={80} startAngle={90} endAngle={-270} paddingAngle={completionPercentage === 0 ? 0 : 4} dataKey="value" stroke="none">
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

        {/* 30-CYCLE GRID MATRIX */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Matrix Heatmap (30-Cycle View)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px', marginTop: '1.5rem' }}>
            {monthCubes.map((cube) => {
              const shades = ['#1a1a1a', '#1e2d1e', '#2e4d2e', '#3e7d3e', '#4caf50'];
              const shadeIndex = Math.min(cube.intensity, shades.length - 1);
              const isToday = cube.day === new Date().getDate();
              return (
                <div key={cube.day} style={{ aspectRatio: '1/1', backgroundColor: shades[shadeIndex], border: isToday ? '1px solid #4caf50' : '1px solid #2d2d2d', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: cube.intensity > 0 ? '#fff' : '#444', fontWeight: 'bold' }}>
                  {cube.day}
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* CORE FRAMEWORK INTERACTION CONTROL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        
        {/* INPUT CONTROL */}
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

            <button onClick={addPlan} style={{ backgroundColor: '#4caf50', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', marginTop: '1rem' }}>
              Inject Plan into Matrix
            </button>
          </div>
        </div>

        {/* OPERATIONS DROPDOWN MATRIX WITH NESTED STRIKE-THROUGH LOGIC */}
        <div>
          <h2 style={{ marginTop: 0, textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>Active Operations Vault</h2>
          
          {categoriesList.map((category) => {
            const currentCatTasks = groupedTasks[category] || [];
            const hasTasks = currentCatTasks.length > 0;
            
            // CRITICAL LOGIC DETECTOR: True if there are tasks and EVERY single one is marked as complete
            const isCategoryFullyFulfilled = hasTasks && currentCatTasks.every(t => t.completed);

            return (
              <div key={category} style={{ marginBottom: '1rem', border: '1px solid #333', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#161616' }}>
                
                {/* THE MASTER CATEGORY CONTAINER HEADER */}
                <div 
                  onClick={() => toggleCategoryDropdown(category)}
                  style={{ 
                    padding: '1rem 1.2rem', 
                    backgroundColor: isCategoryFullyFulfilled ? '#1b331b' : '#222', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: expandedCategories[category] && hasTasks ? '1px solid #333' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span style={{ 
                    fontWeight: 'bold', 
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    // VISUAL STRIKE-OFF OF THE MAIN MASTER BOX RULE
                    textDecoration: isCategoryFullyFulfilled ? 'line-through' : 'none',
                    color: isCategoryFullyFulfilled ? '#4caf50' : '#fff'
                  }}>
                    {category} ({currentCatTasks.filter(t=>t.completed).length}/{currentCatTasks.length})
                  </span>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>
                    {expandedCategories[category] ? '▲' : '▼'}
                  </span>
                </div>

                {/* DROPDOWN SUB-TASK CONTAINER */}
                {expandedCategories[category] && (
                  <div style={{ backgroundColor: '#1a1a1a' }}>
                    {!hasTasks ? (
                      <div style={{ padding: '1rem', color: '#555', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        No tactical protocols active in this coordinate.
                      </div>
                    ) : (
                      currentCatTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          style={{
                            padding: '0.9rem 1.5rem',
                            borderBottom: '1px solid #262626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            cursor: 'pointer',
                            backgroundColor: task.completed ? '#192619' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          {/* THE NESTED INTERACTIVE CHECKBOX */}
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: task.completed ? '2px solid #4caf50' : '2px solid #555',
                            backgroundColor: task.completed ? '#4caf50' : 'transparent',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.1s ease'
                          }}>
                            {task.completed && <span style={{ color: '#121212', fontSize: '10px', fontWeight: 'bold' }}>✓</span>}
                          </div>

                          <span style={{ 
                            fontSize: '0.9rem', 
                            textDecoration: task.completed ? 'line-through' : 'none', 
                            color: task.completed ? '#66b266' : '#ddd' 
                          }}>
                            {task.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>

    </div>
  )
}

export default App