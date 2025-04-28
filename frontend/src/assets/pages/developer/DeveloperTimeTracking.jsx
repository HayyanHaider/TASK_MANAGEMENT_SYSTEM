import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import "../../../styles/DeveloperTimeTracking.css"

export default function DeveloperTimeTracking() {
  const { taskId } = useParams()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  // load all entries
  const load = () => {
    if (!taskId || isNaN(taskId)) return
    setLoading(true)
    axios.get(`http://localhost:3001/developer/tasks/${taskId}/time`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setEntries(res.data))
    .catch(err => console.error('Error loading time entries', err))
    .finally(() => setLoading(false))
  }

  // start timer
  const start = () => {
    axios.post(`http://localhost:3001/developer/tasks/${taskId}/time`,
      { action: 'start' },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(load)
    .catch(err => console.error(err))
  }

  // stop timer
  const stop = () => {
    axios.post(`http://localhost:3001/developer/tasks/${taskId}/time`,
      { action: 'stop' },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(load)
    .catch(err => console.error(err))
  }

  // clear all entries
  const clearAll = () => {
    if (!window.confirm('Erase all time entries for this task?')) return
    axios.delete(`http://localhost:3001/developer/tasks/${taskId}/time`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(load)
    .catch(err => console.error(err))
  }

  useEffect(load, [taskId])

  if (!taskId || isNaN(taskId)) {
    return <div className="developer-time-tracking"><div className="developer-time-tracking-container developer-time-tracking-error">Invalid task ID</div></div>
  }
  if (loading) return <div className="developer-time-tracking"><div className="developer-time-tracking-container">Loading time tracking…</div></div>

  // check if there's an entry without end_time
  const running = entries.find(e => e.end_time === null || !e.end_time)

  return (
    <div className="developer-time-tracking">
      <div className="developer-time-tracking-container">
        <h2 className="developer-time-tracking-title">Time Tracking</h2>
        
        <div className="developer-time-tracking-form">
          {running ? (
            <button className="developer-time-tracking-button" onClick={stop}>Stop Timer</button>
          ) : (
            <button className="developer-time-tracking-button" onClick={start}>Start Timer</button>
          )}
          <button className="developer-time-tracking-button" onClick={clearAll}>Clear All</button>
        </div>

        <div className="developer-time-tracking-list">
          {entries.length > 0 ? (
            entries.map(e => (
              <div key={e.time_entry_id} className="developer-time-tracking-item">
                <div className="developer-time-tracking-date">
                  {new Date(e.start_time).toLocaleString()} → 
                  {e.end_time
                    ? ` ${new Date(e.end_time).toLocaleString()}`
                    : ' Ongoing'
                  }
                </div>
                <div className="developer-time-tracking-hours">
                  <strong>Duration:</strong> {e.total_time != null ? `${e.total_time} mins` : 'In Progress'}
                </div>
              </div>
            ))
          ) : (
            <p className="developer-time-tracking-text">No time entries yet.</p>
          )}
        </div>

        <button
          className="developer-time-tracking-button"
          onClick={() => navigate(-1)}
        >
          Go Back to Task
        </button>
      </div>
    </div>
  )
}
