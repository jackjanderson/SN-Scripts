/**
 * =============================================================================
 * Script Type  : Scheduled Script Execution
 * Table        : sn_grc_task
 * When/Trigger : Run daily (e.g., 06:00 AM)
 * Description  : Finds all overdue GRC tasks, sends notification events to
 *                assignees, and escalates tasks overdue by more than 7 days
 *                to the assignment group manager (with priority increase).
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Scheduled Jobs > Scheduled Script Executions
 *   - Name: GRC Overdue Task Notification and Escalation
 *   - Run: Daily
 *   - Time: 06:00
 *   - Paste this script in the "Run this script" field
 *
 * Prerequisites:
 *   - Create events in System Policy > Events > Registry:
 *     1. grc.task.overdue (Table: sn_grc_task)
 *     2. grc.task.overdue.escalation (Table: sn_grc_task)
 *   - Create email notifications triggered by these events
 * =============================================================================
 */

(function() {
    var today = new GlideDateTime();
    var overdueCount = 0;
    var escalationCount = 0;

    var task = new GlideRecord('sn_grc_task');
    task.addQuery('state', '!=', 'closed');
    task.addQuery('state', '!=', 'cancelled');
    task.addQuery('due_date', '<', today);
    task.addQuery('active', true);
    task.query();

    while (task.next()) {
        overdueCount++;

        // Send notification event to the assignee
        gs.eventQueue('grc.task.overdue',
            task,
            task.assigned_to.email.toString(),
            task.number.toString()
        );

        // Calculate days overdue
        var dueDate = new GlideDateTime(task.due_date);
        var duration = GlideDateTime.subtract(dueDate, today);
        var daysOverdue = duration.getDayPart();

        // Escalate tasks overdue by more than 7 days
        if (daysOverdue > 7) {
            escalationCount++;

            // Notify the assignment group manager
            gs.eventQueue('grc.task.overdue.escalation',
                task,
                task.assignment_group.manager.email.toString(),
                daysOverdue.toString()
            );

            // Increase priority if not already at highest
            if (parseInt(task.priority) > 1) {
                task.priority = parseInt(task.priority) - 1;
                task.work_notes = 'Priority escalated by scheduled job — task is ' +
                    daysOverdue + ' days overdue.';
                task.update();
            }
        }
    }

    gs.info('GRC Overdue Task Job: Found {0} overdue tasks, escalated {1}',
        [overdueCount, escalationCount]);
})();
