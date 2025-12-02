
import React, { useState, useEffect, useRef } from 'react';
import { Task, SimulationStep } from '../types';
import CodeEditor from './CodeEditor';
import { runSimulation } from '../services/mpiSimulator';
import { Play, RotateCcw, CheckCircle, BookOpen, Monitor, Lightbulb, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TaskWorkspaceProps {
  task: Task;
}

const TaskWorkspace: React.FC<TaskWorkspaceProps> = ({ task }) => {
  const [code, setCode] = useState(task.solutionCode);
  const [logs, setLogs] = useState<SimulationStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'theory'>('desc');
  
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputResolverRef = useRef<((value: string) => void) | null>(null);

  useEffect(() => {
    setCode(task.solutionCode);
    setLogs([]);
    setIsRunning(false);
    setIsWaitingForInput(false);
    inputResolverRef.current = null;
  }, [task]);

  const handleInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputResolverRef.current) {
      setLogs(prev => [...prev, { rank: -1, message: `${inputPrompt} ${inputValue}`, type: 'info' }]);
      inputResolverRef.current(inputValue);
      inputResolverRef.current = null;
      setIsWaitingForInput(false);
      setInputValue('');
      setInputPrompt('');
    }
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    
    const requestInput = (prompt: string): Promise<string> => {
      return new Promise((resolve) => {
        setInputPrompt(prompt);
        setIsWaitingForInput(true);
        inputResolverRef.current = resolve;
      });
    };
    
    try {
      await runSimulation(task.id, task.processes, code, (log) => {
        setLogs(prev => [...prev, log]);
      }, requestInput);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, { rank: -1, message: "Ошибка", type: 'error' }]);
    } finally {
      setIsRunning(false);
      setIsWaitingForInput(false);
    }
  };

  const handleReset = () => {
    setCode(task.solutionCode);
    setLogs([]);
    setIsRunning(false);
    setIsWaitingForInput(false);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row bg-gray-100 overflow-hidden">
      <div className="w-full lg:w-5/12 flex flex-col border-r border-gray-200 bg-white">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'desc' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen size={16} />
            Задача
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'theory' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle size={16} />
            Теория
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 prose prose-slate prose-sm max-w-none">
          {activeTab === 'desc' ? (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 mt-0">{task.title}</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-yellow-800 flex items-center gap-3 not-prose">
                 <Lightbulb size={18} />
                 <span className="font-medium">Процессов: {task.processes}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 mt-0">Справка</h2>
              <ReactMarkdown 
                components={{
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 text-gray-700" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                  code: ({node, ...props}) => <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                }}
              >
                {task.theory}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-7/12 flex flex-col h-full bg-gray-50">
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-400">MAIN.PY</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleReset} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded flex gap-1">
                    <RotateCcw size={14} /> Сброс
                </button>
                <button 
                    onClick={handleRun}
                    disabled={isRunning && !isWaitingForInput}
                    className={`px-4 py-1.5 text-xs font-bold text-white rounded flex gap-2 ${
                        isRunning && !isWaitingForInput ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isRunning ? (isWaitingForInput ? 'Ввод...' : 'Запуск...') : <><Play size={14} /> Старт</>}
                </button>
            </div>
        </div>

        <div className="flex-1 p-1">
            <CodeEditor code={code} onChange={setCode} />
        </div>

        <div className="h-1/3 bg-slate-950 border-t border-slate-800 flex flex-col relative">
            <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
                <Monitor size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-400">TERMINAL</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
                {logs.length === 0 && !isRunning && (
                    <div className="text-slate-600 italic">Нажмите Старт для запуска симуляции...</div>
                )}
                {logs.map((log, idx) => (
                    <div key={idx} className={`flex gap-3 ${
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'info' ? 'text-blue-300' : 'text-green-400'
                    }`}>
                        <span className="text-slate-600 w-12 text-right shrink-0">
                            {log.rank === -1 ? '>' : `P${log.rank}`}
                        </span>
                        <span>{log.message}</span>
                    </div>
                ))}
                {isWaitingForInput && (
                   <div className="mt-2 ml-16 flex flex-col gap-1 animate-in fade-in">
                      <div className="flex items-center gap-2 text-yellow-400">
                         <Terminal size={14} />
                         <span>{inputPrompt}</span>
                      </div>
                      <form onSubmit={handleInputSubmit} className="flex gap-2">
                        <input 
                          autoFocus
                          type="text" 
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded w-64 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500">Enter</button>
                      </form>
                   </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaskWorkspace;
