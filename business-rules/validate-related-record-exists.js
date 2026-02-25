/**
 * =============================================================================
 * Script Type  : Business Rule (Before)
 * Table        : sn_bia_impact_analysis (or BIA-related table)
 * When/Trigger : Before Update
 * Condition    : State changes to "Pending Approval" or "In Review"
 * Description  : Validates that at least one Vendor Dependency record exists
 *                before allowing the record to proceed to review/approval.
 *                Aborts the transaction with an error message if none found.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Business Rules
 *   - Table: sn_bia_impact_analysis (or your BIA table)
 *   - When: Before
 *   - Update: true
 *   - Condition: State changes to Pending Approval OR In Review
 *   - Advanced: checked
 *   - Paste this script in the "Script" field
 * =============================================================================
 */

// Before BR on update
// When state changes to Pending approval OR In review
// Was implemented on BIA analysis to validate that at least one Vendor
// Dependency record was created when certain conditions were met

var gr = new GlideRecord('sn_bia_dependency');
gr.addQuery('impact_analysis', current.sys_id);
gr.addQuery('dependency_group.element_definition.name', 'LIKE', 'Vendors');
gr.query();
if (gr.getRowCount() == 0) {
    gs.addErrorMessage("At least one Vendor Dependency record must be created to continue when impact rating is greater than 50");
    current.setAbortAction(true);
}
