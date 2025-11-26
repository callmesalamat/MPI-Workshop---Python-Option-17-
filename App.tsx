import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TaskWorkspace from './components/TaskWorkspace';
import { courseModules } from './data/courseContent';
import { Task } from './types';

const App: React.FC = () => {
  // Default to the first task of the first module (MPIBegin3 as requested)
  const [currentTask, setCurrentTask] = useState<Task>(courseModules[0].tasks[0]);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      <Sidebar 
        currentTask={currentTask} 
        onSelectTask={setCurrentTask} 
      />
      <main className="flex-1 h-full relative">
        <TaskWorkspace task={currentTask} />
      </main>
    </div>
  );
};

export default App;