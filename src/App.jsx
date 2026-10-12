import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'
import './themes.css'
import './task-interactions.css'
import DailyQuote from './DailyQuote.jsx'

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

const localDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}
export const refreshDailyTasks = (tasks, today = localDate()) => tasks.map(task =>
  task.daily && task.dailyDate !== today ? { ...task, done: false, dailyDate: today } : task
)

export function moveTask(tasks, id, quadrant, targetId, position = 'before') {
  const task = tasks.find(t => t.id === id)
  if (!task || id === targetId) return tasks
  const next = tasks.filter(t => t.id !== id)
  let index = next.findIndex(t => t.id === targetId && t.quadrant === quadrant)
  if (index >= 0) index += position === 'after' ? 1 : 0
  else {
    index = next.length
    for (let i = next.length - 1; i >= 0; i--) if (next[i].quadrant === quadrant) { index = i + 1; break }
  }
  next.splice(index, 0, { ...task, quadrant })
  return next
}

function App() {
  const [tasks, setTasks] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('quadrant-tasks')); return refreshDailyTasks(Array.isArray(saved) ? saved : seed) } catch { return seed }
  })
  const [drafts, setDrafts] = useState({})
  const [dragging, setDragging] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editText, setEditText] = useState('')
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('quadrant-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('quadrant-theme', theme)
  }, [theme])
  useEffect(() => {
    const refresh = () => setTasks(prev => {
      const next = refreshDailyTasks(prev)
      return next.some((task, index) => task !== prev[index]) ? next : prev
    })
    const timer = setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  useEffect(() => localStorage.setItem('quadrant-tasks', JSON.stringify(tasks)), [tasks])
  const completed = useMemo(() => tasks.filter(t => t.done).length, [tasks])

  const addTask = (quadrant) => {
    const text = (drafts[quadrant] || '').trim()
    if (!text) return
    setTasks(prev => [...prev, { id: Date.now(), text, quadrant, done: false }])
    setDrafts(prev => ({ ...prev, [quadrant]: '' }))
  }
  const toggle = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const toggleDaily = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, daily: !t.daily, dailyDate: localDate() } : t))
  const remove = id => setTasks(prev => prev.filter(t => t.id !== id))
  const clearQuadrant = quadrant => setTasks(prev => prev.filter(t => t.quadrant !== quadrant))
  const updateTask = (id, changes) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
  const saveEdit = () => {
    if (editText.trim()) updateTask(editing, { text: editText.trim() })
    setEditing(null)
  }
  const drop = (quadrant, target = null) => {
    if (dragging !== null) setTasks(prev => moveTask(prev, dragging, quadrant, target?.id, target?.position))
    setDragging(null)
    setDropTarget(null)
  }

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><div><h1>四象限</h1><p>把时间花在真正重要的事上</p></div></div>
      <div className="header-actions"><div className="summary"><span className="summary-dot" />{completed} / {tasks.length} 已完成</div><button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? '切换夜晚模式' : '切换白天模式'}>{theme === 'light' ? '☾ 夜晚' : '☀ 白天'}</button></div>
    </header>
    <section className="intro"><div><p className="kicker">YOUR FOCUS BOARD</p><h2>今天，先做最重要的事。</h2></div><div className="hint">拖动任务卡片<br /><span>重新安排优先级</span></div></section>
    <DailyQuote />
    <section className="board">
      {QUADRANTS.map(q => <article key={q.id} className={`quadrant ${q.tone} ${dropTarget?.quadrant === q.id ? 'is-droppable' : ''}`} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget({ quadrant: q.id }) }} onDrop={e => { e.preventDefault(); drop(q.id) }}>
        <div className="quadrant-head"><div><p className="eyebrow">{q.eyebrow}</p><h3>{q.title}</h3><p className="description">{q.description}</p></div><div className="quadrant-actions"><span className="count">{tasks.filter(t => t.quadrant === q.id && !t.done).length}</span><button className="clear-quadrant" onClick={() => clearQuadrant(q.id)} disabled={!tasks.some(t => t.quadrant === q.id)} aria-label={`清空${q.title}的全部任务`} title="删除此象限的全部任务">清空</button></div></div>
        <div className="task-list">{tasks.filter(t => t.quadrant === q.id).map(task => <div key={task.id} className={`task ${task.done ? 'done' : ''} ${dragging === task.id ? 'dragging' : ''} ${dropTarget?.id === task.id && dragging !== task.id ? `insert-${dropTarget.position}` : ''}`} draggable={editing !== task.id} onDragStart={e => { e.dataTransfer.setData('text/plain', String(task.id)); e.dataTransfer.effectAllowed = 'move'; setDragging(task.id) }} onDragEnd={() => { setDragging(null); setDropTarget(null) }} onDragOver={e => { e.preventDefault(); e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setDropTarget({ quadrant: q.id, id: task.id, position: e.clientY < rect.top + rect.height / 2 ? 'before' : 'after' }) }} onDrop={e => { e.preventDefault(); e.stopPropagation(); drop(q.id, dropTarget) }}>
          <span className="drag-handle" title="拖动排序">⠿</span><button className="check" onClick={() => toggle(task.id)} aria-label={task.done ? '恢复未完成' : '完成任务'}>{task.done ? '✓' : ''}</button><div className="task-content">{editing === task.id ? <input className="task-editor" autoFocus value={editText} onChange={e => { setEditText(e.target.value); if (e.target.value.trim()) updateTask(task.id, { text: e.target.value }) }} onBlur={saveEdit} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.currentTarget.blur(); if (e.key === 'Escape') e.currentTarget.blur() }} aria-label="编辑任务文字" /> : <button className="task-text edit-trigger" onClick={() => { setEditing(task.id); setEditText(task.text) }} title="点击编辑">{task.text}</button>}<label className="due-date"><span>{task.dueDate ? '截止' : '无截止日期'}</span><input type="date" value={task.dueDate || ''} onChange={e => updateTask(task.id, { dueDate: e.target.value })} aria-label={`${task.text}的截止日期`} /></label></div><button className={`daily-toggle ${task.daily ? 'active' : ''}`} onClick={() => toggleDaily(task.id)} aria-pressed={!!task.daily} title="每日任务：第二天自动恢复未完成">↻ 每日</button><button className="delete" onClick={() => remove(task.id)} aria-label="删除任务">×</button>
        </div>)}</div>
        <div className="add-row"><input value={drafts[q.id] || ''} onChange={e => setDrafts(prev => ({ ...prev, [q.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addTask(q.id)} placeholder="添加一项任务..." /><button onClick={() => addTask(q.id)} aria-label="添加任务">＋</button></div>
      </article>)}
    </section>
    <footer>点击任务的「↻ 每日」开启每日刷新 <span>·</span> 每天零点恢复未完成 <span>·</span> 自动保存在本地</footer>
  </main>
}

export default App
