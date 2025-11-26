export interface Task {
  id: string;
  title: string;
  description: string;
  theory: string;
  initialCode: string;
  solutionCode: string;
  processes: number;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  tasks: Task[];
}

export interface SimulationStep {
  rank: number;
  message: string;
  type: 'info' | 'error' | 'success';
}