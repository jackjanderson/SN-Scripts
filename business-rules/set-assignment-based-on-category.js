/**
 * =============================================================================
 * Script Type  : Business Rule (Before)
 * Table        : sn_risk_risk
 * When/Trigger : Before Insert
 * Description  : Automatically assigns a risk to the appropriate group based
 *                on its category. Only sets the assignment group if the field
 *                is currently empty (does not override manual assignments).
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Business Rules
 *   - Table: Risk [sn_risk_risk]
 *   - When: Before
 *   - Insert: true
 *   - Advanced: checked
 *   - Paste this script in the "Script" field
 *   - Update the categoryGroupMap to match your organization's group names
 *   - Ensure the group names exactly match sys_user_group.name values
 * =============================================================================
 */

// Map risk categories to assignment group names
var categoryGroupMap = {
    'operational':  'IT Risk Management',
    'financial':    'Financial Risk Team',
    'compliance':   'Compliance Team',
    'strategic':    'Executive Risk Committee',
    'technology':   'IT Risk Management',
    'third_party':  'Vendor Risk Management'
};

// Only auto-assign if the assignment group is not already set
if (current.assignment_group.nil()) {
    var category = current.category.toString();
    var groupName = categoryGroupMap[category];

    if (groupName) {
        var groupGR = new GlideRecord('sys_user_group');
        groupGR.addQuery('name', groupName);
        groupGR.setLimit(1);
        groupGR.query();

        if (groupGR.next()) {
            current.assignment_group = groupGR.sys_id;
            gs.info('Auto-assigned risk {0} to group "{1}" based on category "{2}"',
                [current.number, groupName, category]);
        } else {
            gs.warn('Assignment group "{0}" not found for category "{1}" — risk {2} left unassigned',
                [groupName, category, current.number]);
        }
    }
}
