import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"

// PATCH /api/todos/[id] - Update a todo
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

        const body = await request.json()
        const { title, description, priority, dueDate, completed } = body

        const updateData: any = {}

        if (title !== undefined) updateData.title = title.trim()
        if (description !== undefined) updateData.description = description?.trim() || null
        if (priority !== undefined) updateData.priority = priority
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
        if (completed !== undefined) updateData.completed = completed

        const todo = await prisma.todo.update({
            where: { id: todoId },
            data: updateData,
        })

        return NextResponse.json(todo)
    } catch (error: any) {
        console.error("Error updating todo:", error)

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Todo not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: "Failed to update todo" },
            { status: 500 }
        )
    }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
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

        await prisma.todo.delete({
            where: { id: todoId },
        })

        return NextResponse.json({ message: "Todo deleted successfully" })
    } catch (error: any) {
        console.error("Error deleting todo:", error)

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Todo not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: "Failed to delete todo" },
            { status: 500 }
        )
    }
}
