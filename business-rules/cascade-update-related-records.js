/**
 * =============================================================================
 * Script Type  : Business Rule (After)
 * Table        : sn_compliance_control
 * When/Trigger : After Update
 * Condition    : current.state.changes()
 * Description  : When a compliance control's state changes, cascades updates
 *                to related risk records (via M2M table) and closes related
 *                GRC issues if the control becomes inactive.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Business Rules
 *   - Table: Control [sn_compliance_control]
 *   - When: After
 *   - Update: true
 *   - Condition: current.state.changes()
 *   - Advanced: checked
 *   - Paste this script in the "Script" field
 * =============================================================================
 */

(function executeRule(current, previous) {

    // Update related risk records via the risk-to-control M2M table
    var m2m = new GlideRecord('sn_risk_m2m_risk_control');
    m2m.addQuery('sn_compliance_control', current.sys_id);
    m2m.query();

    while (m2m.next()) {
        var riskGR = new GlideRecord('sn_risk_risk');
        if (riskGR.get(m2m.sn_risk_risk)) {
            riskGR.last_control_review = new GlideDateTime();
            riskGR.work_notes = 'Related control ' + current.number +
                ' state changed from ' + previous.state.getDisplayValue() +
                ' to ' + current.state.getDisplayValue();
            riskGR.update();
            gs.info('Cascade update: Updated risk {0} due to control {1} state change', [riskGR.number, current.number]);
        }
    }

    // If the control moved to an inactive/retired state, close related GRC issues
    var inactiveStates = ['retired', 'inactive', 'not_applicable'];
    if (inactiveStates.indexOf(current.state.toString()) > -1) {
        var issues = new GlideRecord('sn_grc_issue');
        issues.addQuery('source_record', current.sys_id);
        issues.addQuery('state', '!=', 'closed');
        issues.query();

        while (issues.next()) {
            issues.state = 'closed';
            issues.close_notes = 'Auto-closed: Parent control ' + current.number +
                ' moved to ' + current.state.getDisplayValue() + ' state.';
            issues.update();
            gs.info('Cascade update: Closed issue {0} for inactive control {1}', [issues.number, current.number]);
        }
    }

})(current, previous);
