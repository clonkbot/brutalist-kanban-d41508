import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MED' | 'HIGH';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'TO DO',
    tasks: [
      { id: '1', title: 'DESIGN SYSTEM AUDIT', description: 'Review all components for consistency', priority: 'HIGH' },
      { id: '2', title: 'API DOCUMENTATION', description: 'Write comprehensive docs', priority: 'MED' },
      { id: '3', title: 'UNIT TESTS', description: 'Increase coverage to 80%', priority: 'LOW' },
    ],
  },
  {
    id: 'progress',
    title: 'IN PROGRESS',
    tasks: [
      { id: '4', title: 'DATABASE MIGRATION', description: 'Move to PostgreSQL', priority: 'HIGH' },
      { id: '5', title: 'PERFORMANCE OPT', description: 'Reduce load time by 50%', priority: 'MED' },
    ],
  },
  {
    id: 'done',
    title: 'DONE',
    tasks: [
      { id: '6', title: 'CI/CD PIPELINE', description: 'Automated deployments', priority: 'HIGH' },
    ],
  },
];

function App() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColumnId: string } | null>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MED' | 'HIGH'>('MED');

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, sourceColumnId: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask) return;

    if (draggedTask.sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    setColumns(prev => prev.map(col => {
      if (col.id === draggedTask.sourceColumnId) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.task.id) };
      }
      if (col.id === targetColumnId) {
        return { ...col, tasks: [...col.tasks, draggedTask.task] };
      }
      return col;
    }));

    setDraggedTask(null);
  };

  const addTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.toUpperCase(),
      description: newTaskDesc,
      priority: newTaskPriority,
    };

    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col
    ));

    setNewTaskColumn(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('MED');
  };

  const deleteTask = (columnId: string, taskId: string) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) } : col
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-600 text-white';
      case 'MED': return 'bg-yellow-400 text-black';
      case 'LOW': return 'bg-gray-300 text-black';
      default: return 'bg-gray-300 text-black';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="border-b-4 border-black p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none">
              KANBAN
            </h1>
            <p className="text-xs md:text-sm tracking-widest mt-1">TASK_MANAGEMENT_SYSTEM_V1.0</p>
          </div>
          <div className="text-xs md:text-sm font-mono text-right">
            <div>TASKS: {columns.reduce((acc, col) => acc + col.tasks.length, 0)}</div>
            <div>STATUS: OPERATIONAL</div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 min-h-[60vh]">
            {columns.map((column, colIndex) => (
              <div
                key={column.id}
                className="border-4 border-black flex flex-col bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
                style={{ animationDelay: `${colIndex * 100}ms` }}
              >
                {/* COLUMN HEADER */}
                <div className="border-b-4 border-black p-3 md:p-4 bg-black text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-xl font-bold tracking-wider">{column.title}</h2>
                    <span className="border-2 border-white px-2 py-1 text-xs font-mono">
                      {column.tasks.length}
                    </span>
                  </div>
                </div>

                {/* TASKS */}
                <div className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto max-h-[50vh] md:max-h-none">
                  {column.tasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task, column.id)}
                      className="border-4 border-black bg-white cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 group"
                      style={{ animationDelay: `${(colIndex * 100) + (taskIndex * 50)}ms` }}
                    >
                      <div className="border-b-2 border-black p-2 md:p-3 flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm md:text-base leading-tight break-words flex-1">
                          {task.title}
                        </h3>
                        <span className={`${getPriorityColor(task.priority)} px-2 py-1 text-xs font-bold border-2 border-black shrink-0`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="p-2 md:p-3 flex items-start justify-between gap-2">
                        <p className="text-xs md:text-sm text-gray-700 font-mono flex-1">{task.description}</p>
                        <button
                          onClick={() => deleteTask(column.id, task.id)}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 border-2 border-black hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center text-lg font-bold transition-all shrink-0"
                          aria-label="Delete task"
                        >
                          X
                        </button>
                      </div>
                      <div className="border-t-2 border-black px-2 md:px-3 py-1 bg-gray-100">
                        <span className="text-[10px] md:text-xs font-mono text-gray-500">ID:{task.id}</span>
                      </div>
                    </div>
                  ))}

                  {/* ADD TASK FORM */}
                  {newTaskColumn === column.id ? (
                    <div className="border-4 border-black border-dashed p-3 md:p-4 bg-white space-y-3">
                      <input
                        type="text"
                        placeholder="TASK TITLE"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full border-4 border-black p-2 md:p-3 font-bold text-sm md:text-base placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        className="w-full border-4 border-black p-2 md:p-3 font-mono text-xs md:text-sm placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100"
                      />
                      <div className="flex flex-wrap gap-2">
                        {(['LOW', 'MED', 'HIGH'] as const).map(p => (
                          <button
                            key={p}
                            onClick={() => setNewTaskPriority(p)}
                            className={`px-3 py-2 text-xs font-bold border-4 border-black transition-all ${
                              newTaskPriority === p
                                ? getPriorityColor(p) + ' shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-white hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addTask(column.id)}
                          className="flex-1 bg-black text-white border-4 border-black p-2 md:p-3 font-bold text-sm md:text-base hover:bg-green-500 hover:border-green-500 transition-all"
                        >
                          ADD TASK
                        </button>
                        <button
                          onClick={() => {
                            setNewTaskColumn(null);
                            setNewTaskTitle('');
                            setNewTaskDesc('');
                          }}
                          className="px-4 border-4 border-black p-2 md:p-3 font-bold text-sm md:text-base hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewTaskColumn(column.id)}
                      className="w-full border-4 border-black border-dashed p-3 md:p-4 text-gray-500 font-bold hover:bg-black hover:text-white hover:border-solid transition-all text-sm md:text-base"
                    >
                      + NEW TASK
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t-4 border-black p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-mono">
            <span className="border-2 border-black px-3 py-1">DRAG & DROP: ENABLED</span>
            <span className="border-2 border-black px-3 py-1">STORAGE: LOCAL</span>
          </div>
          <p className="text-xs text-gray-500 font-mono text-center md:text-right">
            Requested by @web-user · Built by @clonkbot
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
