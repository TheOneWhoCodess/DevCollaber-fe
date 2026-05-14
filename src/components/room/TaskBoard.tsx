"use client";

import { useEffect, useState } from "react";
import { Plus, Circle, Clock, CheckCircle2, Trash2 } from "lucide-react";

type Status = "todo" | "inprogress" | "done";

interface Task {
    _id: string;
    title: string;
    status: Status;
    assignee?: { name: string; avatar: string };
    createdAt: string;
}

const columns: { key: Status; label: string; icon: React.ReactNode }[] = [
    { key: "todo", label: "To Do", icon: <Circle size={12} /> },
    { key: "inprogress", label: "In Progress", icon: <Clock size={12} /> },
    { key: "done", label: "Done", icon: <CheckCircle2 size={12} /> },
];

export default function TaskBoard({ projectId }: { projectId: string }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [adding, setAdding] = useState(false);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/tasks`, { headers })
            .then(r => r.json())
            .then(d => setTasks(d.tasks || []));
    }, [projectId]);

    const addTask = async () => {
        if (!newTask.trim()) return;
        setAdding(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/tasks`, {
            method: "POST",
            headers,
            body: JSON.stringify({ title: newTask }),
        });
        const data = await res.json();
        setTasks(prev => [...prev, data.task]);
        setNewTask("");
        setAdding(false);
    };

    const updateStatus = async (taskId: string, status: Status) => {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/tasks/${taskId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status }),
        });
    };

    const deleteTask = async (taskId: string) => {
        setTasks(prev => prev.filter(t => t._id !== taskId));
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/tasks/${taskId}`, {
            method: "DELETE", headers
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Add task */}
            <div className="flex gap-2">
                <input
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addTask()}
                    placeholder="Add a task..."
                    className="flex-1 liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none"
                />
                <button
                    onClick={addTask}
                    disabled={adding}
                    className="liquid-glass rounded-[12px] px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                    <Plus size={16} className="text-neon" />
                </button>
            </div>

            {/* Columns */}
            {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.key);
                return (
                    <div key={col.key} className="liquid-glass rounded-[24px] p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={col.key === "done" ? "text-neon" : col.key === "inprogress" ? "text-yellow-400" : "text-cream/30"}>
                                {col.icon}
                            </span>
                            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40">
                                {col.label}
                            </p>
                            <span className="ml-auto font-mono text-[10px] text-cream/20">{colTasks.length}</span>
                        </div>

                        {colTasks.length === 0 && (
                            <p className="font-mono text-[10px] uppercase text-cream/15 py-2">Empty</p>
                        )}

                        <div className="flex flex-col gap-2">
                            {colTasks.map(task => (
                                <div key={task._id} className="flex items-center gap-3 bg-white/5 rounded-[12px] px-3 py-2.5">
                                    <span className="font-mono text-[11px] uppercase text-cream/70 flex-1">
                                        {task.title}
                                    </span>
                                    {/* Status cycle */}
                                    <div className="flex gap-1">
                                        {columns.map(c => (
                                            <button
                                                key={c.key}
                                                onClick={() => updateStatus(task._id, c.key)}
                                                className={`w-2 h-2 rounded-full transition-all ${task.status === c.key
                                                    ? c.key === "done" ? "bg-neon" : c.key === "inprogress" ? "bg-yellow-400" : "bg-cream/40"
                                                    : "bg-white/10 hover:bg-white/20"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <button onClick={() => deleteTask(task._id)}>
                                        <Trash2 size={12} className="text-cream/20 hover:text-red-400 transition-colors" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}