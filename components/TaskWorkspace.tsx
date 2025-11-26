import React, { useState, useEffect, useRef } from 'react';
import { Task, SimulationStep } from '../types';
import CodeEditor from './CodeEditor';
import { runSimulation } from '../services/mpiSimulator';
import { Play, RotateCcw, CheckCircle, BookOpen, Monitor, Lightbulb, Terminal } from 'lucide-react';

interface TaskWorkspaceProps {
  task: Task;
}

const TaskWorkspace: React.FC<TaskWorkspaceProps> = ({ task }) => {
  const [code, setCode] = useState(task.solutionCode); // Изначально показываем решение
  const [logs, setLogs] = useState<SimulationStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'theory'>('desc');
  
  // Состояния для интерактивного ввода
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputResolverRef = useRef<((value: string) => void) | null>(null);

  useEffect(() => {
    // При смене задачи сбрасываем состояние и ставим код решения
    setCode(task.solutionCode);
    setLogs([]);
    setIsRunning(false);
    setIsWaitingForInput(false);
    inputResolverRef.current = null;
  }, [task]);

  const handleInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputResolverRef.current) {
      // Добавляем лог с введенным значением, чтобы было видно в истории
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
    
    // Функция обратного вызова для запроса ввода
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
      setLogs(prev => [...prev, { rank: -1, message: "Ошибка выполнения симуляции", type: 'error' }]);
    } finally {
      setIsRunning(false);
      setIsWaitingForInput(false);
    }
  };

  const handleReset = () => {
    setCode(task.solutionCode); // Сброс на решение
    setLogs([]);
    setIsRunning(false);
    setIsWaitingForInput(false);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row bg-gray-100 overflow-hidden">
      {/* LEFT PANEL: INFO */}
      <div className="w-full lg:w-5/12 flex flex-col border-r border-gray-200 bg-white">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'desc' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen size={16} />
            Условие задачи
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 prose prose-slate max-w-none">
          {activeTab === 'desc' ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{task.title}</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-sm text-yellow-800 flex items-start gap-3">
                 <Lightbulb size={20} className="mt-0.5 flex-shrink-0" />
                 <div>
                    <strong>Требуемое кол-во процессов:</strong> {task.processes} (Вариант 17)
                 </div>
              </div>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{task.description}</p>
              
              <h3 className="font-bold text-gray-800 mt-6 mb-2">Задачи:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Инициализировать среду MPI.</li>
                <li>Реализовать логику в зависимости от ранга процесса.</li>
                <li>Обеспечить корректный вывод данных.</li>
              </ul>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Теоретическая справка</h2>
              <div className="whitespace-pre-wrap text-gray-600 leading-relaxed text-sm">
                {task.theory.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-sm text-gray-900 mb-2">Шпаргалка Python MPI</h4>
                <code className="block text-xs font-mono bg-white p-2 border border-gray-200 rounded text-pink-600">
                  comm = MPI.COMM_WORLD<br/>
                  rank = comm.Get_rank()<br/>
                  size = comm.Get_size()<br/>
                  comm.send(data, dest=x)<br/>
                  data = comm.recv(source=y)
                </code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: EDITOR & CONSOLE */}
      <div className="w-full lg:w-7/12 flex flex-col h-full bg-gray-50">
        {/* Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase">main.py</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">Python 3.8+</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-1 transition-colors"
                >
                    <RotateCcw size={14} /> Сброс кода
                </button>
                <button 
                    onClick={handleRun}
                    disabled={isRunning && !isWaitingForInput}
                    className={`px-4 py-1.5 text-xs font-bold text-white rounded-md flex items-center gap-2 shadow-sm transition-all ${
                        isRunning && !isWaitingForInput 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                    }`}
                >
                    {isRunning ? (isWaitingForInput ? 'Ожидание ввода...' : 'Запуск...') : <><Play size={14} /> Запустить</>}
                </button>
            </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-1">
            <CodeEditor code={code} onChange={setCode} />
        </div>

        {/* Console/Output Area */}
        <div className="h-1/3 bg-slate-950 border-t border-slate-800 flex flex-col relative">
            <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
                <Monitor size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Консоль вывода</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 relative">
                {logs.length === 0 && !isRunning && (
                    <div className="text-slate-600 italic">Готов к запуску. Нажмите 'Запустить' для симуляции MPI среды.</div>
                )}
                
                {logs.map((log, idx) => (
                    <div key={idx} className={`flex gap-3 ${
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'info' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                        <span className="text-slate-600 select-none w-16 text-right shrink-0">
                            {log.rank === -1 ? '[SYS]' : `[P${log.rank}]`}
                        </span>
                        <span>{log.message}</span>
                    </div>
                ))}
                
                {isRunning && !isWaitingForInput && (
                    <div className="text-slate-500 animate-pulse mt-2 ml-20">Обработка...</div>
                )}
                
                {/* Input Prompt Overlay in Console */}
                {isWaitingForInput && (
                   <div className="mt-2 ml-19 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                          className="bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded w-64 focus:outline-none focus:border-blue-500 text-sm"
                          placeholder="Введите значение..."
                        />
                        <button 
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold"
                        >
                          Enter
                        </button>
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