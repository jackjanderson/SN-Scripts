/**
 * =============================================================================
 * Script Type  : Client Script (onChange)
 * Table        : sn_risk_risk
 * When/Trigger : onChange of "risk_response" field
 * Description  : Dynamically shows/hides and sets mandatory state of fields
 *                based on the selected risk response type. When the user
 *                selects Mitigate, Accept, Transfer, or Avoid, the
 *                corresponding fields are shown and made mandatory.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Client Scripts
 *   - Table: Risk [sn_risk_risk]
 *   - Type: onChange
 *   - Field name: risk_response
 *   - Active: true
 *   - Paste the onChange function in the "Script" field
 * =============================================================================
 */

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') return;

    // Reset all conditional fields to hidden and not mandatory
    g_form.setMandatory('mitigation_plan', false);
    g_form.setMandatory('mitigation_owner', false);
    g_form.setVisible('mitigation_plan', false);
    g_form.setVisible('mitigation_owner', false);
    g_form.setMandatory('acceptance_justification', false);
    g_form.setVisible('acceptance_justification', false);
    g_form.setMandatory('transfer_details', false);
    g_form.setVisible('transfer_details', false);

    // Show and require fields based on the selected risk response
    switch (newValue) {
        case 'mitigate':
            g_form.setVisible('mitigation_plan', true);
            g_form.setMandatory('mitigation_plan', true);
            g_form.setVisible('mitigation_owner', true);
            g_form.setMandatory('mitigation_owner', true);
            break;

        case 'accept':
            g_form.setVisible('acceptance_justification', true);
            g_form.setMandatory('acceptance_justification', true);
            break;

        case 'transfer':
            g_form.setVisible('transfer_details', true);
            g_form.setMandatory('transfer_details', true);
            break;

        case 'avoid':
            // No additional fields required for avoidance
            break;
    }
}
