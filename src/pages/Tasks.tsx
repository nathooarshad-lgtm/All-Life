import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { completionRate } from '../modules/state';
import { generateNatureTasks } from '../modules/tasks';
import { toNumber } from '../modules/utils';

const Tasks: React.FC = () => {
  const { state, dispatch } = useApp();
  const [taskText, setTaskText] = useState('');
  const [taskCategory, setTaskCategory] = useState('health');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskLane, setTaskLane] = useState<'today' | 'this-week' | 'later'>('today');

  const handleAddTask = () => {
    if (!taskText.trim()) return;
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: Date.now(),
        text: taskText.trim(),
        category: taskCategory,
        done: false,
        priority: taskPriority,
        lane: taskLane,
      }
    });
    setTaskText('');
  };

  const handleToggleTask = (id: number) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };

  const handleDeleteTask = (id: number) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const generateSeasonTasks = () => {
    dispatch({ type: 'GENERATE_TASKS', payload: generateNatureTasks() });
  };

  const handleActions = (event: React.MouseEvent<HTMLElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!trigger) return;

    const action = trigger.dataset.action;
    if (action === 'add-task') handleAddTask();
    if (action === 'generate-tasks') generateSeasonTasks();
    if (action === 'toggle-task') handleToggleTask(toNumber(trigger.dataset.id));
    if (action === 'delete-task') handleDeleteTask(toNumber(trigger.dataset.id));
  };

  const totals = {
    today: state.taskList.filter((task) => (task.lane || 'today') === 'today').length,
    thisWeek: state.taskList.filter((task) => (task.lane || 'today') === 'this-week').length,
    later: state.taskList.filter((task) => (task.lane || 'today') === 'later').length,
  };
  const groupedTasks = {
    today: state.taskList.filter((task) => (task.lane || 'today') === 'today'),
    thisWeek: state.taskList.filter((task) => (task.lane || 'today') === 'this-week'),
    later: state.taskList.filter((task) => (task.lane || 'today') === 'later'),
  };
  const laneConfig = [
    { id: 'today', title: 'Today', tasks: groupedTasks.today },
    { id: 'this-week', title: 'This Week', tasks: groupedTasks.thisWeek },
    { id: 'later', title: 'Later', tasks: groupedTasks.later },
  ] as const;
  const openHighPriority = state.taskList.filter((task) => !task.done && (task.priority || 'medium') === 'high').length;
  const doneCount = state.taskList.filter((task) => task.done).length;
  const momentum = completionRate(state);
  const focusQueue = groupedTasks.today
    .filter((task) => !task.done)
    .sort((first, second) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[second.priority || 'medium'] - priorityWeight[first.priority || 'medium'];
    })
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto" onClick={handleActions}>
      <h2 className="text-2xl font-bold mb-2">Execution Planner</h2>
      <p className="season-description mb-6">Task lanes, priorities, focus queue, and momentum scoring like a dedicated planner app.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-4 rounded-lg border"><p className="season-description text-xs">Today</p><p className="text-2xl font-bold">{totals.today}</p></div>
        <div className="nature-card p-4 rounded-lg border"><p className="season-description text-xs">This Week</p><p className="text-2xl font-bold">{totals.thisWeek}</p></div>
        <div className="nature-card p-4 rounded-lg border"><p className="season-description text-xs">Later</p><p className="text-2xl font-bold">{totals.later}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Momentum</p>
          <p className="text-2xl font-bold mt-1">{momentum}%</p>
          <p className="text-sm mt-2">Completion rate across the current board.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">High Priority Open</p>
          <p className="text-2xl font-bold mt-1">{openHighPriority}</p>
          <p className="text-sm mt-2">These are the cards most likely to block progress.</p>
        </div>
        <div className="nature-card p-5 rounded-lg border">
          <p className="season-description text-xs">Completed</p>
          <p className="text-2xl font-bold mt-1">{doneCount}</p>
          <p className="text-sm mt-2">Closed loops that have already converted into momentum.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="nature-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-1">✨ Create Task Card</h3>
          <p className="season-description text-sm mb-4">Add a new task and choose its lane and priority level.</p>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">What's the task?</label>
            <input
              type="text"
              placeholder="e.g. Complete quarterly review"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs season-description mt-1">💡 Be specific and actionable</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">📂 Category</label>
            <select
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="health">💪 Health</option>
              <option value="work">💼 Work</option>
              <option value="study">📚 Study</option>
              <option value="personal">🎨 Personal</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">⚡ Priority</label>
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as typeof taskPriority)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">🔴 High (urgent or blocks others)</option>
              <option value="medium">🟡 Medium (important but not urgent)</option>
              <option value="low">🟢 Low (nice to have)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">📅 When?</label>
            <select
              value={taskLane}
              onChange={(e) => setTaskLane(e.target.value as typeof taskLane)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">📍 Today (do this today)</option>
              <option value="this-week">📌 This Week (coming up)</option>
              <option value="later">🗓️ Later (backlog)</option>
            </select>
          </div>

          <button
            data-action="add-task"
            className="w-full nature-button font-semibold py-3 rounded-lg transition-colors hover:opacity-80 mb-3"
          >
            ✓ Add Task
          </button>
          <button
            data-action="generate-tasks"
            className="w-full nature-button font-semibold py-3 rounded-lg transition-colors hover:opacity-80"
          >
            🤖 Generate Weekly Tasks
          </button>
        </div>

        <div className="nature-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-1">🎯 Focus Queue</h3>
          <p className="season-description text-sm mb-4">Top 3 items to tackle today, sorted by priority.</p>
          <div className="space-y-3">
            {focusQueue.map((task, index) => (
              <div key={task.id} className={`nature-card p-3 rounded-lg border-l-4 ${
                task.priority === 'high' ? 'border-l-red-500' : 
                task.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
              }`}>
                <p className="font-semibold">#{index + 1} {task.text}</p>
                <p className="season-description text-xs mt-1">{task.category} • {task.priority || 'medium'} priority</p>
              </div>
            ))}
            {focusQueue.length === 0 && <p className="season-description text-sm">No open items for today. Plan your day to build the focus list.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {laneConfig.map((lane) => (
          <div key={lane.id} className="nature-card rounded-lg border overflow-hidden">
            <div className="p-4 border-b border-slate-600 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{lane.title}</h3>
              <span className="season-description text-xs">{lane.tasks.length} cards</span>
            </div>
            <ul className="divide-y divide-slate-600">
              {lane.tasks.map((task) => (
                <li key={task.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.done}
                        data-action="toggle-task"
                        data-id={String(task.id)}
                        onChange={() => handleToggleTask(task.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className={task.done ? 'line-through text-slate-500' : 'font-semibold'}>{task.text}</p>
                        <p className="season-description text-xs mt-1">{task.category} • {task.priority || 'medium'} priority</p>
                      </div>
                    </div>
                    <button
                      data-action="delete-task"
                      data-id={String(task.id)}
                      className="nature-button text-white px-3 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {lane.tasks.length === 0 && <li className="p-4 season-description">No cards in this lane yet.</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;