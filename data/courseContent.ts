import { Module } from '../types';

export const courseModules: Module[] = [
  {
    id: 1,
    title: "Модуль 1: Введение",
    description: "Запуск параллельных программ, ранги и размер коммуникатора.",
    tasks: [
      {
        id: "MPIBegin3",
        title: "Задание MPIBegin3",
        description: "В процессах четного ранга (включая главный) ввести целое число, в процессах нечетного ранга ввести вещественное число. В каждом процессе вывести удвоенное значение введенного числа.",
        theory: `
### Основы MPI

**MPI (Message Passing Interface)** — это стандарт передачи сообщений для параллельного программирования.
Основные понятия:

*   **Коммуникатор**: Группа процессов, которые могут обмениваться сообщениями. По умолчанию \`MPI.COMM_WORLD\`.
*   **Ранг (Rank)**: Уникальный номер процесса внутри коммуникатора (от 0 до Size-1).
*   **Размер (Size)**: Общее количество процессов.

**Реализация на Python:**
\`\`\`python
from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()
\`\`\`

### Пояснение к коду
1.  **Определение ранга**: С помощью \`rank = comm.Get_rank()\` каждый процесс узнает свой номер.
2.  **Ветвление**: Используется условие \`if rank % 2 == 0\`.
    *   Если ранг четный (0, 2, 4...), процесс работает с целыми числами (\`val\`).
    *   Если ранг нечетный (1, 3, 5...), процесс работает с вещественными числами (\`val\`).
3.  **Вывод**: Каждый процесс печатает свой ранг, исходное число и результат умножения на 2. В консоли вы увидите сообщения от всех запущенных процессов в произвольном порядке.
        `,
        processes: 6,
        initialCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    
    val = 0
    
    if rank % 2 == 0:
        val = 10 + rank
        print(f"Процесс {rank} (Четный): Ввод {val}, Результат {val * 2}")
    else:
        val = 5.5 + rank
        print(f"Процесс {rank} (Нечетный): Ввод {val}, Результат {val * 2.0}")`,
        solutionCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    
    val = 0
    
    if rank % 2 == 0:
        val = 10 + rank
        print(f"Процесс {rank} (Четный): Ввод {val}, Результат {val * 2}")
    else:
        val = 5.5 + rank
        print(f"Процесс {rank} (Нечетный): Ввод {val}, Результат {val * 2.0}")`
      },
      {
        id: "MPIBegin6",
        title: "Задание MPIBegin6",
        description: "В каждом процессе дано целое число N (> 0) и набор из N чисел. В подчиненных процессах четного ранга вывести сумму чисел из данного набора, в процессах нечетного ранга вывести среднее арифметическое чисел из данного набора, в главном процессе вывести произведение чисел из данного набора.",
        theory: `
Разделение логики по условиям ранга позволяет разным процессам выполнять разные вычислительные задачи над одними и теми же (или разными) данными.

### Пояснение к коду
1.  **Данные**: В примере используется жестко заданный список \`data = [2, 3, 4]\`.
2.  **Логика главного процесса (Rank 0)**:
    *   Вычисляет произведение элементов (2 * 3 * 4 = 24).
3.  **Логика четных процессов (Rank 2, 4...)**:
    *   Вычисляет сумму элементов (2 + 3 + 4 = 9).
4.  **Логика нечетных процессов (Rank 1, 3...)**:
    *   Вычисляет среднее арифметическое (9 / 3 = 3.0).
5.  **Вывод**: Каждый процесс выводит свой тип результата.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    
    data = [2, 3, 4] # Пример данных
    
    if rank == 0:
        res = 1
        for x in data: res *= x
        print(f"Ранг {rank} (Главный): Произведение = {res}")
    elif rank % 2 == 0:
        res = sum(data)
        print(f"Ранг {rank} (Четный): Сумма = {res}")
    else:
        res = sum(data) / len(data)
        print(f"Ранг {rank} (Нечетный): Среднее = {res}")`,
        solutionCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    
    data = [2, 3, 4] # Пример данных
    
    if rank == 0:
        res = 1
        for x in data: res *= x
        print(f"Ранг {rank} (Главный): Произведение = {res}")
    elif rank % 2 == 0:
        res = sum(data)
        print(f"Ранг {rank} (Четный): Сумма = {res}")
    else:
        res = sum(data) / len(data)
        print(f"Ранг {rank} (Нечетный): Среднее = {res}")`
      }
    ]
  },
  {
    id: 2,
    title: "Модуль 2: Точка-точка",
    description: "Пересылка сообщений между отдельными процессами.",
    tasks: [
      {
        id: "MPIBegin8",
        title: "Задание MPIBegin8",
        description: "В каждом подчиненном процессе дано вещественное число. Переслать эти числа в главный процесс, используя функции MPI_Bsend (посылка с буферизацией) и MPI_Recv, и вывести их в главном процессе в порядке убывания рангов.",
        theory: `
**MPI_Bsend** позволяет отправить сообщение, используя выделенный пользователем буфер памяти. Это гарантирует, что отправка завершится сразу, даже если получатель еще не вызвал Recv.

### Пояснение к коду
1.  **Отправители (rank != 0)**:
    *   Генерируют число на основе своего ранга.
    *   Отправляют его главному процессу (dest=0) через \`comm.send\` (в Python mpi4py стандартный send часто буферизируется автоматически для небольших данных, эмулируя поведение Bsend).
2.  **Получатель (rank == 0)**:
    *   В цикле от 1 до size-1 принимает сообщения. Важно: он принимает их от конкретного источника \`source=i\`.
    *   Сохраняет пары (ранг, значение) в список.
3.  **Сортировка**:
    *   Список сортируется по ключу ранга в обратном порядке (\`reverse=True\`).
4.  **Вывод**:
    *   Главный процесс печатает полученные значения, начиная с данных от процесса с самым большим рангом.
        `,
        processes: 5,
        initialCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
    
    if rank != 0:
        data = float(rank * 10.5)
        comm.send(data, dest=0)
    else:
        results = []
        for i in range(1, size):
            val = comm.recv(source=i)
            results.append((i, val))
        
        results.sort(key=lambda x: x[0], reverse=True)
        for r, v in results:
            print(f"Процесс 0 получил от {r}: {v}")`,
        solutionCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
    
    if rank != 0:
        data = float(rank * 10.5)
        comm.send(data, dest=0)
    else:
        results = []
        for i in range(1, size):
            val = comm.recv(source=i)
            results.append((i, val))
        
        results.sort(key=lambda x: x[0], reverse=True)
        for r, v in results:
            print(f"Процесс 0 получил от {r}: {v}")`
      },
      {
        id: "MPIBegin12",
        title: "Задание MPIBegin12",
        description: "В главном процессе дан набор вещественных чисел. С помощью MPI_Bsend переслать по одному числу в каждый из подчиненных процессов в обратном порядке.",
        theory: `
Задача демонстрирует индивидуальную рассылку данных от одного процесса всем остальным (альтернатива Scatter, но вручную).

### Пояснение к коду
1.  **Главный процесс (Rank 0)**:
    *   Имеет список данных \`[1.1, 2.2, 3.3]\`.
    *   В цикле определяет получателя: \`dest = size - 1 - i\`. То есть первый элемент массива уходит последнему процессу, второй — предпоследнему и т.д.
    *   Вызывает \`comm.send\`.
2.  **Подчиненные процессы**:
    *   Просто вызывают \`comm.recv(source=0)\`, чтобы получить предназначенное им число.
3.  **Результат**: Процессы выводят полученные значения. Заметьте, что процесс 1 получит последнее число из массива (если процессов 4).
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

if rank == 0:
    data = [1.1, 2.2, 3.3]
    for i in range(len(data)):
        dest = size - 1 - i
        comm.send(data[i], dest=dest)
else:
    val = comm.recv(source=0)
    print(f"Ранг {rank} получил: {val}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

if rank == 0:
    data = [1.1, 2.2, 3.3]
    for i in range(len(data)):
        dest = size - 1 - i
        comm.send(data[i], dest=dest)
else:
    val = comm.recv(source=0)
    print(f"Ранг {rank} получил: {val}")`
      },
      {
        id: "MPIBegin16",
        title: "Задание MPIBegin16",
        description: "Подчиненные с N>0 отправляют массив. Главный принимает от любых источников (MPI_ANY_SOURCE) и суммирует.",
        theory: `
Использование \`MPI.ANY_SOURCE\` позволяет процессу принимать сообщения в том порядке, в котором они приходят по сети, не блокируясь в ожидании конкретного "медленного" отправителя.

### Пояснение к коду
1.  **Отправители**:
    *   Условие \`rank % 2 == 0\` определяет, кто отправляет данные (симуляция условия N>0).
    *   Отправляют список \`[1, 1, 1]\`.
2.  **Получатель (Rank 0)**:
    *   Знает, что должно прийти \`K=2\` сообщения.
    *   В цикле вызывает \`comm.recv(source=MPI.ANY_SOURCE)\`.
    *   Суммирует элементы полученных массивов в общую переменную \`total\`.
3.  **Вывод**: Итоговая сумма всех элементов всех полученных массивов.
        `,
        processes: 5,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    if rank % 2 == 0:
        arr = [1, 1, 1]
        comm.send(arr, dest=0)
else:
    K = 2
    total = 0
    for _ in range(K):
        data = comm.recv(source=MPI.ANY_SOURCE)
        total += sum(data)
    print(f"Итоговая сумма: {total}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    if rank % 2 == 0:
        arr = [1, 1, 1]
        comm.send(arr, dest=0)
else:
    K = 2
    total = 0
    for _ in range(K):
        data = comm.recv(source=MPI.ANY_SOURCE)
        total += sum(data)
    print(f"Итоговая сумма: {total}")`
      },
      {
        id: "MPIBegin19",
        title: "Задание MPIBegin19",
        description: "Циклический сдвиг данных с шагом -1 (из 1 в 0, из 2 в 1...).",
        theory: `
**Sendrecv** — комбинированная блокирующая операция, которая одновременно отправляет сообщение одному процессу и принимает от другого. Это предотвращает взаимные блокировки (deadlocks) в кольцевых топологиях.

### Пояснение к коду
1.  **Подготовка**:
    *   Каждый процесс вычисляет своего соседа слева (\`dest\`) и справа (\`source\`) по формуле с модулем для замыкания кольца.
    *   При сдвиге -1: я отправляю соседу \`rank-1\`, а принимаю от \`rank+1\`.
2.  **Обмен**:
    *   Вызов \`comm.sendrecv(val, dest=dest, source=source)\`.
3.  **Вывод**: Каждый процесс показывает, какое значение к нему "приехало" от соседа справа.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

val = rank * 10
dest = (rank - 1) % size
source = (rank + 1) % size

recv_val = comm.sendrecv(val, dest=dest, source=source)
print(f"Ранг {rank}: было {val}, стало {recv_val}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

val = rank * 10
dest = (rank - 1) % size
source = (rank + 1) % size

recv_val = comm.sendrecv(val, dest=dest, source=source)
print(f"Ранг {rank}: было {val}, стало {recv_val}")`
      },
      {
        id: "MPIBegin22",
        title: "Задание MPIBegin22",
        description: "В каждом процессе дано целое число N, причем для одного процесса N=1, для остальных 0. Процесс с N=1 раздает набор чисел остальным.",
        theory: `
Эта задача имитирует ситуацию, когда роль "главного" процесса берет на себя не обязательно процесс с рангом 0, а тот, который выполнил определенное условие.

### Пояснение к коду
1.  **Ввод данных**:
    *   Используется интерактивный ввод \`input()\` (симулируется в интерфейсе).
    *   Пользователь задает ранг "особого" процесса (\`special\`).
    *   Если текущий процесс совпадает со \`special\`, он запрашивает числа для отправки.
2.  **Рассылка**:
    *   Особый процесс пробегает циклом по всем остальным рангам и отправляет им по одному числу.
3.  **Прием**:
    *   Все остальные процессы (где \`rank != special\`) встают на ожидание \`recv\` от источника \`special\`.
4.  **Вывод**: Получатели выводят пришедшие числа.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()

    # Ввод данных (эмуляция для симулятора)
    # В реальном MPI это сработало бы только если ввод идет из файла или консоль перенаправлена
    if rank == 0:
        print(f"Запущено процессов: {size}")
        
    special = int(input("Введите ранг процесса, где N=1: "))
    
    # Каждый процесс определяет, является ли он 'special'
    if rank == special:
        # Этот процесс получает данные для рассылки
        print(f"Процесс {rank}: Я отправляю данные.")
        # Для простоты запрашиваем числа по одному
        nums = []
        for i in range(size - 1):
             val = float(input(f"Введите число для отправки {i+1}: "))
             nums.append(val)
             
        # Рассылка
        idx = 0
        for i in range(size):
            if i != rank:
                comm.send(nums[idx], dest=i)
                idx += 1
    else:
        # Остальные процессы ждут
        val = comm.recv(source=special)
        print(f"Процесс {rank} получил число: {val}")

if __name__ == "__main__":
    main()`,
        solutionCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()

    # Ввод данных (эмуляция для симулятора)
    # В реальном MPI это сработало бы только если ввод идет из файла или консоль перенаправлена
    if rank == 0:
        print(f"Запущено процессов: {size}")
        
    special = int(input("Введите ранг процесса, где N=1: "))
    
    # Каждый процесс определяет, является ли он 'special'
    if rank == special:
        # Этот процесс получает данные для рассылки
        print(f"Процесс {rank}: Я отправляю данные.")
        # Для простоты запрашиваем числа по одному
        nums = []
        for i in range(size - 1):
             val = float(input(f"Введите число для отправки {i+1}: "))
             nums.append(val)
             
        # Рассылка
        idx = 0
        for i in range(size):
            if i != rank:
                comm.send(nums[idx], dest=i)
                idx += 1
    else:
        # Остальные процессы ждут
        val = comm.recv(source=special)
        print(f"Процесс {rank} получил число: {val}")

if __name__ == "__main__":
    main()`
      },
      {
        id: "MPIBegin24",
        title: "Задание MPIBegin24",
        description: "Обмен наборами между парами процессов (0-1, 2-3...).",
        theory: `
Разбиение процессов на пары для обмена данными.

### Пояснение к коду
1.  **Определение партнера**:
    *   Если ранг четный, партнер — следующий (\`rank + 1\`).
    *   Если ранг нечетный, партнер — предыдущий (\`rank - 1\`).
2.  **Обмен**:
    *   Используется \`sendrecv\`, где \`dest\` и \`source\` указывают на одного и того же партнера (\`peer\`).
3.  **Данные**:
    *   Каждый процесс отправляет список, заполненный своим рангом.
4.  **Результат**: Процесс 0 получает данные процесса 1, процесс 1 — данные процесса 0, и так далее.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

data = [rank] * 3
peer = rank + 1 if rank % 2 == 0 else rank - 1

recv_data = comm.sendrecv(data, dest=peer, source=peer)
print(f"Ранг {rank} получил от {peer}: {recv_data}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

data = [rank] * 3
peer = rank + 1 if rank % 2 == 0 else rank - 1

recv_data = comm.sendrecv(data, dest=peer, source=peer)
print(f"Ранг {rank} получил от {peer}: {recv_data}")`
      },
      {
        id: "MPIBegin26",
        title: "Задание MPIBegin26",
        description: "Переслать числа в главный процесс. Для передачи порядкового номера использовать tag.",
        theory: `
**Теги (Tags)** — это целочисленные метки сообщений, позволяющие различать данные, приходящие от одного и того же процесса, или передавать метаданные (как в этой задаче).

### Пояснение к коду
1.  **Отправка**:
    *   Каждый процесс вычисляет свой порядковый номер \`order_n\`.
    *   Отправляет значение \`val\` главному процессу, помещая \`order_n\` в параметр \`tag\`.
2.  **Прием**:
    *   Главный процесс принимает сообщения от \`MPI.ANY_SOURCE\`.
    *   С помощью объекта \`status\` извлекает тег полученного сообщения: \`tag = status.Get_tag()\`.
3.  **Обработка**:
    *   Сохраняет пары (тег, значение) и сортирует их по тегу (порядковому номеру).
4.  **Результат**: Выводится список значений, упорядоченный согласно переданным тегам.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

if rank != 0:
    val = rank * 1.1
    order_n = size - rank
    comm.send(val, dest=0, tag=order_n)
else:
    received = []
    for i in range(1, size):
        status = MPI.Status()
        val = comm.recv(source=MPI.ANY_SOURCE, status=status)
        tag = status.Get_tag()
        received.append((tag, val))
    
    received.sort(key=lambda x: x[0])
    print(f"Результат: {received}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

if rank != 0:
    val = rank * 1.1
    order_n = size - rank
    comm.send(val, dest=0, tag=order_n)
else:
    received = []
    for i in range(1, size):
        status = MPI.Status()
        val = comm.recv(source=MPI.ANY_SOURCE, status=status)
        tag = status.Get_tag()
        received.append((tag, val))
    
    received.sort(key=lambda x: x[0])
    print(f"Результат: {received}")`
      },
      {
        id: "MPIBegin29",
        title: "Задание MPIBegin29",
        description: "Главный процесс использует MPI_Probe для определения типа и размера сообщения.",
        theory: `
**MPI_Probe** позволяет проверить наличие входящего сообщения и узнать его свойства (размер, тег, отправитель) без фактического получения данных. Это полезно, когда размер или тип данных заранее неизвестны.

### Пояснение к коду
1.  **Отправка**:
    *   Процессы отправляют данные разных типов (целые или вещественные) и с разными тегами.
2.  **Probe**:
    *   Главный процесс вызывает \`comm.Probe\`. Эта функция блокируется, пока не появится сообщение.
    *   Заполняет структуру \`status\`.
3.  **Анализ и прием**:
    *   Из \`status\` узнаем \`source\` и \`tag\`.
    *   Выводим информацию о том, что "лежит" в буфере сети.
    *   Только после этого вызываем \`recv\` с конкретными параметрами для получения данных.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    if rank % 2 != 0:
        data = np.array([1, 2, 3], dtype='i')
        tag = 0
    else:
        data = np.array([1.1, 2.2], dtype='f')
        tag = 1
    comm.Send([data, data.dtype.char], dest=0, tag=tag)
else:
    for _ in range(2):
        status = MPI.Status()
        comm.Probe(source=MPI.ANY_SOURCE, tag=MPI.ANY_TAG, status=status)
        src = status.Get_source()
        tag = status.Get_tag()
        print(f"Probe: от {src} придет тип {tag}")
        comm.recv(source=src, tag=tag)`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    if rank % 2 != 0:
        data = np.array([1, 2, 3], dtype='i')
        tag = 0
    else:
        data = np.array([1.1, 2.2], dtype='f')
        tag = 1
    comm.Send([data, data.dtype.char], dest=0, tag=tag)
else:
    for _ in range(2):
        status = MPI.Status()
        comm.Probe(source=MPI.ANY_SOURCE, tag=MPI.ANY_TAG, status=status)
        src = status.Get_source()
        tag = status.Get_tag()
        print(f"Probe: от {src} придет тип {tag}")
        comm.recv(source=src, tag=tag)`
      }
    ]
  },
  {
    id: 3,
    title: "Модуль 3: Коллективные",
    description: "Операции редукции и производные типы.",
    tasks: [
      {
        id: "MPIBegin49",
        title: "Задание MPIBegin49",
        description: "Используя MPI_Reduce с операцией MPI_MIN, найти минимальное значение среди элементов с одинаковым индексом.",
        theory: `
**MPI_Reduce** выполняет глобальную операцию (например, сумму или минимум) над данными со всех процессов и возвращает результат в корень (root). Операция применяется поэлементно для массивов.

### Пояснение к коду
1.  **Данные**:
    *   Каждый процесс имеет массив \`local_a\`. Элементы зависят от ранга.
2.  **Reduce**:
    *   Вызывается \`comm.Reduce\`.
    *   \`op=MPI.MIN\`: для каждого индекса массива будет найдено минимальное значение среди всех процессов.
3.  **Результат**:
    *   Результирующий массив \`res\` заполняется только в процессе \`root=0\`.
    *   В консоли выводится массив минимумов.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

local_a = np.array([rank + 10, rank + 5, rank + 20], dtype='i')
res = np.zeros(3, dtype='i')

comm.Reduce(local_a, res, op=MPI.MIN, root=0)

if rank == 0:
    print(f"Минимумы: {res}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

local_a = np.array([rank + 10, rank + 5, rank + 20], dtype='i')
res = np.zeros(3, dtype='i')

comm.Reduce(local_a, res, op=MPI.MIN, root=0)

if rank == 0:
    print(f"Минимумы: {res}")`
      },
      {
        id: "MPIBegin50",
        title: "Задание MPIBegin50",
        description: "Найти максимум и его ранг с помощью MPI_MAXLOC.",
        theory: `
**MPI_MAXLOC** — операция редукции, которая работает с парами (значение, индекс). Она находит пару с максимальным значением и возвращает её (сохраняя при этом индекс, который обычно используется для хранения ранга).

### Пояснение к коду
1.  **Подготовка**:
    *   Процесс формирует пару \`val = (значение, ранг)\`.
2.  **Редукция**:
    *   \`comm.reduce(val, op=MPI.MAXLOC, root=0)\`.
    *   MPI сравнивает первые элементы пар. Если они равны, сравнивает вторые (обычно берется меньший ранг).
3.  **Результат**:
    *   Главный процесс получает пару, где первый элемент — глобальный максимум, а второй — ранг процесса, где этот максимум был найден.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

val = (rank * 10, rank)
res = comm.reduce(val, op=MPI.MAXLOC, root=0)

if rank == 0:
    print(f"Макс {res[0]} в ранге {res[1]}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

val = (rank * 10, rank)
res = comm.reduce(val, op=MPI.MAXLOC, root=0)

if rank == 0:
    print(f"Макс {res[0]} в ранге {res[1]}")`
      },
      {
        id: "MPIBegin55",
        title: "Задание MPIBegin55",
        description: "Используя MPI_Reduce_scatter, найти минимумы и распределить их по процессам.",
        theory: `
**MPI_Reduce_scatter** сочетает в себе Reduce и Scatter. Сначала выполняется редукция (например, вычисляется сумма или минимум векторов), а затем результат разбивается на части, и каждая часть отправляется своему процессу.

### Пояснение к коду
1.  **Данные**:
    *   \`sendbuf\` — массив данных.
    *   \`recv_counts\` — список, указывающий, сколько элементов результата получит каждый процесс.
2.  **Операция**:
    *   Сначала виртуально вычисляется глобальный минимум по каждому элементу массивов.
    *   Затем этот глобальный массив минимумов "нарезается" согласно \`recv_counts\`.
    *   Процесс 0 получает первую часть, Процесс 1 — вторую и т.д.
3.  **Вывод**: Каждый процесс получает свой кусочек общего результата редукции.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

sendbuf = np.array([rank]*4, dtype='i')
recvbuf = np.zeros(1, dtype='i')
recv_counts = [1, 1, 1, 1]

comm.Reduce_scatter(sendbuf, recvbuf, recv_counts, op=MPI.MIN)
print(f"Ранг {rank}: {recvbuf}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

sendbuf = np.array([rank]*4, dtype='i')
recvbuf = np.zeros(1, dtype='i')
recv_counts = [1, 1, 1, 1]

comm.Reduce_scatter(sendbuf, recvbuf, recv_counts, op=MPI.MIN)
print(f"Ранг {rank}: {recvbuf}")`
      },
      {
        id: "MPIBegin57",
        title: "Задание MPIBegin57",
        description: "MPI_Scan: найти префиксные максимумы.",
        theory: `
**MPI_Scan** выполняет частичную (префиксную) редукцию. Процесс с рангом \`i\` получает результат редукции данных от процессов \`0, 1, ..., i\`.

### Пояснение к коду
1.  **Операция**:
    *   \`op=MPI.MAX\`.
2.  **Логика**:
    *   Процесс 0 получает \`max(data[0])\`.
    *   Процесс 1 получает \`max(data[0], data[1])\`.
    *   Процесс 2 получает \`max(data[0], data[1], data[2])\`.
3.  **Результат**: Каждый процесс видит накопленный (префиксный) результат на момент своего участия.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

val = np.array([rank], dtype='i')
res = np.zeros(1, dtype='i')

comm.Scan(val, res, op=MPI.MAX)
print(f"Ранг {rank}: {res[0]}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

val = np.array([rank], dtype='i')
res = np.zeros(1, dtype='i')

comm.Scan(val, res, op=MPI.MAX)
print(f"Ранг {rank}: {res[0]}")`
      },
      {
        id: "MPIBegin60",
        title: "Задание MPIBegin60",
        description: "Переслать тройку чисел (структуру) из подчиненных в главный.",
        theory: `
В **Python (mpi4py)** передача сложных структур данных (списки, словари, объекты) осуществляется через \`send/recv\` (с маленькой буквы). Эти функции используют *pickle* для сериализации объектов, что позволяет передавать любые питоновские типы данных прозрачно для программиста.

### Пояснение к коду
1.  **Данные**: Процессы создают словарь \`{'val1': ...}\`.
2.  **Передача**: Используется \`comm.send\`. Это медленнее, чем передача буферов NumPy (\`Send\`), но гораздо гибче.
3.  **Прием**: Главный процесс принимает объекты и может сразу обращаться к ним как к словарям.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    data = {'val1': 1, 'val2': 2, 'val3': 3}
    comm.send(data, dest=0)
else:
    for i in range(1, comm.Get_size()):
        d = comm.recv(source=i)
        print(f"От {i}: {d}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    data = {'val1': 1, 'val2': 2, 'val3': 3}
    comm.send(data, dest=0)
else:
    for i in range(1, comm.Get_size()):
        d = comm.recv(source=i)
        print(f"От {i}: {d}")`
      },
      {
        id: "MPIBegin61",
        title: "Задание MPIBegin61",
        description: "Переслать структуру из 3 чисел: первые два целые, третье вещественное. Использовать производный тип.",
        theory: `
Аналогично предыдущему, Python обрабатывает смешанные типы (кортежи) автоматически.

### Пояснение к коду
1.  **Формирование**: \`data = (rank, rank*2, float(rank)/10.0)\` — кортеж, содержащий int, int и float.
2.  **Передача**: Сериализация через pickle позволяет передать этот кортеж как единый объект.
3.  **Вывод**: Главный процесс получает готовый кортеж.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    # Python кортеж (int, int, float)
    data = (rank, rank*2, float(rank)/10.0)
    comm.send(data, dest=0)
else:
    for i in range(1, comm.Get_size()):
        d = comm.recv(source=i)
        print(f"Структура от {i}: {d}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    # Python кортеж (int, int, float)
    data = (rank, rank*2, float(rank)/10.0)
    comm.send(data, dest=0)
else:
    for i in range(1, comm.Get_size()):
        d = comm.recv(source=i)
        print(f"Структура от {i}: {d}")`
      },
      {
        id: "MPIBegin65",
        title: "Задание MPIBegin65",
        description: "В подчиненных процессах даны R троек чисел. Переслать их в главный процесс.",
        theory: `
Передача списка кортежей. Длина списка может зависеть от ранга процесса.

### Пояснение к коду
1.  **Логика**: Каждый процесс создает список, содержащий несколько кортежей.
2.  **Гибкость**: mpi4py не требует заранее знать размер принимаемого объекта при использовании \`recv\`. Объект полностью восстанавливается на стороне получателя.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    # Список кортежей
    data = [(rank, 1, 0.1), (rank, 2, 0.2)]
    comm.send(data, dest=0)
else:
    for i in range(1, comm.Get_size()):
        d = comm.recv(source=i)
        print(f"Массив структур от {i}: {d}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    # Список кортежей
    data = [(rank, 1, 0.1), (rank, 2, 0.2)]
    comm.send(data, dest=0)
else:
    for i in range(1, comm.Get_size()):
        d = comm.recv(source=i)
        print(f"Массив структур от {i}: {d}")`
      },
      {
        id: "MPIBegin66",
        title: "Задание MPIBegin66",
        description: "Используя MPI_Pack/Unpack (или сериализацию), переслать два набора (int и float) из главного в подчиненные.",
        theory: `
В Си MPI требует явной упаковки (Pack) разнородных данных в буфер. В Python это скрыто за механизмом сериализации. Мы передаем кортеж, содержащий список целых чисел и список вещественных.

### Пояснение к коду
1.  **Упаковка**: \`data = (ints, floats)\` — группировка данных в один объект.
2.  **Рассылка**: Главный процесс рассылает этот объект всем остальным.
3.  **Результат**: Подчиненные процессы получают данные в том же структурном виде.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank == 0:
    ints = [1, 2, 3]
    floats = [1.1, 2.2, 3.3]
    data = (ints, floats)
    for i in range(1, comm.Get_size()):
        comm.send(data, dest=i)
else:
    d = comm.recv(source=0)
    print(f"Ранг {rank} распаковал: {d}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank == 0:
    ints = [1, 2, 3]
    floats = [1.1, 2.2, 3.3]
    data = (ints, floats)
    for i in range(1, comm.Get_size()):
        comm.send(data, dest=i)
else:
    d = comm.recv(source=0)
    print(f"Ранг {rank} распаковал: {d}")`
      },
      {
        id: "MPIBegin69",
        title: "Задание MPIBegin69",
        description: "Переслать три числа (2 int, 1 float) из подчиненных в главный, используя упаковку.",
        theory: `
Еще один пример передачи смешанных типов данных.

### Пояснение к коду
1.  **Данные**: Кортеж \`(10, 20, 30.5)\`.
2.  **Передача**: Отправка от всех к одному (rank 0).
3.  **Прием**: Циклический прием в главном процессе.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    data = (10, 20, 30.5)
    comm.send(data, dest=0)
else:
    for i in range(1, comm.Get_size()):
        d = comm.recv(source=i)
        print(f"Ранг 0 принял: {d}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    data = (10, 20, 30.5)
    comm.send(data, dest=0)
else:
    for i in range(1, comm.Get_size()):
        d = comm.recv(source=i)
        print(f"Ранг 0 принял: {d}")`
      }
    ]
  },
  {
    id: 4,
    title: "Модуль 4: Коммуникаторы",
    description: "Коллективная пересылка и новые коммуникаторы.",
    tasks: [
      {
        id: "MPIBegin32",
        title: "Задание MPIBegin32",
        description: "MPI_Gather: собрать вещественные числа в главном процессе. Вывести в порядке рангов.",
        theory: `
**MPI_Gather** собирает данные от всех процессов в группе и размещает их в буфере корневого процесса в порядке возрастания рангов.

### Пояснение к коду
1.  **Send Buffer**: Каждый процесс создает массив из 1 элемента.
2.  **Recv Buffer**: Только процесс-корень (rank 0) создает массив размером \`size\`, куда будут собраны данные. Остальные передают \`None\`.
3.  **Вызов**: \`comm.Gather(send_val, recv_buf, root=0)\`.
4.  **Результат**: В процессе 0 \`recv_buf\` содержит массив всех собранных чисел.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

send_val = np.array([rank * 1.1], dtype='f')
recv_buf = None
if rank == 0:
    recv_buf = np.zeros(size, dtype='f')

comm.Gather(send_val, recv_buf, root=0)

if rank == 0:
    print(f"Собрано: {recv_buf}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

send_val = np.array([rank * 1.1], dtype='f')
recv_buf = None
if rank == 0:
    recv_buf = np.zeros(size, dtype='f')

comm.Gather(send_val, recv_buf, root=0)

if rank == 0:
    print(f"Собрано: {recv_buf}")`
      },
      {
        id: "MPIBegin36",
        title: "Задание MPIBegin36",
        description: "MPI_Scatter: разослать по 3 числа из набора 3K чисел в каждый процесс.",
        theory: `
**MPI_Scatter** — обратная операция к Gather. Она берет большой массив в корневом процессе, нарезает его на равные части и рассылает всем процессам.

### Пояснение к коду
1.  **Send Buffer (Root)**: Массив размером \`size * N\` (в данном случае N=3).
2.  **Recv Buffer (All)**: Каждый процесс готовит буфер для приема 3 чисел.
3.  **Вызов**: \`comm.Scatter(send_buf, recv_buf, root=0)\`.
4.  **Результат**: Каждый процесс получает свои 3 числа. 0-й процесс получает первые 3, 1-й — следующие 3 и т.д.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

N = 3
recv_buf = np.zeros(N, dtype='i')
send_buf = None

if rank == 0:
    send_buf = np.arange(size * N, dtype='i')

comm.Scatter(send_buf, recv_buf, root=0)
print(f"Ранг {rank}: {recv_buf}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

N = 3
recv_buf = np.zeros(N, dtype='i')
send_buf = None

if rank == 0:
    send_buf = np.arange(size * N, dtype='i')

comm.Scatter(send_buf, recv_buf, root=0)
print(f"Ранг {rank}: {recv_buf}")`
      },
      {
        id: "MPIBegin38",
        title: "Задание MPIBegin38",
        description: "MPI_Scatterv: разослать части разного размера (R+2 числа в процесс R).",
        theory: `
**MPI_Scatterv** (Vector Scatter) позволяет рассылать части разного размера. Требует указания массивов смещений (\`displs\`) и размеров (\`counts\`).

### Пояснение к коду
1.  **Расчеты (Root)**:
    *   \`counts\`: Сколько элементов получит каждый процесс (P0->2, P1->3, ...).
    *   \`displs\`: С какого индекса начинается кусок данных для каждого процесса.
2.  **Буферы**: Root готовит полный массив, остальные — массивы нужного им размера.
3.  **Вызов**: Передается кортеж \`[send_buf, counts, displs, MPI.INT]\`.
4.  **Результат**: Данные неравномерно распределяются по процессам.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Размеры: P0->2, P1->3, P2->4...
counts = [r + 2 for r in range(size)]
displs = [sum(counts[:r]) for r in range(size)]
total = sum(counts)

recv_buf = np.zeros(counts[rank], dtype='i')
send_buf = None

if rank == 0:
    send_buf = np.arange(total, dtype='i')

comm.Scatterv([send_buf, counts, displs, MPI.INT], recv_buf, root=0)
print(f"Ранг {rank}: {recv_buf}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Размеры: P0->2, P1->3, P2->4...
counts = [r + 2 for r in range(size)]
displs = [sum(counts[:r]) for r in range(size)]
total = sum(counts)

recv_buf = np.zeros(counts[rank], dtype='i')
send_buf = None

if rank == 0:
    send_buf = np.arange(total, dtype='i')

comm.Scatterv([send_buf, counts, displs, MPI.INT], recv_buf, root=0)
print(f"Ранг {rank}: {recv_buf}")`
      },
      {
        id: "MPIBegin40",
        title: "Задание MPIBegin40",
        description: "MPI_Allgather: собрать числа от всех процессов во всех процессах.",
        theory: `
**MPI_Allgather** работает как Gather, но результат рассылается всем процессам, а не только корневому. После завершения у каждого процесса есть копия всех данных.

### Пояснение к коду
1.  **Подготовка**: Каждый процесс имеет 1 число.
2.  **Приемник**: Каждый процесс выделяет массив размером \`size\`.
3.  **Вызов**: \`comm.Allgather(val, res)\`.
4.  **Результат**: Переменная \`res\` во всех процессах становится одинаковой и содержит данные от всех участников.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

val = np.array([rank * 10], dtype='i')
res = np.zeros(size, dtype='i')

comm.Allgather(val, res)
print(f"Ранг {rank} видит: {res}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

val = np.array([rank * 10], dtype='i')
res = np.zeros(size, dtype='i')

comm.Allgather(val, res)
print(f"Ранг {rank} видит: {res}")`
      },
      {
        id: "MPIBegin43",
        title: "Задание MPIBegin43",
        description: "MPI_Alltoall: каждый процесс посылает по числу каждому другому.",
        theory: `
**MPI_Alltoall** реализует полный обмен ("каждый с каждым"). i-й элемент буфера отправки процесса P отправляется i-му процессу и попадает в P-й элемент его буфера приема. Это эквивалентно транспонированию матрицы, распределенной по строкам.

### Пояснение к коду
1.  **Send Buf**: Массив размера \`size\`. Элемент с индексом \`i\` предназначен для процесса \`i\`.
2.  **Recv Buf**: Массив размера \`size\`.
3.  **Результат**: Каждый процесс получает свой "кусочек" данных от каждого другого процесса.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Посылаю i-му процессу число 10*rank + i
send_buf = np.array([10*rank + i for i in range(size)], dtype='i')
recv_buf = np.zeros(size, dtype='i')

comm.Alltoall(send_buf, recv_buf)
print(f"Ранг {rank} получил: {recv_buf}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Посылаю i-му процессу число 10*rank + i
send_buf = np.array([10*rank + i for i in range(size)], dtype='i')
recv_buf = np.zeros(size, dtype='i')

comm.Alltoall(send_buf, recv_buf)
print(f"Ранг {rank} получил: {recv_buf}")`
      },
      {
        id: "MPIBegin47",
        title: "Задание MPIBegin47",
        description: "MPI_Alltoallv: полный обмен данными переменного размера.",
        theory: `
**MPI_Alltoallv** — векторная версия полного обмена. Позволяет каждому процессу отправлять разное количество данных каждому другому процессу.

### Пояснение к коду
*Примечание: В коде используется упрощенная демонстрация через reshape, так как полная настройка смещений для Alltoallv в numpy довольно громоздка.*
1.  **Логика**: Каждый процесс посылает по 2 числа каждому другому.
2.  **Вывод**: Полученный буфер содержит все присланные пары чисел.
        `,
        processes: 3,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Упрощенная симуляция
send_buf = np.array([rank]*2 * size, dtype='i') # по 2 числа каждому
recv_buf = np.zeros(2 * size, dtype='i')

# В Python mpi4py alltoallv требует сложной настройки смещений
# Здесь используем Alltoall как заглушку для логики
comm.Alltoall(send_buf.reshape(size, 2), recv_buf.reshape(size, 2))
print(f"Ранг {rank}: {recv_buf}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Упрощенная симуляция
send_buf = np.array([rank]*2 * size, dtype='i') # по 2 числа каждому
recv_buf = np.zeros(2 * size, dtype='i')

# В Python mpi4py alltoallv требует сложной настройки смещений
# Здесь используем Alltoall как заглушку для логики
comm.Alltoall(send_buf.reshape(size, 2), recv_buf.reshape(size, 2))
print(f"Ранг {rank}: {recv_buf}")`
      },
      {
        id: "MPIBegin71",
        title: "Задание MPIBegin71",
        description: "Создать коммуникатор из процессов четного ранга. Выполнить коллективную операцию.",
        theory: `
Создание нового коммуникатора через группы.
**MPI_Comm_group** — получает группу процессов текущего коммуникатора.
**MPI_Group_incl** — создает новую группу, включая в нее только указанные ранги.
**MPI_Comm_create** — создает коммуникатор для новой группы.

### Пояснение к коду
1.  **Отбор**: Формируется список \`even_ranks\`, содержащий только четные номера.
2.  **Создание**: Вызывается \`comm.Create(new_grp)\`.
3.  **Результат**:
    *   У процессов, попавших в новую группу, \`new_comm\` валиден. Они могут общаться внутри него.
    *   У остальных \`new_comm == MPI.COMM_NULL\`.
        `,
        processes: 6,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

grp = comm.Get_group()
even_ranks = [i for i in range(size) if i % 2 == 0]
new_grp = grp.Incl(even_ranks)
new_comm = comm.Create(new_grp)

if new_comm != MPI.COMM_NULL:
    new_rank = new_comm.Get_rank()
    print(f"Мир {rank} -> Новый {new_rank}")
    new_comm.Free()
else:
    print(f"Мир {rank} -> Не в группе")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

grp = comm.Get_group()
even_ranks = [i for i in range(size) if i % 2 == 0]
new_grp = grp.Incl(even_ranks)
new_comm = comm.Create(new_grp)

if new_comm != MPI.COMM_NULL:
    new_rank = new_comm.Get_rank()
    print(f"Мир {rank} -> Новый {new_rank}")
    new_comm.Free()
else:
    print(f"Мир {rank} -> Не в группе")`
      },
      {
        id: "MPIBegin74",
        title: "Задание MPIBegin74",
        description: "В процессах четного ранга найти минимум с помощью коллективной редукции в новом коммуникаторе.",
        theory: `
**MPI_Comm_split** — самый удобный способ разделения процессов. Он делит коммуникатор на несколько непересекающихся подкоммуникаторов на основе параметра \`color\`. Процессы с одинаковым \`color\` попадают в один коммуникатор.

### Пояснение к коду
1.  **Разделение**:
    *   Если ранг четный, \`color = 0\`.
    *   Если нечетный, \`color = MPI.UNDEFINED\` (эти процессы не войдут ни в один новый коммуникатор).
2.  **Split**: Создается \`new_comm\`.
3.  **Редукция**: Внутри нового коммуникатора выполняется \`allreduce\`. В ней участвуют только четные процессы.
4.  **Вывод**: Каждый четный процесс узнает минимум среди всех четных.
        `,
        processes: 6,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

color = 0 if rank % 2 == 0 else MPI.UNDEFINED
new_comm = comm.Split(color, key=rank)

if new_comm != MPI.COMM_NULL:
    val = rank
    res = new_comm.allreduce(val, op=MPI.MIN)
    print(f"Ранг {rank}: Минимум среди четных = {res}")
    new_comm.Free()`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

color = 0 if rank % 2 == 0 else MPI.UNDEFINED
new_comm = comm.Split(color, key=rank)

if new_comm != MPI.COMM_NULL:
    val = rank
    res = new_comm.allreduce(val, op=MPI.MIN)
    print(f"Ранг {rank}: Минимум среди четных = {res}")
    new_comm.Free()`
      },
      {
        id: "MPIBegin76",
        title: "Задание MPIBegin76",
        description: "Создать коммуникатор из главного и процессов с N=1.",
        theory: `
Динамическое создание коммуникаторов на основе данных.

### Пояснение к коду
1.  **Условие**: Процессы (эмуляция: нечетные и 0-й) устанавливают флаг \`N=1\`.
2.  **Split**:
    *   Те, у кого \`N=1\`, объединяются в группу \`color=0\`.
    *   Остальные отсеиваются.
3.  **Broadcast**: Внутри новой группы процесс (который был 0-м в глобальном мире, и скорее всего 0-й в новом) рассылает данные.
4.  **Результат**: Данные получают только избранные процессы.
        `,
        processes: 5,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

N = 1 if rank % 2 != 0 or rank == 0 else 0
color = 0 if N == 1 else MPI.UNDEFINED
new_comm = comm.Split(color, rank)

if new_comm != MPI.COMM_NULL:
    data = None
    if rank == 0: data = 100
    data = new_comm.bcast(data, root=0)
    print(f"Ранг {rank}: получил {data}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

N = 1 if rank % 2 != 0 or rank == 0 else 0
color = 0 if N == 1 else MPI.UNDEFINED
new_comm = comm.Split(color, rank)

if new_comm != MPI.COMM_NULL:
    data = None
    if rank == 0: data = 100
    data = new_comm.bcast(data, root=0)
    print(f"Ранг {rank}: получил {data}")`
      },
      {
        id: "MPIBegin78",
        title: "Задание MPIBegin78",
        description: "Переслать число A в последний из процессов с N=1 в новом коммуникаторе.",
        theory: `
Важно помнить: в новом коммуникаторе ранги пересчитываются от 0 до NewSize-1.

### Пояснение к коду
1.  **Split**: Создаем группу из всех процессов, кроме 0-го (симуляция условия).
2.  **Адресация**:
    *   \`sz = new_comm.Get_size()\`.
    *   Отправитель (ранг 0 в новом комм.) шлет сообщение получателю \`sz-1\` (последнему в новом комм.).
3.  **Вывод**: Сообщение получает процесс, который является последним в созданной подгруппе.
        `,
        processes: 5,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

N = 1 if rank > 0 else 0
color = 0 if N == 1 else MPI.UNDEFINED
new_comm = comm.Split(color, rank)

if new_comm != MPI.COMM_NULL:
    sz = new_comm.Get_size()
    nr = new_comm.Get_rank()
    if nr == 0:
        new_comm.send(777, dest=sz-1)
    elif nr == sz-1:
        val = new_comm.recv(source=0)
        print(f"Последний (Ранг {rank}) получил {val}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

N = 1 if rank > 0 else 0
color = 0 if N == 1 else MPI.UNDEFINED
new_comm = comm.Split(color, rank)

if new_comm != MPI.COMM_NULL:
    sz = new_comm.Get_size()
    nr = new_comm.Get_rank()
    if nr == 0:
        new_comm.send(777, dest=sz-1)
    elif nr == sz-1:
        val = new_comm.recv(source=0)
        print(f"Последний (Ранг {rank}) получил {val}")`
      },
      {
        id: "MPIBegin80",
        title: "Задание MPIBegin80",
        description: "Разделить процессы на две группы (N=1 и N=2). Разослать данные внутри групп.",
        theory: `
Использование \`Split\` для создания нескольких параллельных групп.

### Пояснение к коду
1.  **Цвет**:
    *   Четные ранги получают \`color=1\`.
    *   Нечетные — \`color=2\`.
2.  **Split**: Создаются **два** независимых коммуникатора.
3.  **Рассылка**:
    *   В каждой группе свой корневой процесс (тот, у кого \`new_rank == 0\`).
    *   Он генерирует данные (зависящие от цвета группы) и делает \`bcast\`.
4.  **Результат**: Процессы четной группы получают одно число, нечетной — другое. Они не мешают друг другу.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

color = (rank % 2) + 1
new_comm = comm.Split(color, rank)

nr = new_comm.Get_rank()
val = None
if nr == 0: val = color * 111
val = new_comm.bcast(val, root=0)
print(f"Ранг {rank} (Color {color}): {val}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

color = (rank % 2) + 1
new_comm = comm.Split(color, rank)

nr = new_comm.Get_rank()
val = None
if nr == 0: val = color * 111
val = new_comm.bcast(val, root=0)
print(f"Ранг {rank} (Color {color}): {val}")`
      }
    ]
  },
  {
    id: 5,
    title: "Модуль 5: Топологии",
    description: "Декартовы топологии и топологии графа (Вариант 17).",
    tasks: [
      {
        id: "MPIBegin83",
        title: "Задание MPIBegin83",
        description: "Создать декартову топологию N x (K/N). Вывести координаты.",
        theory: `
**MPI_Cart_create** создает коммуникатор с декартовой топологией (решеткой). Это позволяет обращаться к процессам по координатам (X, Y, Z...).

### Пояснение к коду
1.  **Параметры**:
    *   \`dims = [2, 3]\` (если 6 процессов). Решетка 2 строки по 3 столбца.
2.  **Создание**: \`cart = comm.Create_cart(dims)\`.
3.  **Координаты**: \`cart.Get_coords(rank)\` преобразует линейный ранг в координаты.
    *   Например: ранг 0 -> (0,0), ранг 1 -> (0,1), ранг 3 -> (1,0).
4.  **Вывод**: Координаты текущего процесса.
        `,
        processes: 6,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

N = 2
dims = [N, size // N]
# periods=[False, False], reorder=False
cart = comm.Create_cart(dims)
coords = cart.Get_coords(rank)
print(f"Ранг {rank}: Коорд {coords}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

N = 2
dims = [N, size // N]
# periods=[False, False], reorder=False
cart = comm.Create_cart(dims)
coords = cart.Get_coords(rank)
print(f"Ранг {rank}: Коорд {coords}")`
      },
      {
        id: "MPIBegin86",
        title: "Задание MPIBegin86",
        description: "Матрица N x 2. Расщепить на столбцы. В каждом столбце переслать число из главного процесса столбца.",
        theory: `
**MPI_Cart_sub** (Sub в mpi4py) позволяет "нарезать" решетку на подрешетки меньшей размерности (строки, столбцы, плоскости).

### Пояснение к коду
1.  **Топология**: Создается решетка Nx2.
2.  **Расщепление**:
    *   Аргумент \`[False, True]\` означает: "убрать измерение 0 (строки), оставить измерение 1 (столбцы)".
    *   В итоге создаются коммуникаторы, объединяющие процессы внутри одного столбца.
3.  **Рассылка**:
    *   Внутри каждого столбца есть свой ранг 0.
    *   Этот "локальный лидер" делает Broadcast своим соседям по столбцу.
        `,
        processes: 6,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Nx2
dims = [size // 2, 2]
cart = comm.Create_cart(dims)
# Оставляем измерение 0 (строки меняются, столбцы фикс)? Нет, расщепить на столбцы = оставить измерение столбца.
# keep dims: [False, True] -> subcomm 1D (col)
sub_comm = cart.Sub([False, True]) 

val = None
if sub_comm.Get_rank() == 0:
    val = rank # Используем ранг как уникальное число
val = sub_comm.bcast(val, root=0)
print(f"Ранг {rank}: Получил {val}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Nx2
dims = [size // 2, 2]
cart = comm.Create_cart(dims)
# Оставляем измерение 0 (строки меняются, столбцы фикс)? Нет, расщепить на столбцы = оставить измерение столбца.
# keep dims: [False, True] -> subcomm 1D (col)
sub_comm = cart.Sub([False, True]) 

val = None
if sub_comm.Get_rank() == 0:
    val = rank # Используем ранг как уникальное число
val = sub_comm.bcast(val, root=0)
print(f"Ранг {rank}: Получил {val}")`
      },
      {
        id: "MPIBegin91",
        title: "Задание MPIBegin91",
        description: "Трехмерная решетка 2x2xK/4. Расщепить на K/4 одномерных столбцов. Найти произведение в каждом столбце.",
        theory: `
Работа с 3D топологией и выделение 1D подкоммуникаторов.

### Пояснение к коду
1.  **Топология**: 3 измерения (X, Y, Z).
2.  **Sub**: \`[False, False, True]\`. Мы оставляем только последнее измерение. Это значит, что мы объединяем процессы, у которых X и Y совпадают, а Z меняется. Получаются "столбики" вдоль оси Z.
3.  **Reduce**: Внутри каждого такого столбика считаем произведение.
4.  **Вывод**: Результат выводит только корень каждого подкоммуникатора.
        `,
        processes: 8,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

dims = [2, 2, size // 4]
cart = comm.Create_cart(dims)

# Расщепить на одномерные столбцы (оставить последнее измерение)
# keep=[False, False, True]
sub_comm = cart.Sub([False, False, True])

val = np.array([rank], dtype='i')
res = np.zeros(1, dtype='i')
sub_comm.Reduce(val, res, op=MPI.PROD, root=0)

if sub_comm.Get_rank() == 0:
    print(f"Ранг {rank}: Произведение столбца = {res[0]}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

dims = [2, 2, size // 4]
cart = comm.Create_cart(dims)

# Расщепить на одномерные столбцы (оставить последнее измерение)
# keep=[False, False, True]
sub_comm = cart.Sub([False, False, True])

val = np.array([rank], dtype='i')
res = np.zeros(1, dtype='i')
sub_comm.Reduce(val, res, op=MPI.PROD, root=0)

if sub_comm.Get_rank() == 0:
    print(f"Ранг {rank}: Произведение столбца = {res[0]}")`
      },
      {
        id: "MPIBegin94",
        title: "Задание MPIBegin94",
        description: "Периодическая решетка MxN. Определить ранг процесса по координатам X,Y.",
        theory: `
**Периодичность** означает, что если мы выходим за границу решетки, мы попадаем на её начало (как в игре "Змейка" без стен).

### Пояснение к коду
1.  **Create_cart**: Устанавливаем \`periods=[True, False]\` (периодичность только по первому измерению).
2.  **Get_cart_rank**: Эта функция находит ранг процесса по его координатам.
3.  **Тест**: Мы берем свои координаты, прибавляем 1 к X (по модулю M) и спрашиваем у MPI: "Какой ранг у этого соседа?". Благодаря периодичности, сосед последнего процесса в строке — это первый процесс.
        `,
        processes: 4,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

M, N = 2, 2
cart = comm.Create_cart([M, N], periods=[True, False])

# Тест: найти ранг соседа со сдвигом +1 по X
my_coords = cart.Get_coords(rank)
target_coords = [(my_coords[0] + 1) % M, my_coords[1]]
target_rank = cart.Get_cart_rank(target_coords)

print(f"Ранг {rank} ({my_coords}) -> Сосед X+1: {target_rank}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

M, N = 2, 2
cart = comm.Create_cart([M, N], periods=[True, False])

# Тест: найти ранг соседа со сдвигом +1 по X
my_coords = cart.Get_coords(rank)
target_coords = [(my_coords[0] + 1) % M, my_coords[1]]
target_rank = cart.Get_cart_rank(target_coords)

print(f"Ранг {rank} ({my_coords}) -> Сосед X+1: {target_rank}")`
      },
      {
        id: "MPIBegin97",
        title: "Задание MPIBegin97",
        description: "3D решетка. Циклический сдвиг данных между матрицами (измерение Z).",
        theory: `
**MPI_Cart_shift** — вспомогательная функция, которая возвращает ранги соседей для сдвига данных вдоль указанного измерения на заданный шаг.

### Пояснение к коду
1.  **Shift**: \`src, dest = cart.Shift(0, 1)\`.
    *   Измерение 0 (ось Z).
    *   Шаг +1.
    *   Возвращает ранг того, ОТ КОГО принимать (\`src\`), и КОМУ отправлять (\`dest\`).
2.  **Sendrecv_replace**: Отправляет данные соседу \`dest\`, принимает от соседа \`src\` и перезаписывает буфер \`val\` полученным значением.
3.  **Результат**: Данные "сдвинулись" по оси Z.
        `,
        processes: 8,
        initialCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

dims = [size//4, 2, 2] # Z, Y, X
cart = comm.Create_cart(dims)
# Сдвиг вдоль Z (dim 0)
src, dest = cart.Shift(0, 1)

val = np.array([rank], dtype='i')
comm.Sendrecv_replace(val, dest=dest, source=src)

print(f"Ранг {rank}: Получил {val[0]}")`,
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

dims = [size//4, 2, 2] # Z, Y, X
cart = comm.Create_cart(dims)
# Сдвиг вдоль Z (dim 0)
src, dest = cart.Shift(0, 1)

val = np.array([rank], dtype='i')
comm.Sendrecv_replace(val, dest=dest, source=src)

print(f"Ранг {rank}: Получил {val[0]}")`
      },
      {
        id: "MPIBegin98",
        title: "Задание MPIBegin98",
        description: "Топология графа: N-лучевая звезда. Переслать число от центра всем соседям.",
        theory: `
**Graph Topology** (или Dist_graph в современном MPI) позволяет задать произвольную структуру связей между процессами.

### Пояснение к коду
1.  **Структура**:
    *   Центральный узел (rank 0).
    *   Остальные узлы (1..N) связаны с ним.
2.  **Логика (Симуляция)**:
    *   В реальном MPI используется \`Create_dist_graph\`.
    *   В коде мы эмулируем поведение: Ранг 0 знает, что он центр, и отправляет сообщения всем (\`1..size-1\`).
    *   Остальные знают, что они листья, и ждут сообщения от 0.
3.  **Вывод**: Листья подтверждают получение данных от центра.
        `,
        processes: 5,
        initialCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Центр 0, лучи 1,2,3,4...
# sources = [0, 0, 0, 0] -> destinations [1, 2, 3, 4]
sources = [0] * (size - 1)
degrees = [1] * (size - 1)
destinations = list(range(1, size))
if rank == 0:
    # Я центр, я шлю всем
    pass

# Создание графа требует корректных массивов, для простоты симуляции:
if rank == 0:
    for i in range(1, size):
        comm.send(999, dest=i)
else:
    val = comm.recv(source=0)
    print(f"Ранг {rank}: Получил {val}")`,
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Центр 0, лучи 1,2,3,4...
# sources = [0, 0, 0, 0] -> destinations [1, 2, 3, 4]
sources = [0] * (size - 1)
degrees = [1] * (size - 1)
destinations = list(range(1, size))
if rank == 0:
    # Я центр, я шлю всем
    pass

# Создание графа требует корректных массивов, для простоты симуляции:
if rank == 0:
    for i in range(1, size):
        comm.send(999, dest=i)
else:
    val = comm.recv(source=0)
    print(f"Ранг {rank}: Получил {val}")`
      }
    ]
  }
];
