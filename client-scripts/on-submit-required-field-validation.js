/**
 * =============================================================================
 * Script Type  : Client Script (onSubmit)
 * Table        : sn_risk_risk
 * When/Trigger : onSubmit
 * Description  : Validates required fields before form submission. Shows
 *                individual field-level error messages and a consolidated
 *                banner message. Returns false to stop form submission if
 *                any required fields are empty.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Client Scripts
 *   - Table: Risk [sn_risk_risk]
 *   - Type: onSubmit
 *   - Active: true
 *   - Paste the onSubmit function in the "Script" field
 * =============================================================================
 */

function onSubmit() {
    // Define required fields: internal name and display label
    var fields = [
        { name: 'risk_statement', label: 'Risk Statement' },
        { name: 'category', label: 'Category' },
        { name: 'risk_owner', label: 'Risk Owner' },
        { name: 'likelihood', label: 'Likelihood' },
        { name: 'impact', label: 'Impact' }
    ];

    var missingFields = [];

    for (var i = 0; i < fields.length; i++) {
        // Clear any previous field-level messages
        g_form.hideFieldMsg(fields[i].name);

        if (g_form.getValue(fields[i].name) == '') {
            missingFields.push(fields[i]);
        }
    }

    if (missingFields.length > 0) {
        // Show a consolidated banner error message
        var labels = [];
        for (var j = 0; j < missingFields.length; j++) {
            labels.push(missingFields[j].label);
            // Show individual field-level error messages
            g_form.showFieldMsg(missingFields[j].name, 'This field is required', 'error');
        }

        g_form.addErrorMessage('Please fill in the following required fields: ' + labels.join(', '));

        return false; // Stop form submission
    }

    return true; // Allow submission
}
