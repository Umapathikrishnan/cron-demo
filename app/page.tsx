"use client"

import { useState, useEffect } from "react"

type Priority = "LOW" | "MEDIUM" | "HIGH"

interface Todo {
  id: number
  title: string
  description: string | null
  completed: boolean
  priority: Priority
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  useEffect(() => {
    fetchTodos()
  }, [filter])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== "all") params.append("filter", filter)

      const response = await fetch(`/api/todos?${params}`)
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error("Failed to fetch todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          priority,
          dueDate: dueDate || null,
        }),
      })

      if (response.ok) {
        setTitle("")
        setDescription("")
        setPriority("MEDIUM")
        setDueDate("")
        fetchTodos()
      }
    } catch (error) {
      console.error("Failed to add todo:", error)
    }
  }

  const toggleComplete = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}/complete`, {
        method: "PATCH",
      })

      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error("Failed to toggle todo:", error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error("Failed to delete todo:", error)
    }
  }

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
    setEditDescription(todo.description || "")
  }

  const saveEdit = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
        }),
      })

      if (response.ok) {
        setEditingId(null)
        fetchTodos()
      }
    } catch (error) {
      console.error("Failed to update todo:", error)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
    setEditDescription("")
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-gradient-to-r from-red-500 to-pink-500"
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
      case "LOW":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
    }
  }

  const getPriorityBorder = (priority: Priority) => {
    switch (priority) {
      case "HIGH":
        return "border-red-200"
      case "MEDIUM":
        return "border-yellow-200"
      case "LOW":
        return "border-green-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            ✨ Todo Master
          </h1>
          <p className="text-gray-600 text-lg">Organize your life with style</p>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <form onSubmit={addTodo} className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                required
              />
            </div>
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none transition-colors resize-none text-gray-800 placeholder-gray-400"
                rows={2}
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none transition-colors text-gray-800"
              >
                <option value="LOW">🟢 Low Priority</option>
                <option value="MEDIUM">🟡 Medium Priority</option>
                <option value="HIGH">🔴 High Priority</option>
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none transition-colors text-gray-800"
              />
              <button
                type="submit"
                className="flex-1 min-w-[120px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ➕ Add Todo
              </button>
            </div>
          </form>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white/60 backdrop-blur-sm p-2 rounded-xl shadow-md">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${filter === f
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-white/50"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Todo List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl">
            <p className="text-gray-500 text-lg">No todos yet. Create one above! 🎯</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 ${getPriorityBorder(
                  todo.priority
                )} p-5`}
              >
                {editingId === todo.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-800"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-400 focus:outline-none resize-none text-gray-800"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-500"
                          : "border-gray-300 hover:border-indigo-400"
                        }`}
                    >
                      {todo.completed && <span className="text-white text-sm">✓</span>}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-semibold ${todo.completed ? "line-through text-gray-400" : "text-gray-800"
                              }`}
                          >
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={`text-sm mt-1 ${todo.completed ? "text-gray-400" : "text-gray-600"}`}>
                              {todo.description}
                            </p>
                          )}
                          <div className="flex gap-3 mt-2 flex-wrap">
                            <span className={`text-xs px-3 py-1 rounded-full text-white ${getPriorityColor(todo.priority)}`}>
                              {todo.priority}
                            </span>
                            {todo.dueDate && (
                              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                📅 {new Date(todo.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(todo)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-gray-600">
            <span className="font-semibold text-indigo-600">{todos.filter((t) => !t.completed).length}</span> active •{" "}
            <span className="font-semibold text-green-600">{todos.filter((t) => t.completed).length}</span> completed
          </p>
        </div>
      </div>
    </div>
  )
}
