import { useEffect, useMemo, useState } from 'react'
import './styles.css'

const QUADRANTS = [
  { id: 'urgent-important', eyebrow: 'DO FIRST', title: '着急且重要', description: '现在就该处理的关键事项', tone: 'coral' },
  { id: 'important', eyebrow: 'SCHEDULE', title: '重要但不着急', description: '值得投入时间的长期事项', tone: 'blue' },
  { id: 'urgent', eyebrow: 'DELEGATE', title: '着急但不重要', description: '尽快完成，避免占用太多精力', tone: 'amber' },
  { id: 'neither', eyebrow: 'LATER', title: '不着急且不重要', description: '有空再做的小事', tone: 'slate' },
]

const seed = [
  { id: 1, text: '准备明天的产品演示', quadrant: 'urgent-important', done: false },
  { id: 2, text: '完成季度目标复盘', quadrant: 'important', done: false },
  { id: 3, text: '回复团队群里的消息', quadrant: 'urgent', done: true },
  { id: 4, text: '整理桌面上的文件', quadrant: 'neither', done: false },
]

function App() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quadrant-tasks')) || seed } catch { return seed }
  })
  const [drafts, setDrafts] = useState({})
  const [dragging, setDragging] = useState(null)

  useEffect(() => localStorage.setItem('quadrant-tasks', JSON.stringify(tasks)), [tasks])
  const completed = useMemo(() => tasks.filter(t => t.done).length, [tasks])

  const addTask = (quadrant) => {
    const text = (drafts[quadrant] || '').trim()
    if (!text) return
    setTasks(prev => [...prev, { id: Date.now(), text, quadrant, done: false }])
    setDrafts(prev => ({ ...prev, [quadrant]: '' }))
  }
  const toggle = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove = id => setTasks(prev => prev.filter(t => t.id !== id))
  const drop = quadrant => {
    if (dragging) setTasks(prev => prev.map(t => t.id === dragging ? { ...t, quadrant } : t))
    setDragging(null)
  }

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><div><h1>四象限</h1><p>把时间花在真正重要的事上</p></div></div>
      <div className="summary"><span className="summary-dot" />{completed} / {tasks.length} 已完成</div>
    </header>
    <section className="intro"><div><p className="kicker">YOUR FOCUS BOARD</p><h2>今天，先做最重要的事。</h2></div><div className="hint">拖动任务卡片<br /><span>重新安排优先级</span></div></section>
    <section className="board">
      {QUADRANTS.map(q => <article key={q.id} className={`quadrant ${q.tone} ${dragging ? 'is-droppable' : ''}`} onDragOver={e => e.preventDefault()} onDrop={() => drop(q.id)}>
        <div className="quadrant-head"><div><p className="eyebrow">{q.eyebrow}</p><h3>{q.title}</h3><p className="description">{q.description}</p></div><span className="count">{tasks.filter(t => t.quadrant === q.id && !t.done).length}</span></div>
        <div className="task-list">{tasks.filter(t => t.quadrant === q.id).map(task => <div key={task.id} className={`task ${task.done ? 'done' : ''}`} draggable onDragStart={() => setDragging(task.id)} onDragEnd={() => setDragging(null)}>
          <button className="check" onClick={() => toggle(task.id)} aria-label="完成任务">{task.done ? '✓' : ''}</button><span className="task-text">{task.text}</span><button className="delete" onClick={() => remove(task.id)} aria-label="删除任务">×</button>
        </div>)}</div>
        <div className="add-row"><input value={drafts[q.id] || ''} onChange={e => setDrafts(prev => ({ ...prev, [q.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addTask(q.id)} placeholder="添加一项任务..." /><button onClick={() => addTask(q.id)} aria-label="添加任务">＋</button></div>
      </article>)}
    </section>
    <footer>所有任务自动保存在本地浏览器 <span>·</span> {new Date().getFullYear()} 四象限</footer>
  </main>
}

export default App
