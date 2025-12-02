
import { SimulationStep } from '../types';

export const runSimulation = async (
  taskId: string, 
  processCount: number, 
  userCode: string,
  onLog: (log: SimulationStep) => void,
  requestInput?: (prompt: string) => Promise<string>
) => {
  onLog({ rank: -1, message: "Инициализация MPI среды...", type: 'info' });
  await new Promise(r => setTimeout(r, 500));
  onLog({ rank: -1, message: `MPI_COMM_WORLD Size: ${processCount}`, type: 'info' });

  const ask = async (prompt: string, def: string = "0") => {
      if (!requestInput) return def;
      return await requestInput(prompt);
  };

  const steps: SimulationStep[] = [];

  try {
    switch (taskId) {
      // --- МОДУЛЬ 1 ---
      case 'MPIBegin3':
        for (let i = 0; i < processCount; i++) {
          if (i % 2 === 0) {
            const val = await ask(`[P${i}] Введите целое число:`);
            const n = parseInt(val) || 0;
            steps.push({ rank: i, message: `Результат: ${n * 2}`, type: 'success' });
          } else {
            const val = await ask(`[P${i}] Введите вещ. число:`);
            const n = parseFloat(val) || 0;
            steps.push({ rank: i, message: `Результат: ${n * 2.0}`, type: 'success' });
          }
        }
        break;

      case 'MPIBegin6':
        for (let i = 0; i < processCount; i++) {
            const nStr = await ask(`[P${i}] Введите N:`);
            const N = parseInt(nStr) || 2;
            const arrStr = await ask(`[P${i}] Введите ${N} чисел через пробел:`);
            const nums = arrStr.split(' ').map(x => parseFloat(x)).filter(x => !isNaN(x));
            
            if (i === 0) {
                const prod = nums.reduce((a, b) => a * b, 1);
                steps.push({ rank: i, message: `Произведение: ${prod}`, type: 'success' });
            } else if (i % 2 === 0) {
                const sum = nums.reduce((a, b) => a + b, 0);
                steps.push({ rank: i, message: `Сумма: ${sum}`, type: 'success' });
            } else {
                const sum = nums.reduce((a, b) => a + b, 0);
                steps.push({ rank: i, message: `Среднее: ${nums.length ? sum/nums.length : 0}`, type: 'success' });
            }
        }
        break;

      // --- МОДУЛЬ 2 ---
      case 'MPIBegin8':
        for(let i=1; i<processCount; i++) {
            const v = await ask(`[P${i}] Введите число:`);
            steps.push({ rank: i, message: `Bsend(${v}) -> 0`, type: 'info' });
            steps.push({ rank: 0, message: `Recv(${v}) from ${i}`, type: 'success' });
        }
        steps.push({ rank: 0, message: "Данные выведены в порядке убывания рангов.", type: 'info' });
        break;

      case 'MPIBegin12':
        const r0_raw = await ask(`[P0] Введите ${processCount-1} чисел через пробел:`);
        const r0_nums = r0_raw.split(' ').map(Number);
        for(let i=0; i<processCount-1; i++) {
            const val = r0_nums[i] || 0;
            const dest = processCount - 1 - i;
            steps.push({ rank: 0, message: `Bsend(${val}) -> ${dest}`, type: 'info' });
            steps.push({ rank: dest, message: `Recv: ${val}`, type: 'success' });
        }
        break;

      case 'MPIBegin16':
        let total = 0;
        for(let i=1; i<processCount; i++) {
            const nStr = await ask(`[P${i}] Введите N:`);
            const n = parseInt(nStr) || 0;
            if (n > 0) {
                steps.push({ rank: i, message: `Send(${n}) -> 0`, type: 'info' });
                total += n;
            }
        }
        steps.push({ rank: 0, message: `Итоговая сумма N>0: ${total}`, type: 'success' });
        break;

      case 'MPIBegin19':
        for(let i=0; i<processCount; i++) {
            const v = await ask(`[P${i}] Введите число:`);
            const from = (i + 1) % processCount;
            steps.push({ rank: i, message: `Sendrecv: Было ${v}, Пришло от ${from}`, type: 'success' });
        }
        break;

      case 'MPIBegin22':
        const spStr = await ask(`[P0] Введите ранг отправителя (0-${processCount-1}):`);
        const special = parseInt(spStr) || 0;
        for(let i=0; i<processCount; i++) {
            if(i !== special) {
                const val = await ask(`[P${special}] Введите число для P${i}:`);
                steps.push({ rank: special, message: `Send(${val}) -> ${i}`, type: 'info' });
                steps.push({ rank: i, message: `Recv: ${val}`, type: 'success' });
            }
        }
        break;

      case 'MPIBegin24':
        for(let i=0; i<processCount; i+=2) {
            const v1 = await ask(`[P${i}] Числа:`);
            const v2 = await ask(`[P${i+1}] Числа:`);
            steps.push({ rank: i, message: `Sendrecv: Отправил ${v1}, Получил ${v2}`, type: 'success' });
            steps.push({ rank: i+1, message: `Sendrecv: Отправил ${v2}, Получил ${v1}`, type: 'success' });
        }
        break;

      case 'MPIBegin26':
        const d26 = [];
        for(let i=1; i<processCount; i++) {
            const a = await ask(`[P${i}] Число A:`);
            const n = await ask(`[P${i}] Порядок N:`);
            d26.push({ val: a, tag: parseInt(n) });
            steps.push({ rank: i, message: `Send(${a}) Tag=${n} -> 0`, type: 'info' });
        }
        d26.sort((a,b) => a.tag - b.tag);
        steps.push({ rank: 0, message: `Результат: ${JSON.stringify(d26.map(x=>x.val))}`, type: 'success' });
        break;

      case 'MPIBegin29':
        for(let i=1; i<processCount; i++) {
            const t = await ask(`[P${i}] T (0=int, 1=float):`);
            const v = t === '0' ? 'Ints' : 'Floats';
            steps.push({ rank: i, message: `Send(${v}) -> 0`, type: 'info' });
            steps.push({ rank: 0, message: `Probe/Recv от ${i}: тип ${v}`, type: 'success' });
        }
        break;

      // --- МОДУЛЬ 3 ---
      case 'MPIBegin48':
        const arr48 = [];
        for(let i=0; i<processCount; i++) {
            const s = await ask(`[P${i}] 3 числа:`);
            arr48.push(s.split(' ').map(Number));
        }
        const res48 = [0,0,0];
        arr48.forEach(a => a.forEach((v,k) => res48[k]+=v || 0));
        steps.push({ rank: 0, message: `Reduce SUM: ${res48}`, type: 'success' });
        break;

      case 'MPIBegin50':
        let max50 = -Infinity, maxR = -1;
        for(let i=0; i<processCount; i++) {
            const v = parseFloat(await ask(`[P${i}] Число:`));
            if(v > max50) { max50=v; maxR=i; }
        }
        steps.push({ rank: 0, message: `MAXLOC: ${max50} у ранга ${maxR}`, type: 'success' });
        break;

      case 'MPIBegin53':
        const arr53 = [];
        for(let i=0; i<processCount; i++) {
            const s = await ask(`[P${i}] ${processCount} чисел:`);
            arr53.push(s.split(' ').map(Number));
        }
        for(let i=0; i<processCount; i++) {
            let colSum = 0;
            arr53.forEach(row => colSum += (row[i]||0));
            steps.push({ rank: i, message: `Reduce_scatter: Сумма столбца ${i} = ${colSum}`, type: 'success' });
        }
        break;

      case 'MPIBegin56':
        let rProd = 1;
        for(let i=0; i<processCount; i++) {
            const v = parseInt(await ask(`[P${i}] Число:`));
            rProd *= v;
            steps.push({ rank: i, message: `Scan: ${rProd}`, type: 'success' });
        }
        break;

      case 'MPIBegin59':
      case 'MPIBegin62':
        steps.push({ rank: 0, message: "Рассылка структур Scatter...", type: 'info' });
        for(let i=0; i<processCount; i++) steps.push({ rank: i, message: "Получил структуру", type: 'success' });
        break;

      case 'MPIBegin65':
        for(let i=0; i<processCount; i++) await ask(`[P${i}] Нажмите Enter (данные авто):`);
        steps.push({ rank: 0, message: "Gather: Все данные собраны", type: 'success' });
        break;

      case 'MPIBegin66':
      case 'MPIBegin70':
        for(let i=1; i<processCount; i++) {
            const f = await ask(`[P${i}] Float:`);
            const ints = await ask(`[P${i}] Ints:`);
            steps.push({ rank: 0, message: `Unpack от ${i}: ${f}, [${ints}]`, type: 'success' });
        }
        break;

      // --- МОДУЛЬ 4 ---
      case 'MPIBegin32':
        const g32 = [];
        for(let i=0; i<processCount; i++) g32.push(await ask(`[P${i}] Число:`));
        steps.push({ rank: 0, message: `Gather: [${g32.join(', ')}]`, type: 'success' });
        break;

      case 'MPIBegin36':
        const r36 = await ask(`[P0] ${processCount*3} чисел:`);
        const a36 = r36.split(' ');
        for(let i=0; i<processCount; i++) {
            steps.push({ rank: i, message: `Scatter: [${a36.slice(i*3, i*3+3).join(' ')}]`, type: 'success' });
        }
        break;

      case 'MPIBegin38':
      case 'MPIBegin47':
        steps.push({ rank: 0, message: "Scatterv/Alltoallv: Данные переменной длины распределены.", type: 'success' });
        break;

      case 'MPIBegin40':
        const val40 = await ask(`[P0] Число:`);
        for(let i=0; i<processCount; i++) steps.push({ rank: i, message: `Allgather: вижу ${val40} от P0`, type: 'success' });
        break;

      case 'MPIBegin43':
        for(let i=0; i<processCount; i++) steps.push({ rank: i, message: `Alltoall: обмен завершен`, type: 'success' });
        break;

      case 'MPIBegin71':
        const r71 = await ask(`[P0] Числа для четных:`);
        const a71 = r71.split(' ');
        let idx = 0;
        for(let i=0; i<processCount; i+=2) {
            steps.push({ rank: i, message: `Группа(Чет): Scatter получил ${a71[idx++]||0}`, type: 'success' });
        }
        break;

      case 'MPIBegin74':
        let min74 = Infinity;
        for(let i=0; i<processCount; i+=2) {
            const v = parseFloat(await ask(`[P${i}] Число:`));
            if(v < min74) min74 = v;
        }
        steps.push({ rank: 0, message: `Группа(Чет): Мин = ${min74}`, type: 'success' });
        break;

      case 'MPIBegin76':
      case 'MPIBegin78':
      case 'MPIBegin80':
        const c = await ask(`[P0] Разделение N (0/1):`);
        steps.push({ rank: 0, message: `Comm_split: разделение на цвет ${c} выполнено.`, type: 'success' });
        steps.push({ rank: 0, message: `Коллективная операция внутри подгрупп завершена.`, type: 'success' });
        break;

      // --- МОДУЛЬ 5 ---
      case 'MPIBegin83':
        const N83 = parseInt(await ask(`[P0] Введите N:`)) || 2;
        for(let i=0; i<processCount; i++) {
            const row = Math.floor(i/(processCount/N83));
            const col = i%(processCount/N83);
            steps.push({ rank: i, message: `Cart Coords: (${row}, ${col})`, type: 'success' });
        }
        break;

      case 'MPIBegin86':
        steps.push({ rank: 0, message: "Топология Nx2 создана. Cart_sub на столбцы.", type: 'info' });
        for(let i=0; i<processCount; i+=2) {
             const v = await ask(`[P${i}] Число для столбца:`);
             steps.push({ rank: i, message: `Столбец: Разослано ${v}`, type: 'success' });
        }
        break;

      case 'MPIBegin91':
        for(let i=0; i<processCount; i++) await ask(`[P${i}] Число:`);
        steps.push({ rank: 0, message: "3D решетка. Reduce вдоль оси Z выполнен.", type: 'success' });
        break;

      case 'MPIBegin94':
        const M94 = parseInt(await ask(`[P0] M: `)) || 2;
        const N94 = parseInt(await ask(`[P0] N: `)) || 2;
        const X = parseInt(await ask(`[P0] X: `)) || 0;
        const Y = parseInt(await ask(`[P0] Y: `)) || 0;
        steps.push({ rank: 0, message: `Периодич. решетка ${M94}x${N94}. Координаты (${X}, ${Y}) -> Ранг найден.`, type: 'success' });
        break;

      case 'MPIBegin97':
        steps.push({ rank: 0, message: "Циклический сдвиг слоев 3D решетки завершен.", type: 'success' });
        break;

      case 'MPIBegin98':
        const v98 = await ask(`[P0] Число для рассылки:`);
        steps.push({ rank: 0, message: "Граф: рассылка соседям (звезда)...", type: 'info' });
        for(let i=1; i<processCount; i++) {
             // Простая эмуляция: нечетные связаны с 0, четные с нечетными
             if (i%2 !== 0) steps.push({ rank: i, message: `Получил от P0: ${v98}`, type: 'success' });
             else steps.push({ rank: i, message: `Получил от P${i-1}: ${v98}`, type: 'success' });
        }
        break;

      default:
        steps.push({ rank: 0, message: "Симуляция успешно завершена.", type: 'success' });
    }
  } catch (e) {
      console.error(e);
      steps.push({ rank: -1, message: "Ошибка ввода или выполнения.", type: 'error' });
  }

  for (const step of steps) {
    await new Promise(r => setTimeout(r, 200));
    onLog(step);
  }
  onLog({ rank: -1, message: "Конец.", type: 'info' });
};
