import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../../../lib/prisma"

// PATCH /api/todos/[id]/complete - Toggle todo completion status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const todoId = parseInt(id)

        if (isNaN(todoId)) {
            return NextResponse.json(
                { error: "Invalid todo ID" },
                { status: 400 }
            )
        }

        // Fetch current todo to toggle its completion status
        const currentTodo = await prisma.todo.findUnique({
            where: { id: todoId },
        })

        if (!currentTodo) {
            return NextResponse.json(
                { error: "Todo not found" },
                { status: 404 }
            )
        }

        const todo = await prisma.todo.update({
            where: { id: todoId },
            data: {
                completed: !currentTodo.completed,
            },
        })

        return NextResponse.json(todo)
    } catch (error) {
        console.error("Error toggling todo completion:", error)
        return NextResponse.json(
            { error: "Failed to toggle todo completion" },
            { status: 500 }
        )
    }
}
