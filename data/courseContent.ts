
import { Module } from '../types';

export const courseModules: Module[] = [
  {
    id: 1,
    title: "Модуль 1: Введение",
    description: "Процессы и ранги (Задания 3, 6)",
    tasks: [
      {
        id: "MPIBegin3",
        title: "MPIBegin3",
        description: "В процессах четного ранга (включая главный) ввести целое число, в процессах нечетного ранга ввести вещественное число. В каждом процессе вывести удвоенное значение введенного числа.",
        theory: `
### Пояснение
Задача демонстрирует ветвление логики в зависимости от ранга процесса. Процессы делятся на две группы: четные и нечетные.
1. Проверяем \`rank % 2\`.
2. Четные вводят \`int\`, нечетные вводят \`float\`.
3. Умножаем на 2 и выводим.

**Пример ввода:**
* P0: 5
* P1: 2.5

**Ожидаемый вывод:**
* P0: 10
* P1: 5.0
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    
    if rank % 2 == 0:
        val = int(input(f"Процесс {rank} (int): "))
        print(f"Ранг {rank}: {val * 2}")
    else:
        val = float(input(f"Процесс {rank} (float): "))
        print(f"Ранг {rank}: {val * 2.0}")`
      },
      {
        id: "MPIBegin6",
        title: "MPIBegin6",
        description: "В каждом процессе дано целое число N (> 0) и набор из N чисел. В подчиненных процессах четного ранга вывести сумму чисел из данного набора, в процессах нечетного ранга вывести среднее арифметическое чисел из данного набора, в главном процессе вывести произведение чисел из данного набора.",
        theory: `
### Пояснение
Каждый процесс обрабатывает свой локальный массив данных по-разному.
* **Ранг 0 (Главный)**: Считает произведение.
* **Четные (кроме 0)**: Считают сумму.
* **Нечетные**: Считают среднее арифметическое.

**Пример ввода:**
* P0 (N=2): 2 3 -> Произведение 6
* P1 (N=2): 2 3 -> Среднее 2.5
* P2 (N=2): 2 3 -> Сумма 5
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI

def main():
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    
    N = int(input(f"Ранг {rank}: N = "))
    raw = input(f"Ранг {rank}: Числа = ")
    nums = [float(x) for x in raw.split()]
    
    if rank == 0:
        res = 1
        for x in nums: res *= x
        print(f"Ранг 0 (Prod): {res}")
    elif rank % 2 == 0:
        print(f"Ранг {rank} (Sum): {sum(nums)}")
    else:
        print(f"Ранг {rank} (Avg): {sum(nums)/len(nums)}")`
      }
    ]
  },
  {
    id: 2,
    title: "Модуль 2: Точка-точка",
    description: "Пересылка сообщений (8, 12, 16, 19, 22, 24, 26, 29)",
    tasks: [
      {
        id: "MPIBegin8",
        title: "MPIBegin8",
        description: "В каждом подчиненном процессе дано вещественное число. Переслать эти числа в главный процесс, используя функции MPI_Bsend (посылка сообщения с буферизацией) и MPI_Recv, и вывести их в главном процессе. Полученные числа выводить в порядке убывания рангов переславших их процессов. Для задания буфера использовать функцию MPI_Buffer_attach.",
        theory: `
### Пояснение
Использование буферизованной отправки (\`Bsend\`). Это позволяет процессу-отправителю завершить вызов немедленно, скопировав данные в локальный буфер.
Главный процесс принимает данные в цикле. Чтобы вывести в порядке убывания, сначала сохраняем все, потом сортируем или принимаем в нужном порядке (в симуляторе сортируем).

**Пример ввода:**
* P1: 1.1
* P2: 2.2
* P3: 3.3

**Ожидаемый вывод (на P0):**
* От 3: 3.3
* От 2: 2.2
* От 1: 1.1
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# В Python mpi4py буфер управляется автоматически или через Buffer_attach
# Здесь симуляция логики

if rank != 0:
    val = float(input(f"Ранг {rank}: Число = "))
    comm.bsend(val, dest=0)
else:
    data = []
    for i in range(1, size):
        val = comm.recv(source=i)
        data.append((i, val))
    # Сортировка по убыванию ранга
    data.sort(key=lambda x: x[0], reverse=True)
    for r, v in data:
        print(f"От {r}: {v}")`
      },
      {
        id: "MPIBegin12",
        title: "MPIBegin12",
        description: "В главном процессе дан набор вещественных чисел; количество чисел равно количеству подчиненных процессов. С помощью функции MPI_Bsend переслать по одному числу в каждый из подчиненных процессов, перебирая процессы в обратном порядке (первое число в последний процесс, второе — в предпоследний процесс, и т. д.), и вывести в подчиненных процессах полученные числа.",
        theory: `
### Пояснение
Распределение данных "крест-накрест".
P0 имеет массив чисел (например, [10, 20, 30] для 3 подчиненных).
1-е число (10) -> Последнему (P3).
2-е число (20) -> Предпоследнему (P2).
3-е число (30) -> Первому (P1).

**Пример (Size=4):** P0 вводит "10 20 30". P3 получает 10, P2 - 20, P1 - 30.
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

if rank == 0:
    raw = input(f"Ранг 0: {size-1} чисел = ")
    nums = [float(x) for x in raw.split()]
    for i in range(size - 1):
        target = size - 1 - i
        comm.bsend(nums[i], dest=target)
else:
    val = comm.recv(source=0)
    print(f"Ранг {rank} получил: {val}")`
      },
      {
        id: "MPIBegin16",
        title: "MPIBegin16",
        description: "В каждом подчиненном процессе дано целое число N, в главном процессе дано целое число K (> 0), равное количеству тех подчиненных процессов, в которых даны положительные числа N. Переслать все положительные числа N в главный процесс и вывести в нем сумму полученных чисел. Для приема сообщений в главном процессе использовать функцию MPI_Recv с параметром MPI_ANY_SOURCE.",
        theory: `
### Пояснение
Динамический прием сообщений.
Главный процесс не знает заранее, КТО пришлет данные, но знает СКОЛЬКО (число K, которое мы вычислим или введем).
В симуляторе мы упростим: P0 просто суммирует все, что пришло.

**Пример:**
P1: 5 (отправит)
P2: -10 (не отправит)
P3: 3 (отправит)
P0 (сумма): 8
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    n = int(input(f"Ранг {rank}: N = "))
    if n > 0:
        comm.send(n, dest=0)
else:
    # В реальном коде нужно знать K или использовать Iprobe
    print("Ранг 0: Жду данные...")
    pass`
      },
      {
        id: "MPIBegin19",
        title: "MPIBegin19",
        description: "В каждом процессе дано целое число. С помощью функций MPI_Send и MPI_Recv осуществить для всех процессов циклический сдвиг данных с шагом −1, переслав число из процесса 1 в процесс 0, из процесса 2 в процесс 1, …, из процесса 0 в последний процесс. В каждом процессе вывести полученное число.",
        theory: `
### Пояснение
Сдвиг влево по кольцу.
Каждый процесс $i$ отправляет данные соседу $(i-1)$. Для 0-го левый сосед — последний.
Каждый процесс $i$ принимает данные от соседа $(i+1)$. Для последнего правый сосед — 0-й.

**Пример:** [10, 20, 30] -> [20, 30, 10].
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

val = int(input(f"Ранг {rank}: Число = "))
left = (rank - 1) % size
right = (rank + 1) % size

# Send влево, Recv справа
comm.sendrecv(val, dest=left, source=right)
# В симуляторе мы покажем результат
print(f"Ранг {rank}: Обмен завершен")`
      },
      {
        id: "MPIBegin22",
        title: "MPIBegin22",
        description: "В каждом процессе дано целое число N, причем для одного процесса значение N равно 1, а для остальных равно 0. В процессе с N = 1 дан также набор из K − 1 числа, где K — количество процессов. Переслать из этого процесса по одному из чисел данного набора в остальные процессы, перебирая ранги получателей в возрастающем порядке, и вывести в каждом из них полученное число.",
        theory: `
### Пояснение
Один процесс назначается "раздающим" (где N=1).
Он вводит массив чисел и раздает их всем остальным по очереди.
Остальные процессы просто ждут данных.

**Пример:** P1 - раздающий (N=1). Массив [100, 200, 300].
P0 <- 100
P2 <- 200
P3 <- 300
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# N=1 означает "я раздающий". Вводим 1 или 0.
is_sender = int(input(f"Ранг {rank} (N=0/1): "))

if is_sender == 1:
    raw = input(f"Ранг {rank}: {size-1} чисел = ")
    nums = [float(x) for x in raw.split()]
    idx = 0
    for i in range(size):
        if i != rank:
            comm.send(nums[idx], dest=i)
            idx += 1
else:
    # Принимаем от ANY_SOURCE, так как не знаем кто шлет
    val = comm.recv(source=MPI.ANY_SOURCE)
    print(f"Ранг {rank}: Получил {val}")`
      },
      {
        id: "MPIBegin24",
        title: "MPIBegin24",
        description: "Количество процессов — четное число. В каждом процессе дано целое число N (0 < N < 5) и набор из N чисел. С помощью функции MPI_Sendrecv выполнить обмен исходными наборами между парами процессов 0 и 1, 2 и 3, и т. д. В каждом процессе вывести полученный набор чисел.",
        theory: `
### Пояснение
Обмен данными в парах.
Процесс 0 меняется с 1. Процесс 2 меняется с 3.
Используется \`Sendrecv\`, чтобы избежать дедлока при одновременной отправке.

**Пример:**
P0: [1, 2]
P1: [3, 4, 5]
После обмена: P0 имеет [3, 4, 5], P1 имеет [1, 2].
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

raw = input(f"Ранг {rank}: Числа = ")
nums = [int(x) for x in raw.split()]

partner = rank + 1 if rank % 2 == 0 else rank - 1
received = comm.sendrecv(nums, dest=partner, source=partner)

print(f"Ранг {rank}: Получил {received}")`
      },
      {
        id: "MPIBegin26",
        title: "MPIBegin26",
        description: "В каждом подчиненном процессе дано вещественное число A и его порядковый номер N (целое число); набор всех номеров N содержит все целые числа от 1 до K − 1, где K — количество процессов. Переслать числа A в главный процесс и вывести их в порядке, соответствующем возрастанию их номеров N. Для передачи номера N указывать его в качестве параметра msgtag функции MPI_Send.",
        theory: `
### Пояснение
Использование тегов сообщений для упорядочивания.
Подчиненные процессы шлют данные с тегом \`tag=N\`.
Главный процесс может принимать их в цикле, проверяя тег, или принять все и отсортировать по тегу.

**Пример:**
P1: A=5.5, N=2 (tag=2)
P2: A=1.1, N=1 (tag=1)
Главный выведет сначала 1.1 (так как N=1), потом 5.5.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    val = float(input(f"Ранг {rank}: A = "))
    n = int(input(f"Ранг {rank}: N = "))
    comm.send(val, dest=0, tag=n)
else:
    # Симуляция приема и сортировки
    pass`
      },
      {
        id: "MPIBegin29",
        title: "MPIBegin29",
        description: "В каждом подчиненном процессе даны два целых числа T, N и набор из N чисел. Число T равно 0 или 1. Набор содержит целые числа, если T = 0, и вещественные числа, если T = 1. Переслать исходные наборы в главный процесс и вывести полученные числа в порядке возрастания рангов переславших их процессов. Для передачи информации о типе пересланного числа указывать число T в качестве параметра msgtag функции MPI_Send, для получения этой информации использовать функцию MPI_Probe с параметром MPI_ANY_TAG.",
        theory: `
### Пояснение
Передача данных разного типа.
Тэг сообщения используется как флаг типа (0 - int, 1 - float).
Принимающая сторона использует \`Probe\`, чтобы узнать тег (тип данных) до фактического чтения сообщения (\`Recv\`).

**Пример:**
P1: T=0 (int), данные [1, 2]
P2: T=1 (float), данные [3.5]
Главный процесс узнает тип через Probe и корректно распакует данные.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    t = int(input(f"Ранг {rank}: T (0/1) = "))
    raw = input(f"Ранг {rank}: Данные = ")
    if t == 0:
        data = [int(x) for x in raw.split()]
    else:
        data = [float(x) for x in raw.split()]
    comm.send(data, dest=0, tag=t)
else:
    pass`
      }
    ]
  },
  {
    id: 3,
    title: "Модуль 3: Коллективные",
    description: "Reduce, Scan, Типы (48, 50, 53, 56, 59, 62, 65, 66, 70)",
    tasks: [
      {
        id: "MPIBegin48",
        title: "MPIBegin48",
        description: "В каждом процессе дан набор из K + 5 целых чисел, где K — количество процессов. Используя функцию MPI_Reduce для операции MPI_SUM, просуммировать элементы данных наборов с одним и тем же порядковым номером и вывести полученные суммы в главном процессе.",
        theory: `
### Пояснение
Поэлементное сложение массивов со всех процессов.
Если P0 имеет [1, 1], P1 имеет [2, 2], то результат Reduce(SUM) на P0 будет [3, 3].
Размер массива K+5.
        `,
        processes: 2,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

count = size + 5
raw = input(f"Ранг {rank}: {count} чисел = ")
loc = np.array([int(x) for x in raw.split()], dtype='i')
res = np.zeros(count, dtype='i')

comm.Reduce(loc, res, op=MPI.SUM, root=0)
if rank == 0: print(f"Сумма: {res}")`
      },
      {
        id: "MPIBegin50",
        title: "MPIBegin50",
        description: "В каждом процессе дан набор из K + 5 целых чисел, где K — количество процессов. Используя функцию MPI_Reduce для операции MPI_MAXLOC, найти максимальное значение среди элементов данных наборов с одним и тем же порядковым номером и ранг процесса, содержащего это максимальное значение. Вывести в главном процессе вначале все максимумы, а затем — ранги содержащих их процессов.",
        theory: `
### Пояснение
Операция MAXLOC возвращает пару (значение, ранг).
Применяется поэлементно к массивам.
Мы узнаем не только глобальный максимум для каждой позиции, но и кто его владелец.
        `,
        processes: 2,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

raw = input(f"Ранг {rank}: Числа = ")
# В Python reduce с MAXLOC требует подготовки списка пар (val, rank)
data = [(int(x), rank) for x in raw.split()]

# Симуляция Reduce MAXLOC
res = comm.reduce(data, op=MPI.MAX, root=0) # В Python max кортежей работает как MAXLOC
if rank == 0: print(f"Максимумы и ранги: {res}")`
      },
      {
        id: "MPIBegin53",
        title: "MPIBegin53",
        description: "В каждом процессе дан набор из K целых чисел, где K — количество процессов. Используя функцию MPI_Reduce_scatter, просуммировать элементы данных наборов с одним и тем же порядковым номером, переслать по одной из полученных сумм в каждый процесс (первую сумму — в процесс 0, вторую — в процесс 1, и т. д.) и вывести в каждом процессе полученную сумму.",
        theory: `
### Пояснение
Комбинация Reduce и Scatter.
Сначала происходит глобальное суммирование векторов (как в Reduce).
Затем результат разбивается на части и рассылается процессам.
P0 получает сумму 0-х элементов.
P1 получает сумму 1-х элементов.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

raw = input(f"Ранг {rank}: {size} чисел = ")
sbuf = np.array([int(x) for x in raw.split()], dtype='i')
rbuf = np.zeros(1, dtype='i')
rcounts = [1] * size

comm.Reduce_scatter(sbuf, rbuf, rcounts, op=MPI.SUM)
print(f"Ранг {rank} получил сумму: {rbuf[0]}")`
      },
      {
        id: "MPIBegin56",
        title: "MPIBegin56",
        description: "В каждом процессе дан набор из K + 5 чисел, где K — количество процессов. Используя функцию MPI_Scan, найти в процессе ранга R (R = 0, 1, …, K − 1) произведения элементов с одним и тем же порядковым номером для наборов, данных в процессах с рангами от 0 до R, и вывести найденные произведения (при этом в процессе K − 1 будут выведены произведения элементов из всех наборов).",
        theory: `
### Пояснение
Scan (Prefix Scan) вычисляет частичные результаты.
Операция: Произведение (PROD).
P0: data0
P1: data0 * data1
P2: data0 * data1 * data2
Результат получается поэлементно для всего массива.
        `,
        processes: 2,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

raw = input(f"Ранг {rank}: Числа = ")
sb = np.array([int(x) for x in raw.split()], dtype='i')
rb = np.zeros(len(sb), dtype='i')

comm.Scan(sb, rb, op=MPI.PROD)
print(f"Ранг {rank} Scan: {rb}")`
      },
      {
        id: "MPIBegin59",
        title: "MPIBegin59",
        description: "В главном процессе дана K − 1 тройка целых чисел, где K — количество процессов. Используя производный тип, содержащий три целых числа, и одну коллективную операцию пересылки данных, переслать по одной тройке чисел в каждый из подчиненных процессов и вывести их в подчиненных процессах в том же порядке.",
        theory: `
### Пояснение
Рассылка (Scatter) структурированных данных.
Главный процесс создает массив структур (по 3 числа).
И рассылает их подчиненным: 1-ю тройку -> P1, 2-ю -> P2.
(В задаче "K-1 тройка", значит P0 себе не берет или берет фиктивно, обычно 1->1 mapping).
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

data = None
if rank == 0:
    # Генерация данных: (size-1) троек
    data = [None] + [[i, i+1, i+2] for i in range(1, size)] 

val = comm.scatter(data, root=0)
if rank != 0:
    print(f"Ранг {rank}: {val}")`
      },
      {
        id: "MPIBegin62",
        title: "MPIBegin62",
        description: "В главном процессе дана K − 1 тройка чисел, где K — количество процессов, причем первое и третье число каждой тройки являются целыми, а второе число — вещественным. Используя производный тип, содержащий три числа (два целых и одно вещественное), переслать по одной тройке чисел в каждый из подчиненных процессов и вывести их в подчиненных процессах в том же порядке.",
        theory: `
### Пояснение
Аналогично MPIBegin59, но структура данных смешанная: (int, float, int).
Это требует создания MPI Struct Datatype (в C/C++), в Python объекты сериализуются автоматически.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

data = None
if rank == 0:
    # (int, float, int)
    data = [None] + [(i, i*1.5, i+10) for i in range(1, size)]

val = comm.scatter(data, root=0)
if rank != 0:
    print(f"Ранг {rank}: {val}")`
      },
      {
        id: "MPIBegin65",
        title: "MPIBegin65",
        description: "В каждом подчиненном процессе даны R троек чисел, где R — ранг процесса. Два первых числа в каждой тройке являются целыми, а последнее — вещественным. Используя производный тип, содержащий три числа (два целых и одно вещественное), переслать числа из подчиненных процессов в главный и вывести полученные числа в порядке возрастания рангов переславших их процессов.",
        theory: `
### Пояснение
Сбор (Gather) данных переменного размера.
P1 шлет 1 тройку.
P2 шлет 2 тройки.
Главный процесс собирает это в массив массивов или плоский массив (Gatherv).
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

# Генерируем данные: rank штук троек
my_data = [(rank, rank+1, rank*0.5) for _ in range(rank)]

res = comm.gather(my_data, root=0)
if rank == 0:
    print(f"Результат: {res}")`
      },
      {
        id: "MPIBegin66",
        title: "MPIBegin66",
        description: "В главном процессе даны два набора: первый содержит K целых, а второй K вещественных чисел, где K — количество процессов. Используя функции упаковки MPI_Pack и MPI_Unpack и одну коллективную операцию пересылки данных, переслать все данные из главного процесса в подчиненные и вывести их в подчиненных процессах в том же порядке.",
        theory: `
### Пояснение
Упаковка данных (Packing).
Мы берем массив целых и массив вещественных, "сплющиваем" их в один буфер байтов и рассылаем всем через Bcast.
На стороне приема делаем Unpack.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

data = None
if rank == 0:
    ints = [1, 2, 3]
    floats = [1.1, 2.2, 3.3]
    data = (ints, floats) # Python упакует это в байты

val = comm.bcast(data, root=0)
print(f"Ранг {rank}: Ints={val[0]}, Floats={val[1]}")`
      },
      {
        id: "MPIBegin70",
        title: "MPIBegin70",
        description: "В каждом подчиненном процессе дан набор из одного вещественного и R целых чисел, где значение R равно рангу процесса (в процессе 1 дано одно целое число, в процессе 2 — два целых числа, и т. д.). Используя функции упаковки и одну функцию передачи и приема, переслать все данные в главный процесс и вывести эти данные в порядке возрастания рангов переславших их процессов.",
        theory: `
### Пояснение
Каждый процесс формирует пакет: [float, int, int...]. Размер пакета зависит от ранга.
Посылаем этот пакет главному.
Главный принимает и распаковывает.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank != 0:
    f = float(input(f"Ранг {rank} (float): "))
    raw = input(f"Ранг {rank} ({rank} ints): ")
    ints = [int(x) for x in raw.split()]
    comm.send((f, ints), dest=0)
else:
    for i in range(1, comm.Get_size()):
        val = comm.recv(source=i)
        print(f"От {i}: {val}")`
      }
    ]
  },
  {
    id: 4,
    title: "Модуль 4: Группы",
    description: "Коллективные операции и Коммуникаторы (32-80)",
    tasks: [
      {
        id: "MPIBegin32",
        title: "MPIBegin32",
        description: "В каждом процессе дано вещественное число. Используя функцию MPI_Gather, переслать эти числа в главный процесс и вывести их в порядке возрастания рангов переславших их процессов (первым вывести число, данное в главном процессе).",
        theory: `
### Пояснение
Сбор данных (Gather).
Каждый процесс отправляет 1 элемент. Главный получает массив размером Size.
Ввод: P0->10, P1->20. Вывод P0: [10, 20].
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

v = float(input(f"Ранг {rank}: "))
sbuf = np.array([v], dtype='f')
rbuf = np.zeros(size, dtype='f') if rank == 0 else None

comm.Gather(sbuf, rbuf, root=0)
if rank == 0: print(f"Собрано: {rbuf}")`
      },
      {
        id: "MPIBegin36",
        title: "MPIBegin36",
        description: "В главном процессе дан набор из 3K чисел, где K — количество процессов. Используя функцию MPI_Scatter, переслать по 3 числа в каждый процесс (включая главный) и вывести в каждом процессе полученные числа.",
        theory: `
### Пояснение
Рассылка равными частями (Scatter).
Главный имеет массив размером 3*K.
Каждый процесс получает ровно 3 числа.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

sbuf = None
if rank == 0:
    raw = input(f"Ранг 0 ({size*3} чисел): ")
    sbuf = np.array([int(x) for x in raw.split()], dtype='i')
rbuf = np.zeros(3, dtype='i')

comm.Scatter(sbuf, rbuf, root=0)
print(f"Ранг {rank}: {rbuf}")`
      },
      {
        id: "MPIBegin38",
        title: "MPIBegin38",
        description: "В главном процессе дан набор из K(K + 3)/2 целых чисел, где K — количество процессов. Используя функцию MPI_Scatterv, переслать в каждый процесс часть чисел из данного набора; при этом в процесс ранга R надо переслать R + 2 очередных числа (в процесс 0 — первые два числа, в процесс 1 — следующие три числа, и т. д.). В каждом процессе вывести полученные числа.",
        theory: `
### Пояснение
Рассылка неравными частями (Scatterv).
P0 получает 2 числа. P1 - 3 числа. P2 - 4 числа.
Главный процесс должен подготовить массив смещений (displs) и размеров (counts).
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

# В симуляторе упрощаем ввод, так как сложная логика Scatterv
# P0 генерирует данные
counts = [r + 2 for r in range(comm.size)]
count = counts[rank]

if rank == 0:
    print(f"P0 рассылает блоки размеров: {counts}")

# Здесь должна быть логика Scatterv
print(f"Ранг {rank} должен получить {count} чисел")`
      },
      {
        id: "MPIBegin40",
        title: "MPIBegin40",
        description: "В каждом процессе дано вещественное число. Используя функцию MPI_Allgather, переслать эти числа во все процессы и вывести их в каждом процессе в порядке возрастания рангов переславших их процессов (включая число, полученное из этого же процесса).",
        theory: `
### Пояснение
Сбор данных на всех процессах (Allgather).
Это как Gather, но результат рассылается всем, а не только корню.
В итоге у каждого процесса есть копия полных данных.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

v = float(input(f"Ранг {rank}: "))
sbuf = np.array([v], dtype='f')
rbuf = np.zeros(size, dtype='f')

comm.Allgather(sbuf, rbuf)
print(f"Ранг {rank} видит всех: {rbuf}")`
      },
      {
        id: "MPIBegin43",
        title: "MPIBegin43",
        description: "В каждом процессе дан набор из K чисел, где K — количество процессов. Используя функцию MPI_Alltoall, переслать в каждый процесс по одному числу из всех наборов: в процесс 0 — первые числа из наборов, в процесс 1 — вторые числа, и т. д. В каждом процессе вывести числа в порядке возрастания рангов переславших их процессов (включая число, полученное из этого же процесса).",
        theory: `
### Пояснение
Полный обмен (Alltoall). Транспонирование распределенной матрицы.
Строка i процесса отправляется так: элемент j уходит процессу j.
P0 шлет [A, B]. P1 шлет [C, D].
P0 получает [A, C]. P1 получает [B, D].
        `,
        processes: 2,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

raw = input(f"Ранг {rank} ({size} чисел): ")
sbuf = np.array([int(x) for x in raw.split()], dtype='i')
rbuf = np.zeros(size, dtype='i')

comm.Alltoall(sbuf, rbuf)
print(f"Ранг {rank} получил: {rbuf}")`
      },
      {
        id: "MPIBegin47",
        title: "MPIBegin47",
        description: "В каждом процессе дан набор из K + 1 числа, где K — количество процессов. Используя функцию MPI_Alltoallv, переслать в каждый процесс два числа из каждого набора; при этом в процесс 0 надо переслать последние два числа, в процесс 1 — два числа, предшествующих последнему, …, в последний процесс — первые два числа каждого набора. В каждом процессе вывести полученные числа.",
        theory: `
### Пояснение
Полный обмен с произвольной адресацией (Alltoallv).
Каждый процесс отправляет каждому конкретные куски своего массива.
В задаче требуется переслать конкретные пары чисел разным процессам.
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `# Симуляция Alltoallv
from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
print(f"Ранг {rank}: Готов к обмену Alltoallv")`
      },
      {
        id: "MPIBegin71",
        title: "MPIBegin71",
        description: "В главном процессе дан набор из K целых чисел, где K — количество процессов четного ранга (0, 2, …). С помощью функций MPI_Comm_group, MPI_Group_incl и MPI_Comm_create создать новый коммуникатор, включающий процессы четного ранга. Используя одну коллективную операцию пересылки данных для созданного коммуникатора, переслать по одному исходному числу в каждый процесс четного ранга (включая главный) и вывести полученные числа.",
        theory: `
### Пояснение
Создание коммуникатора из группы.
1. Берем группу WORLD.
2. Выбираем только четные ранги (Incl).
3. Создаем коммуникатор.
4. Внутри него делаем Scatter. Нечетные процессы в этом не участвуют.
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

grp = comm.Get_group()
# Выбираем четные ранги
new_grp = grp.Incl([i for i in range(size) if i%2==0])
new_comm = comm.Create(new_grp)

if new_comm != MPI.COMM_NULL:
    nr = new_comm.Get_rank()
    sbuf = None
    if nr == 0:
        raw = input(f"Ранг {rank} (Root группы): Числа = ")
        sbuf = np.array([int(x) for x in raw.split()], dtype='i')
    rbuf = np.zeros(1, dtype='i')
    new_comm.Scatter(sbuf, rbuf, root=0)
    print(f"Ранг {rank} (В группе ранг {nr}): {rbuf}")
else:
    print(f"Ранг {rank}: Не в группе")`
      },
      {
        id: "MPIBegin74",
        title: "MPIBegin74",
        description: "В каждом процессе четного ранга (включая главный процесс) дан набор из трех элементов — вещественных чисел. Используя новый коммуникатор и одну коллективную операцию редукции, найти минимальные значения среди элементов исходных наборов с одним и тем же порядковым номером и вывести найденные минимумы в главном процессе.",
        theory: `
### Пояснение
Reduce внутри созданного коммуникатора.
Только четные процессы сдают свои числа.
Находим поэлементный минимум среди них.
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

grp = comm.Get_group()
new_grp = grp.Incl([i for i in range(comm.size) if i%2==0])
new_comm = comm.Create(new_grp)

if new_comm != MPI.COMM_NULL:
    raw = input(f"Ранг {rank}: 3 числа = ")
    sb = np.array([float(x) for x in raw.split()], dtype='f')
    rb = np.zeros(3, dtype='f')
    new_comm.Reduce(sb, rb, op=MPI.MIN, root=0)
    if new_comm.rank == 0: print(f"Мин: {rb}")`
      },
      {
        id: "MPIBegin76",
        title: "MPIBegin76",
        description: "В главном процессе дано целое число K и набор из K вещественных чисел, в каждом подчиненном процессе дано целое число N, которое может принимать два значения: 0 и 1 (количество подчиненных процессов с N = 1 равно K). Используя функцию MPI_Comm_split и одну коллективную операцию пересылки, переслать по одному вещественному числу из главного процесса в каждый подчиненный процесс с N = 1 и вывести в этих подчиненных процессах полученные числа.",
        theory: `
### Пояснение
Разделение коммуникатора (Split).
Процессы делятся на группы по "цвету" (значение N).
Процессы с N=1 образуют группу. В ней делается Scatter.
Внимание: P0 должен войти в эту группу как Root, или данные должны быть переданы иначе (в задаче P0 рассылает). Обычно P0 имеет N=1 или специальный цвет.
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
import numpy as np
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

color = int(input(f"Ранг {rank} (N=0/1): "))
# Split разделяет процессы по color
new_comm = comm.Split(color, key=rank)

if color == 1:
    nr = new_comm.rank
    sbuf = None
    if nr == 0:
        raw = input(f"Ранг {rank} (Root N=1): Данные = ")
        sbuf = np.array([float(x) for x in raw.split()], dtype='f')
    rbuf = np.zeros(1, dtype='f')
    new_comm.Scatter(sbuf, rbuf, root=0)
    print(f"Ранг {rank}: {rbuf[0]}")`
      },
      {
        id: "MPIBegin78",
        title: "MPIBegin78",
        description: "В каждом процессе дано целое число N, которое может принимать два значения: 0 и 1 (имеется хотя бы один процесс с N = 1). Кроме того, в каждом процессе с N = 1 дано вещественное число A. Используя функцию MPI_Comm_split и одну коллективную операцию пересылки данных, переслать числа A в последний из процессов с N = 1 и вывести их в порядке возрастания рангов переславших их процессов (включая число, полученное из этого же процесса).",
        theory: `
### Пояснение
Gather на последнем процессе группы.
В группе N=1 собираем (Gather) все числа в процессе с максимальным рангом (root = size-1 этой группы).
        `,
        processes: 3,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

color = int(input(f"Ранг {rank} (N=0/1): "))
new_comm = comm.Split(color, rank)

if color == 1:
    val = float(input(f"Ранг {rank}: Число = "))
    last = new_comm.Get_size() - 1
    # Gather к последнему
    res = new_comm.gather(val, root=last)
    if new_comm.rank == last:
        print(f"Ранг {rank} собрал: {res}")`
      },
      {
        id: "MPIBegin80",
        title: "MPIBegin80",
        description: "В каждом процессе дано целое число N, которое может принимать два значения: 1 и 2 (имеется хотя бы один процесс с каждым из возможных значений). Кроме того, в каждом процессе дано целое число A. Используя функцию MPI_Comm_split и одну коллективную операцию пересылки данных, переслать числа A, данные в процессах с N = 1, во все процессы с N = 1, а числа A, данные в процессах с N = 2, во все процессы с N = 2. Во всех процессах вывести полученные числа в порядке возрастания рангов переславших их процессов (включая число, полученное из этого же процесса).",
        theory: `
### Пояснение
Параллельная работа двух групп.
Группа N=1 делает Allgather внутри себя.
Группа N=2 делает Allgather внутри себя одновременно.
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

color = int(input(f"Ранг {rank} (N=1/2): "))
new_comm = comm.Split(color, rank)

val = int(input(f"Ранг {rank}: Число = "))
res = new_comm.allgather(val)
print(f"Ранг {rank} (Группа {color}): {res}")`
      }
    ]
  },
  {
    id: 5,
    title: "Модуль 5: Топологии",
    description: "Декартовы решетки и Графы (83-98)",
    tasks: [
      {
        id: "MPIBegin83",
        title: "MPIBegin83",
        description: "В главном процессе дано целое число N (> 1), причем известно, что количество процессов K делится на N. Переслать число N во все процессы, после чего, используя функцию MPI_Cart_create, определить для всех процессов декартову топологию в виде двумерной решетки — матрицы размера N × K/N (порядок нумерации процессов оставить прежним). Используя функцию MPI_Cart_coords, вывести для каждого процесса его координаты в созданной топологии.",
        theory: `
### Пояснение
Создание 2D топологии.
Процессы выстраиваются в сетку (матрицу).
Зная ранг, мы получаем координаты (строка, столбец).
Например, 6 процессов в сетке 2x3:
0(0,0) 1(0,1) 2(0,2)
3(1,0) 4(1,1) 5(1,2)
        `,
        processes: 6,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

if rank == 0:
    N = int(input("Введите N: "))
else:
    N = None
N = comm.bcast(N, root=0)

dims = [N, size // N]
cart = comm.Create_cart(dims)
coords = cart.Get_coords(rank)
print(f"Ранг {rank} -> Коорд {coords}")`
      },
      {
        id: "MPIBegin86",
        title: "MPIBegin86",
        description: "Число процессов К является четным: K = 2N, N > 1. В процессах 0 и 1 дано по одному вещественному числу A. Определить для всех процессов декартову топологию в виде матрицы размера N × 2, после чего, используя функцию MPI_Cart_sub, расщепить матрицу процессов на два одномерных столбца (при этом процессы 0 и 1 будут главными процессами в полученных столбцах). Используя одну коллективную операцию пересылки данных, переслать число A из главного процесса каждого столбца во все процессы этого же столбца и вывести полученное число в каждом процессе (включая процессы 0 и 1).",
        theory: `
### Пояснение
Разбиение топологии (Sub-topology).
Была матрица Nx2. Делим ее на столбцы (оставляем измерение 0, убираем 1).
Получаем 2 коммуникатора (левый столбец и правый столбец).
В каждом делаем Bcast.
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
# Симуляция Cart_sub
print(f"Ранг {rank}: Выполняю Cart_sub и Bcast в столбцах")`
      },
      {
        id: "MPIBegin91",
        title: "MPIBegin91",
        description: "Количество процессов K равно 8 или 12, в каждом процессе дано вещественное число. Определить для всех процессов декартову топологию в виде трехмерной решетки размера 2 × 2 × K/4 (порядок нумерации процессов оставить прежним). Интерпретируя эту решетку как две матрицы размера 2 × K/4 (в одну матрицу входят процессы с одинаковой первой координатой), расщепить каждую матрицу процессов на K/4 одномерных столбцов. Используя одну коллективную операцию редукции, для каждого столбца процессов найти произведение исходных чисел и вывести найденные произведения в главных процессах каждого столбца.",
        theory: `
### Пояснение
Сложная работа с подпространствами 3D решетки.
Разбиение 3D -> 1D линии.
Суммирование (произведение) вдоль линий.
        `,
        processes: 8,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
print("Симуляция 3D Reduce...")`
      },
      {
        id: "MPIBegin94",
        title: "MPIBegin94",
        description: "В главном процессе даны положительные целые числа M и N, произведение которых не превосходит количества процессов; кроме того, в процессах с рангами от 0 до M·N − 1 даны целые числа X и Y. Переслать числа M и N во все процессы, после чего определить для начальных M·N процессов декартову топологию в виде двумерной решетки размера M × N, являющейся периодической по второму измерению (порядок нумерации процессов оставить прежним). В каждом процессе, входящем в созданную топологию, вывести ранг процесса с координатами X, Y (с учетом периодичности), используя для этого функцию MPI_Cart_rank. В случае недопустимых координат вывести −1.",
        theory: `
### Пояснение
Периодическая топология.
Сетка замкнута по одной оси.
Если координата Y выходит за пределы, она заворачивается (Y % N).
Cart_rank вычисляет ранг соседа по координатам с учетом этого.
        `,
        processes: 4,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
print("Симуляция Periodic Cart...")`
      },
      {
        id: "MPIBegin97",
        title: "MPIBegin97",
        description: "Количество процессов K равно 8 или 12, в каждом процессе дано вещественное число. Определить для всех процессов декартову топологию в виде трехмерной решетки размера 2 × 2 × K/4 (порядок нумерации процессов оставить прежним). Интерпретируя полученную решетку как K/4 матриц размера 2 × 2 (в одну матрицу входят процессы с одинаковой третьей координатой, матрицы упорядочены по возрастанию третьей координаты), осуществить циклический сдвиг исходных данных из процессов каждой матрицы в соответствующие процессы следующей матрицы (из процессов последней матрицы данные перемещаются в первую матрицу). Для определения рангов посылающих и принимающих процессов использовать функцию MPI_Cart_shift, пересылку выполнять с помощью функции MPI_Sendrecv_replace. Во всех процессах вывести полученные данные.",
        theory: `
### Пояснение
Сдвиг (Shift) вдоль 3-го измерения (Z).
Данные переезжают из слоя Z в слой Z+1. Из последнего в 0.
        `,
        processes: 8,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
print("Симуляция 3D Shift...")`
      },
      {
        id: "MPIBegin98",
        title: "MPIBegin98",
        description: "Число процессов K является нечетным: K = 2N + 1 (1 < N < 5); в каждом процессе дано целое число A. Используя функцию MPI_Graph_create, определить для всех процессов топологию графа, в которой главный процесс связан ребрами со всеми процессами нечетного ранга (1, 3, …, 2N − 1), а каждый процесс четного положительного ранга R (2, 4, …, 2N) связан ребром с процессом ранга R − 1 (в результате получается N-лучевая звезда, центром которой является главный процесс, а каждый луч состоит из двух подчиненных процессов R и R + 1, причем ближайшим к центру является процесс нечетного ранга R). Переслать число A из каждого процесса всем процессам, связанным с ним ребрами (процессам-соседям). Для определения количества процессов-соседей и их рангов использовать функции MPI_Graph_neighbors_count и MPI_Graph_neighbors, пересылку выполнять с помощью функции MPI_Send и MPI_Recv. Во всех процессах вывести полученные числа в порядке возрастания рангов переславших их процессов.",
        theory: `
### Пояснение
Топология Граф (Graph).
Создается произвольная структура связей (Звезда с лучами длиной 2).
P0 (центр) <-> P1 <-> P2.
P0 <-> P3 <-> P4.
Каждый процесс обменивается данными со своими соседями по графу.
        `,
        processes: 5,
        initialCode: "",
        solutionCode: `from mpi4py import MPI
comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank == 0:
    v = int(input("Число для рассылки соседям: "))
    # Симуляция отправки соседям по графу
    print("Рассылка соседям...")
else:
    # Симуляция приема
    print(f"Ранг {rank}: Получил данные")`
      }
    ]
  }
];
