import React from 'react';
import { courseModules } from '../data/courseContent';
import { Module, Task } from '../types';
import { BookOpen, Code, Terminal, ChevronRight, Layers } from 'lucide-react';

interface SidebarProps {
  currentTask: Task | null;
  onSelectTask: (task: Task) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTask, onSelectTask }) => {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 bg-slate-950">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="text-blue-500" />
          MPI Практикум
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-mono">Вариант 17 • Python</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        {courseModules.map((module) => (
          <div key={module.id} className="mb-6 px-4">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
              <Layers size={14} />
              {module.title}
            </h2>
            <div className="space-y-1">
              {module.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between group ${
                    currentTask?.id === task.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Code size={14} className={currentTask?.id === task.id ? 'text-blue-200' : 'text-slate-500 group-hover:text-blue-400'} />
                    {task.id}
                  </span>
                  {currentTask?.id === task.id && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-500">
        Основано на задачнике Абрамяна <br/>
        <span className="text-slate-600">Модули 1-5 реализованы</span>
      </div>
    </div>
  );
};

export default Sidebar;