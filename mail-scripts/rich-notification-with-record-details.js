/**
 * =============================================================================
 * Script Type  : Mail Script
 * Table        : sn_risk_risk
 * When/Trigger : Included in email notification template
 * Description  : Builds a rich HTML email with a styled table of risk record
 *                details, a list of related controls (via M2M table traversal),
 *                and a direct "View Risk Record" button link.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Notification > Email > Mail Scripts
 *   - Name: risk_assessment_summary
 *   - Paste this script in the "Script" field
 *   - Reference in an email template: ${mail_script:risk_assessment_summary}
 *   - Used in notification: "Risk Assessment Complete" (or similar)
 *   - Available variable: current (the sn_risk_risk record)
 * =============================================================================
 */

(function runMailScript(current, template, email, email_action, event) {

    var instanceURL = gs.getProperty('glide.servlet.uri');
    var recordLink = instanceURL + 'sn_risk_risk.do?sys_id=' + current.sys_id;

    // Build HTML table of risk details
    var html = '<div style="font-family: Arial, sans-serif; max-width: 600px;">';
    html += '<h2 style="color: #333;">Risk Assessment Summary</h2>';
    html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';

    var fields = [
        { label: 'Risk Number',    value: current.number },
        { label: 'Risk Statement', value: current.risk_statement },
        { label: 'Category',       value: current.category.getDisplayValue() },
        { label: 'Risk Owner',     value: current.risk_owner.getDisplayValue() },
        { label: 'Likelihood',     value: current.likelihood.getDisplayValue() },
        { label: 'Impact',         value: current.impact.getDisplayValue() },
        { label: 'Risk Score',     value: current.risk_score },
        { label: 'Risk Rating',    value: current.risk_rating.getDisplayValue() },
        { label: 'State',          value: current.state.getDisplayValue() }
    ];

    for (var i = 0; i < fields.length; i++) {
        var bgColor = (i % 2 == 0) ? '#f9f9f9' : '#ffffff';
        html += '<tr style="background-color: ' + bgColor + ';">';
        html += '<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 40%;">' +
            fields[i].label + '</td>';
        html += '<td style="padding: 8px; border: 1px solid #ddd;">' +
            fields[i].value + '</td>';
        html += '</tr>';
    }
    html += '</table>';

    // Add related controls section
    html += '<h3 style="color: #555;">Related Controls</h3>';
    var m2m = new GlideRecord('sn_risk_m2m_risk_control');
    m2m.addQuery('sn_risk_risk', current.sys_id);
    m2m.query();

    if (m2m.hasNext()) {
        html += '<ul style="padding-left: 20px;">';
        while (m2m.next()) {
            var controlGR = new GlideRecord('sn_compliance_control');
            if (controlGR.get(m2m.sn_compliance_control)) {
                html += '<li style="margin-bottom: 4px;">' +
                    controlGR.number + ' — ' + controlGR.short_description +
                    ' (Status: ' + controlGR.state.getDisplayValue() + ')</li>';
            }
        }
        html += '</ul>';
    } else {
        html += '<p style="color: #999;">No related controls.</p>';
    }

    // Action button
    html += '<div style="margin-top: 20px; text-align: center;">';
    html += '<a href="' + recordLink + '" style="background-color: #0070d2; color: #ffffff; ' +
        'padding: 10px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">' +
        'View Risk Record</a>';
    html += '</div>';
    html += '</div>';

    template.print(html);

})(current, template, email, email_action, event);
