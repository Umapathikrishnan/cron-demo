import "dotenv/config"
import prisma from "../lib/prisma"

/**
 * Todo Maintenance Script
 * 
 * This script can be run by GitHub Actions cron job to perform
 * automated maintenance tasks on your todos.
 * 
 * Example tasks:
 * - Delete completed todos older than 30 days
 * - Send reminders for overdue todos
 * - Archive old todos
 * - Generate reports
 */

async function todoMaintenance() {
    console.log("🔄 Starting todo maintenance...")
    console.log(`⏰ Time: ${new Date().toISOString()}`)

    try {
        // Example 1: Count todos by status
        const totalTodos = await prisma.todo.count()
        const completedTodos = await prisma.todo.count({
            where: { completed: true },
        })
        const activeTodos = await prisma.todo.count({
            where: { completed: false },
        })

        console.log("\n📊 Todo Statistics:")
        console.log(`   Total: ${totalTodos}`)
        console.log(`   Active: ${activeTodos}`)
        console.log(`   Completed: ${completedTodos}`)

        // Example 2: Find overdue todos
        const overdueTodos = await prisma.todo.findMany({
            where: {
                completed: false,
                dueDate: {
                    lt: new Date(),
                },
            },
        })

        if (overdueTodos.length > 0) {
            console.log(`\n⚠️  Found ${overdueTodos.length} overdue todo(s):`)
            overdueTodos.forEach((todo) => {
                console.log(`   - ${todo.title} (Due: ${todo.dueDate})`)
            })
        }

        // Example 3: Clean up old completed todos (optional)
        // Uncomment to delete completed todos older than 30 days
        /*
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
        const deletedCount = await prisma.todo.deleteMany({
          where: {
            completed: true,
            updatedAt: {
              lt: thirtyDaysAgo,
            },
          },
        })
    
        if (deletedCount.count > 0) {
          console.log(`\n🗑️  Deleted ${deletedCount.count} old completed todo(s)`)
        }
        */

        console.log("\n✅ Todo maintenance completed successfully!")
    } catch (error) {
        console.error("❌ Error during todo maintenance:", error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// Run the maintenance script
todoMaintenance()
