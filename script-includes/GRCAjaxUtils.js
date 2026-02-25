/**
 * =============================================================================
 * Script Type  : Script Include (Client-callable, extends AbstractAjaxProcessor)
 * Table        : N/A (global utility)
 * When/Trigger : Called from Client Scripts via GlideAjax
 * Description  : Client-callable AJAX utility for IRM/GRC operations.
 *                Provides server-side validation and data retrieval that
 *                client scripts can invoke asynchronously.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Script Includes
 *   - Name: GRCAjaxUtils
 *   - Client callable: true (MUST be checked)
 *   - Accessible from: All application scopes (if cross-scope access needed)
 *   - Paste this script in the "Script" field
 *
 * Client-side usage example (from a Client Script):
 *   var ga = new GlideAjax('GRCAjaxUtils');
 *   ga.addParam('sysparm_name', 'validateRiskScoreOverride');
 *   ga.addParam('sysparm_risk_id', g_form.getUniqueValue());
 *   ga.addParam('sysparm_score', '20');
 *   ga.getXMLAnswer(function(answer) {
 *       var result = JSON.parse(answer);
 *       if (!result.valid) {
 *           g_form.addErrorMessage(result.message);
 *       }
 *   });
 * =============================================================================
 */

var GRCAjaxUtils = Class.create();
GRCAjaxUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /**
     * Validates if a risk score override is within acceptable bounds.
     * Business rule: override can't deviate more than 10 points from calculated score.
     *
     * Parameters (via this.getParameter()):
     *   sysparm_risk_id - sys_id of the risk record
     *   sysparm_score   - proposed override score
     *
     * @returns {string} JSON string: { valid: boolean, message: string }
     */
    validateRiskScoreOverride: function() {
        var riskSysId = this.getParameter('sysparm_risk_id');
        var proposedScore = parseInt(this.getParameter('sysparm_score'), 10);

        var result = { valid: false, message: '' };

        var gr = new GlideRecord('sn_risk_risk');
        if (gr.get(riskSysId)) {
            var calculatedScore = parseInt(gr.risk_score, 10);
            var maxDeviation = 10;

            if (Math.abs(proposedScore - calculatedScore) > maxDeviation) {
                result.message = 'Override score deviates more than ' + maxDeviation +
                    ' points from calculated score (' + calculatedScore +
                    '). Requires manager approval.';
            } else {
                result.valid = true;
                result.message = 'Score override is within acceptable range.';
            }
        } else {
            result.message = 'Risk record not found.';
        }

        return JSON.stringify(result);
    },

    /**
     * Gets controls filtered by a control objective (for cascading reference qualifiers).
     * Returns an encoded query suitable for use as a reference qualifier.
     *
     * Parameters (via this.getParameter()):
     *   sysparm_objective_id - sys_id of the control objective
     *
     * @returns {string} Encoded query (e.g., "sys_idINabc123,def456") or "sys_id=NULL"
     */
    getControlsByObjective: function() {
        var objectiveId = this.getParameter('sysparm_objective_id');
        var controlIds = [];

        var m2m = new GlideRecord('sn_compliance_m2m_control_objective_control');
        m2m.addQuery('sn_compliance_control_objective', objectiveId);
        m2m.query();
        while (m2m.next()) {
            controlIds.push(m2m.sn_compliance_control.toString());
        }

        if (controlIds.length > 0) {
            return 'sys_idIN' + controlIds.join(',');
        }
        return 'sys_id=NULL'; // No matching controls
    },

    type: 'GRCAjaxUtils'
});
