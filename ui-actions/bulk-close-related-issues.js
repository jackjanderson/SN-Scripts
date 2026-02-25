/**
 * =============================================================================
 * Script Type  : UI Action (Form Button)
 * Table        : sn_compliance_control
 * When/Trigger : Form button click
 * Condition    : current.state == 'closed' && gs.hasRole('sn_grc.manager')
 * Description  : Bulk-closes all open GRC issues related to the current
 *                control record. Reports the count of closed issues and
 *                any errors encountered.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > UI Actions
 *   - Table: Control [sn_compliance_control]
 *   - Name: Bulk Close Related Issues
 *   - Show insert: false
 *   - Show update: true
 *   - Condition: current.state == 'closed' && gs.hasRole('sn_grc.manager')
 *   - Client: false (server-side only)
 *   - Paste this script in the "Script" field
 * =============================================================================
 */

var closedCount = 0;
var errorCount = 0;

var issues = new GlideRecord('sn_grc_issue');
issues.addQuery('source_record', current.sys_id);
issues.addQuery('state', '!=', 'closed');
issues.query();

while (issues.next()) {
    issues.state = 'closed';
    issues.close_notes = 'Bulk closed: Parent control ' + current.number +
        ' was closed on ' + new GlideDateTime().getDisplayValue();
    issues.closed_by = gs.getUserID();
    issues.closed_date = new GlideDateTime();

    if (issues.update()) {
        closedCount++;
    } else {
        errorCount++;
    }
}

if (closedCount > 0) {
    gs.addInfoMessage('Successfully closed ' + closedCount + ' related issue(s).');
}
if (errorCount > 0) {
    gs.addErrorMessage('Failed to close ' + errorCount + ' issue(s). Check system logs for details.');
}
if (closedCount == 0 && errorCount == 0) {
    gs.addInfoMessage('No open issues found for this record.');
}

action.setRedirectURL(current);
