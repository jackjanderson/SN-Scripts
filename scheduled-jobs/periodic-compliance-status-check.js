/**
 * =============================================================================
 * Script Type  : Scheduled Script Execution
 * Table        : sn_compliance_control, sn_compliance_test_result
 * When/Trigger : Run weekly
 * Description  : Evaluates the compliance status of all active controls based
 *                on their recent test results. Updates status to compliant,
 *                partially_compliant, or non_compliant. Auto-creates GRC
 *                issues for newly non-compliant controls.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Scheduled Jobs > Scheduled Script Executions
 *   - Name: Periodic Compliance Status Evaluation
 *   - Run: Weekly
 *   - Day: Monday
 *   - Time: 07:00
 *   - Paste this script in the "Run this script" field
 *
 * Dependencies:
 *   - Requires the GRCUtils Script Include (for createGRCIssue method)
 * =============================================================================
 */

(function() {
    var controlsChecked = 0;
    var statusChanges = 0;

    var control = new GlideRecord('sn_compliance_control');
    control.addQuery('active', true);
    control.query();

    while (control.next()) {
        controlsChecked++;
        var newStatus = evaluateControlEffectiveness(control);

        if (newStatus != control.compliance_status.toString()) {
            var oldStatus = control.compliance_status.toString();
            control.compliance_status = newStatus;
            control.last_evaluation_date = new GlideDateTime();
            control.work_notes = 'Compliance status automatically updated from "' +
                oldStatus + '" to "' + newStatus + '" by periodic evaluation.';
            control.update();
            statusChanges++;

            // If status changed to non-compliant, create an issue
            if (newStatus == 'non_compliant') {
                var grcUtils = new GRCUtils();
                grcUtils.createGRCIssue(
                    'Control ' + control.number + ' evaluated as Non-Compliant',
                    'sn_compliance_control',
                    control.sys_id.toString(),
                    '2' // High priority
                );
            }
        }
    }

    /**
     * Evaluates a control's effectiveness based on its recent test results.
     * Pass rate thresholds:
     *   >= 80% = compliant
     *   >= 50% = partially_compliant
     *   < 50%  = non_compliant
     *   No tests = not_assessed
     *
     * @param {GlideRecord} controlGR - The control record to evaluate
     * @returns {string} The compliance status value
     */
    function evaluateControlEffectiveness(controlGR) {
        var testResults = new GlideRecord('sn_compliance_test_result');
        testResults.addQuery('control', controlGR.sys_id);
        testResults.addQuery('active', true);
        testResults.orderByDesc('sys_created_on');
        testResults.setLimit(5); // Evaluate the last 5 test results
        testResults.query();

        var passCount = 0;
        var totalCount = 0;

        while (testResults.next()) {
            totalCount++;
            if (testResults.result == 'pass') {
                passCount++;
            }
        }

        if (totalCount == 0) return 'not_assessed';

        var passRate = (passCount / totalCount) * 100;

        if (passRate >= 80) return 'compliant';
        if (passRate >= 50) return 'partially_compliant';
        return 'non_compliant';
    }

    gs.info('Compliance Status Check: Evaluated {0} controls, {1} status changes',
        [controlsChecked, statusChanges]);
})();
