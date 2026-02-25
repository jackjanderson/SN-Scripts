/**
 * =============================================================================
 * Script Type  : Client Script (onLoad)
 * Table        : sn_risk_risk
 * When/Trigger : onLoad
 * Description  : Sets default values for new records, applies role-based
 *                field visibility, locks fields in closed state, and shows
 *                informational messages based on record state.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Client Scripts
 *   - Table: Risk [sn_risk_risk]
 *   - Type: onLoad
 *   - Active: true
 *   - Paste the onLoad function in the "Script" field
 * =============================================================================
 */

function onLoad() {
    var state = g_form.getValue('state');
    var isNew = g_form.isNewRecord();

    // --- Set defaults for new records ---
    if (isNew) {
        g_form.setValue('state', 'draft');
        g_form.setValue('risk_owner', g_user.userID);
    }

    // --- Role-based visibility ---
    var isAdmin = g_user.hasRole('sn_risk.admin');
    var isManager = g_user.hasRole('sn_risk.manager');

    if (!isAdmin && !isManager) {
        // Non-privileged users cannot see score override fields
        g_form.setReadOnly('risk_score', true);
        g_form.setReadOnly('risk_rating', true);
        g_form.setDisplay('override_score', false);
    }

    // --- State-based field control ---
    if (state == 'closed') {
        // Make most fields read-only when the risk is closed
        var fieldsToLock = [
            'risk_statement',
            'category',
            'likelihood',
            'impact',
            'risk_response',
            'risk_owner',
            'assignment_group'
        ];
        for (var i = 0; i < fieldsToLock.length; i++) {
            g_form.setReadOnly(fieldsToLock[i], true);
        }
    }

    // --- Info messages based on state ---
    if (state == 'draft') {
        g_form.addInfoMessage('This risk is in Draft state. Complete all required fields and submit for assessment.');
    } else if (state == 'assess') {
        g_form.addInfoMessage('This risk is under assessment. Review the risk details and approve or return to draft.');
    }
}
