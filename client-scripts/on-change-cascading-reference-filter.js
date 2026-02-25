/**
 * =============================================================================
 * Script Type  : Client Script (onChange)
 * Table        : sn_compliance_control (or any table with cascading references)
 * When/Trigger : onChange of "control_objective" field
 * Description  : Implements a cascading reference filter. When the user selects
 *                a Control Objective, the Control reference field is filtered
 *                to only show controls linked to that objective. Demonstrates
 *                both the direct g_form approach and the GlideAjax approach.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Client Scripts
 *   - Table: (your target table with control_objective and control fields)
 *   - Type: onChange
 *   - Field name: control_objective
 *   - Active: true
 *   - Paste the onChange function in the "Script" field
 *   - Ensure GRCAjaxUtils Script Include exists and is client-callable
 * =============================================================================
 */

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') return;

    // Clear the dependent control field when the parent objective changes
    g_form.setValue('control', '');

    // ===================================================================
    // APPROACH 1: Simple reference qualifier using g_form
    // Use this when the relationship is a direct reference field
    // ===================================================================
    // g_form.addFilter('control', 'control_objective=' + newValue);

    // ===================================================================
    // APPROACH 2: GlideAjax for complex server-side filtering
    // Use this when the relationship requires M2M table traversal
    // or complex server-side logic
    // ===================================================================
    var ga = new GlideAjax('GRCAjaxUtils');
    ga.addParam('sysparm_name', 'getControlsByObjective');
    ga.addParam('sysparm_objective_id', newValue);
    ga.getXMLAnswer(function(answer) {
        if (answer) {
            // The server returns an encoded query like "sys_idINabc123,def456"
            g_form.addFilter('control', answer);

            // Add a visual indicator that the field is filtered
            g_form.addDecoration('control', 'icon-filter', 'Filtered by selected Control Objective');
        }
    });
}
