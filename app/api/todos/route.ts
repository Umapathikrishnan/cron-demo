import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../lib/prisma"

// GET /api/todos - Fetch all todos with optional filtering
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const filter = searchParams.get("filter") // 'all', 'active', 'completed'
        const priority = searchParams.get("priority") // 'LOW', 'MEDIUM', 'HIGH'

        const where: any = {}

        if (filter === "active") {
            where.completed = false
        } else if (filter === "completed") {
            where.completed = true
        }

        if (priority) {
            where.priority = priority
        }

        const todos = await prisma.todo.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(todos)
    } catch (error) {
        console.error("Error fetching todos:", error)
        return NextResponse.json(
            { error: "Failed to fetch todos" },
            { status: 500 }
        )
    }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, description, priority, dueDate } = body

        if (!title || title.trim() === "") {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            )
        }

        const todo = await prisma.todo.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                priority: priority || "MEDIUM",
                dueDate: dueDate ? new Date(dueDate) : null,
            },
        })

        return NextResponse.json(todo, { status: 201 })
    } catch (error) {
        console.error("Error creating todo:", error)
        return NextResponse.json(
            { error: "Failed to create todo" },
            { status: 500 }
        )
    }
}
