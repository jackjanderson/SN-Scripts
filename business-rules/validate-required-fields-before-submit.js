/**
 * =============================================================================
 * Script Type  : Business Rule (Before)
 * Table        : sn_risk_risk
 * When/Trigger : Before Insert and Update
 * Condition    : current.state == 'assess'
 * Description  : Validates that all required fields are populated before a risk
 *                record can be submitted for assessment. Collects all missing
 *                fields into a single error message and aborts the transaction.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Business Rules
 *   - Table: Risk [sn_risk_risk]
 *   - When: Before
 *   - Insert: true, Update: true
 *   - Condition: current.state == 'assess'
 *   - Advanced: checked
 *   - Paste this script in the "Script" field
 * =============================================================================
 */

var requiredFields = [
    { field: 'risk_statement', label: 'Risk Statement' },
    { field: 'category', label: 'Category' },
    { field: 'risk_owner', label: 'Risk Owner' },
    { field: 'likelihood', label: 'Likelihood' },
    { field: 'impact', label: 'Impact' }
];

var missingFields = [];

for (var i = 0; i < requiredFields.length; i++) {
    if (current[requiredFields[i].field].nil()) {
        missingFields.push(requiredFields[i].label);
    }
}

if (missingFields.length > 0) {
    gs.addErrorMessage('The following fields are required before submitting for assessment: ' + missingFields.join(', '));
    current.setAbortAction(true);
}
