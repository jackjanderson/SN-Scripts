/**
 * =============================================================================
 * Script Type  : ACL Script (Advanced condition)
 * Table        : sn_risk_risk
 * Field        : risk_score (field-level ACL)
 * Operation    : Write
 * Description  : Controls who can edit the risk_score field based on role
 *                and record state. Allows editing only for risk managers
 *                (who own the risk or manage the group) when the record is
 *                in an editable state. Admins can always edit.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Security > Access Control (ACL)
 *   - Create a new ACL:
 *     - Type: Record
 *     - Operation: Write
 *     - Name: sn_risk_risk.risk_score (field-level ACL)
 *     - Requires role: sn_risk.manager (add in the Roles tab)
 *     - Advanced: checked
 *   - Paste this script in the "Script" field (Advanced tab)
 *
 * Important:
 *   - The variable "answer" must be set to true (allow) or false (deny)
 *   - Available variables: current, gs, session
 *   - Field-level ACLs run AFTER table-level ACLs
 * =============================================================================
 */

// =============================================
// EXAMPLE 1: Field-level ACL — risk_score Write
// =============================================

// Define which states allow editing the risk score
var editableStates = ['assess', 'treat'];
var currentState = current.state.toString();

if (editableStates.indexOf(currentState) == -1) {
    // Field is read-only outside of editable states
    answer = false;
} else if (gs.hasRole('sn_risk.admin')) {
    // Admins can always edit in editable states
    answer = true;
} else if (gs.hasRole('sn_risk.manager')) {
    // Managers can edit only if they are the risk owner or manage the assignment group
    var userId = gs.getUserID();
    answer = (current.risk_owner == userId ||
              current.assignment_group.manager == userId);
} else {
    // All others: read-only
    answer = false;
}


// =============================================
// EXAMPLE 2: Record-level ACL — Restrict read
//            access to confidential risks
// (Uncomment and use as a separate ACL)
// =============================================
/*
// Table-level ACL: sn_risk_risk, Operation: Read
// Use case: Only specific roles can see risks classified as "confidential"

if (current.classification == 'confidential') {
    answer = gs.hasRole('sn_risk.admin') ||
             current.risk_owner == gs.getUserID() ||
             gs.getUser().isMemberOf(current.assignment_group);
} else {
    // Non-confidential risks are visible to anyone with the base role
    answer = true;
}
*/
