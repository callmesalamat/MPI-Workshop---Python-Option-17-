import { SimulationStep } from '../types';

export const runSimulation = async (
  taskId: string, 
  processCount: number, 
  userCode: string,
  onLog: (log: SimulationStep) => void,
  requestInput?: (prompt: string) => Promise<string>
) => {
  // Clear logs
  
  onLog({ rank: -1, message: "Инициализация среды MPI...", type: 'info' });
  await new Promise(r => setTimeout(r, 600));
  onLog({ rank: -1, message: `MPI_COMM_WORLD размер: ${processCount}`, type: 'info' });
  await new Promise(r => setTimeout(r, 400));

  const steps: SimulationStep[] = [];

  switch (taskId) {
    case 'MPIBegin3':
      for (let i = 0; i < processCount; i++) {
        if (i % 2 === 0) {
          const val = 10 + i;
          steps.push({ rank: i, message: `Ввод: ${val} (Int). Результат: ${val * 2}`, type: 'success' });
        } else {
          const val = 5.5 + i;
          steps.push({ rank: i, message: `Ввод: ${val} (Float). Результат: ${(val * 2.0).toFixed(1)}`, type: 'success' });
        }
      }
      break;

    case 'MPIBegin6':
      for(let i=0; i<processCount; i++) {
          if(i === 0) steps.push({ rank: 0, message: `Произведение [2,3,4] = 24`, type: 'success' });
          else if(i % 2 === 0) steps.push({ rank: i, message: `Сумма [2,3,4] = 9`, type: 'success' });
          else steps.push({ rank: i, message: `Среднее [2,3,4] = 3.0`, type: 'success' });
      }
      break;

    case 'MPIBegin8':
      for (let i = 1; i < processCount; i++) {
        const val = i * 10.5;
        steps.push({ rank: i, message: `Отправка ${val} -> Ранг 0`, type: 'info' });
      }
      steps.push({ rank: 0, message: `Получены все числа. Сортировка по убыванию ранга...`, type: 'success' });
      for (let i = processCount - 1; i > 0; i--) {
        const val = i * 10.5;
        steps.push({ rank: 0, message: `Результат от ${i}: ${val}`, type: 'success' });
      }
      break;

    case 'MPIBegin12':
       for(let i=0; i<processCount-1; i++) {
           const dest = processCount - 1 - i;
           steps.push({ rank: 0, message: `Отправка -> Ранг ${dest}`, type: 'info' });
           steps.push({ rank: dest, message: `Получено сообщение`, type: 'success' });
       }
       break;

    case 'MPIBegin16':
       steps.push({ rank: 0, message: "Главный ждет 2 сообщения (K=2)...", type: 'info' });
       steps.push({ rank: 2, message: "Отправка массива [1,1,1] -> 0", type: 'info' });
       steps.push({ rank: 4, message: "Отправка массива [1,1,1] -> 0", type: 'info' });
       steps.push({ rank: 0, message: "Сумма получена: 6", type: 'success' });
       break;

    case 'MPIBegin19':
       for(let i=0; i<processCount; i++) {
           const from = (i + 1) % processCount;
           steps.push({ rank: i, message: `Сдвиг: принято от ${from}`, type: 'success' });
       }
       break;
    
    case 'MPIBegin22':
        // Интерактивная логика
        if (requestInput) {
            // Эмуляция ввода K в главном процессе (хотя в MPI K задается при запуске, тут по запросу пользователя)
            // Но мы используем processCount как константу окружения.
            // Запросим "special" ранг
            onLog({ rank: 0, message: "Ожидание ввода 'special' ранга...", type: 'info' });
            const specialStr = await requestInput("Введите ранг процесса, где N=1 (0-" + (processCount-1) + "):");
            const special = parseInt(specialStr) || 0;

            if (special < 0 || special >= processCount) {
                onLog({ rank: 0, message: `Ошибка: Ранг ${special} вне диапазона!`, type: 'error' });
                return;
            }

            // Запрашиваем числа для отправки
            const nums: number[] = [];
            for(let i=0; i<processCount-1; i++) {
                 const numStr = await requestInput(`Введите число для отправки ${i+1}:`);
                 nums.push(parseFloat(numStr) || 0);
            }

            onLog({ rank: special, message: `Я особый процесс. Начинаю рассылку: [${nums.join(', ')}]`, type: 'info' });

            let idx = 0;
            for(let i=0; i<processCount; i++) {
                if(i !== special) {
                    onLog({ rank: special, message: `Отправка ${nums[idx]} -> Процесс ${i}`, type: 'info' });
                    steps.push({ rank: i, message: `Получено число: ${nums[idx]}`, type: 'success' });
                    idx++;
                }
            }
        } else {
             // Fallback если input не передан (например старая версия)
             steps.push({ rank: 2, message: "Я отправитель (N=1). Рассылаю данные...", type: 'info' });
             for(let i=0; i<processCount; i++) {
                 if (i!==2) steps.push({ rank: i, message: "Получено число от 2", type: 'success' });
             }
        }
        break;

    case 'MPIBegin26':
       for(let i=1; i<processCount; i++) {
           steps.push({ rank: i, message: `Send Val=${i*1.1} Tag=${processCount-i}`, type: 'info' });
       }
       steps.push({ rank: 0, message: `Принято и отсортировано по тегам`, type: 'success' });
       break;

    case 'MPIBegin32':
        steps.push({ rank: 0, message: "Gather: Данные собраны в массив.", type: 'success' });
        break;
    
    case 'MPIBegin36':
        for(let i=0; i<processCount; i++) {
            steps.push({ rank: i, message: "Scatter: Получены 3 числа.", type: 'success' });
        }
        break;

    case 'MPIBegin40':
        for(let i=0; i<processCount; i++) {
            steps.push({ rank: i, message: "Allgather: Вижу данные всех процессов.", type: 'success' });
        }
        break;

    case 'MPIBegin49':
      steps.push({ rank: 0, message: "Reduce MIN: [1, 1, 1]", type: 'success' });
      break;

    case 'MPIBegin55':
      for(let i=0; i<processCount; i++) {
          steps.push({ rank: i, message: "Reduce_scatter: Получен минимум своей части.", type: 'success' });
      }
      break;

    case 'MPIBegin60':
    case 'MPIBegin61':
    case 'MPIBegin65':
    case 'MPIBegin66':
    case 'MPIBegin69':
      steps.push({ rank: 0, message: "Структуры/типы данных успешно приняты.", type: 'success' });
      break;

    case 'MPIBegin71':
      for(let i=0; i<processCount; i++) {
          if(i%2 === 0) steps.push({ rank: i, message: "В группе 'Четные'", type: 'success' });
      }
      break;
    
    case 'MPIBegin76':
        steps.push({ rank: 0, message: "Создан коммуникатор (0 + нечетные). Bcast прошел.", type: 'success' });
        for(let i=1; i<processCount; i+=2) steps.push({ rank: i, message: "Получено от 0 через новый comm", type: 'success' });
        break;

    case 'MPIBegin83':
        for(let r=0; r<processCount; r++) {
            steps.push({ rank: r, message: `Cart Coords: (${Math.floor(r/3)}, ${r%3})`, type: 'success' });
        }
        break;
        
    case 'MPIBegin86':
        steps.push({ rank: 0, message: "Sub-comm (столбец 0): Bcast выполнен.", type: 'success' });
        steps.push({ rank: 1, message: "Sub-comm (столбец 1): Bcast выполнен.", type: 'success' });
        break;

    case 'MPIBegin98':
        steps.push({ rank: 0, message: "Центр звезды. Рассылка...", type: 'success' });
        for(let i=1; i<processCount; i++) {
            steps.push({ rank: i, message: "Получено от центра", type: 'success' });
        }
        break;

    default:
      steps.push({ rank: 0, message: "Симуляция выполнения задачи завершена успешно.", type: 'success' });
      for(let i=1; i<processCount; i++) {
           steps.push({ rank: i, message: "Работа завершена.", type: 'info' });
      }
  }

  // Execute steps with delay
  for (const step of steps) {
    await new Promise(r => setTimeout(r, Math.random() * 500 + 200));
    onLog(step);
  }

  await new Promise(r => setTimeout(r, 200));
  onLog({ rank: -1, message: "Программа завершена (MPI_Finalize).", type: 'info' });
};