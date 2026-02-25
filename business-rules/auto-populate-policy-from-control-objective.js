/**
 * =============================================================================
 * Script Type  : Business Rule (Before)
 * Table        : sn_compliance_m2m_policy_policy_statement (or related table)
 * When/Trigger : Before Insert
 * Description  : Auto-populates the Policy field based on the selected
 *                Control Objective (COBJ). Queries the policy-to-policy-statement
 *                M2M table to find the parent policy for the given statement.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Business Rules
 *   - Table: (your target table that has policy_statement and policy fields)
 *   - When: Before
 *   - Insert: true
 *   - Advanced: checked
 *   - Paste this script in the "Script" field
 * =============================================================================
 */

// before business rule - Auto Populate Policy based on COBJ

var gr = new GlideRecord('sn_compliance_m2m_policy_policy_statement');
gr.addQuery('content', current.policy_statement);
gr.query();

while (gr.next()) {
    current.policy = gr.document;
}
