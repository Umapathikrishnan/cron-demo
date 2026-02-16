import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Verify the cron secret to prevent unauthorized access
        const authHeader = request.headers.get('x-cron-secret');
        const expectedSecret = process.env.CRON_SECRET;

        if (!expectedSecret) {
            console.error('CRON_SECRET is not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        if (authHeader !== expectedSecret) {
            console.error('Unauthorized cron request');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('🔄 Running todo maintenance...');
        console.log('⏰ Current time:', new Date().toISOString());

        // TODO: Add your maintenance logic here
        // Example: Delete completed todos older than 30 days
        // const thirtyDaysAgo = new Date();
        // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // const deletedTodos = await prisma.todo.deleteMany({
        //   where: {
        //     completed: true,
        //     updatedAt: {
        //       lt: thirtyDaysAgo
        //     }
        //   }
        // });

        // Example: Mark overdue todos
        // const now = new Date();
        // const updatedTodos = await prisma.todo.updateMany({
        //   where: {
        //     dueDate: {
        //       lt: now
        //     },
        //     completed: false,
        //     // Add an 'overdue' field to your schema if needed
        //   },
        //   data: {
        //     // overdue: true
        //   }
        // });

        console.log('✅ Todo maintenance completed');

        return NextResponse.json({
            success: true,
            message: 'Cron job executed successfully',
            timestamp: new Date().toISOString(),
            // deletedCount: deletedTodos.count,
            // updatedCount: updatedTodos.count,
        });

    } catch (error) {
        console.error('Error in cron job:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
