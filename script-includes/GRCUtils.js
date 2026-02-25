/**
 * =============================================================================
 * Script Type  : Script Include (Server-side, NOT client-callable)
 * Table        : N/A (global utility)
 * When/Trigger : Called from Business Rules, Scheduled Jobs, other Script Includes
 * Description  : Utility class for common IRM/GRC operations including risk
 *                rating calculations, M2M table traversal, compliance status
 *                checks, issue counting, and GRC issue creation.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Script Includes
 *   - Name: GRCUtils
 *   - Client callable: false (unchecked)
 *   - Accessible from: This application scope only (or All scopes if needed)
 *   - Paste this script in the "Script" field
 *
 * Usage examples:
 *   var utils = new GRCUtils();
 *   var rating = utils.getRiskRatingLabel(16);         // returns 'Critical'
 *   var controls = utils.getRelatedControls(riskSysId); // returns array of sys_ids
 *   var count = utils.getOpenIssueCount(entitySysId, 'source_record');
 *   var issueSysId = utils.createGRCIssue('Control failed', 'sn_compliance_control', controlSysId, '2');
 * =============================================================================
 */

var GRCUtils = Class.create();
GRCUtils.prototype = {
    initialize: function() {},

    /**
     * Returns the risk rating label for a given numeric score.
     * Based on a standard 5x5 risk matrix (scores 1-25).
     *
     * @param {number} score - The calculated risk score (1-25)
     * @returns {string} The risk rating label: Low, Medium, High, or Critical
     */
    getRiskRatingLabel: function(score) {
        score = parseInt(score, 10);
        if (isNaN(score) || score < 1) return 'Unknown';
        if (score <= 4) return 'Low';
        if (score <= 9) return 'Medium';
        if (score <= 15) return 'High';
        if (score <= 25) return 'Critical';
        return 'Unknown';
    },

    /**
     * Gets all control sys_ids related to a specific risk via the M2M table.
     *
     * @param {string} riskSysId - sys_id of the risk record
     * @returns {Array} Array of control sys_id strings
     */
    getRelatedControls: function(riskSysId) {
        var controls = [];
        var m2m = new GlideRecord('sn_risk_m2m_risk_control');
        m2m.addQuery('sn_risk_risk', riskSysId);
        m2m.query();
        while (m2m.next()) {
            controls.push(m2m.sn_compliance_control.toString());
        }
        return controls;
    },

    /**
     * Checks if all controls for a policy are in a compliant state.
     * Queries the policy-to-control M2M table and evaluates each control.
     *
     * @param {string} policySysId - sys_id of the policy record
     * @returns {object} { compliant: boolean, total: number, compliantCount: number }
     */
    checkPolicyComplianceStatus: function(policySysId) {
        var result = { compliant: true, total: 0, compliantCount: 0 };

        var m2m = new GlideRecord('sn_compliance_m2m_policy_control');
        m2m.addQuery('sn_compliance_policy', policySysId);
        m2m.query();

        while (m2m.next()) {
            result.total++;
            var control = new GlideRecord('sn_compliance_control');
            if (control.get(m2m.sn_compliance_control)) {
                if (control.compliance_status == 'compliant') {
                    result.compliantCount++;
                } else {
                    result.compliant = false;
                }
            }
        }

        return result;
    },

    /**
     * Gets the count of open issues for a given GRC entity using GlideAggregate.
     *
     * @param {string} entitySysId - sys_id of the parent entity
     * @param {string} entityField - field name on sn_grc_issue referencing the entity
     * @returns {number} Count of open issues
     */
    getOpenIssueCount: function(entitySysId, entityField) {
        var ga = new GlideAggregate('sn_grc_issue');
        ga.addQuery(entityField, entitySysId);
        ga.addQuery('state', '!=', 'closed');
        ga.addAggregate('COUNT');
        ga.query();
        if (ga.next()) {
            return parseInt(ga.getAggregate('COUNT'), 10);
        }
        return 0;
    },

    /**
     * Creates a GRC issue linked to a source record.
     *
     * @param {string} shortDescription - Description of the issue
     * @param {string} sourceTable - Table name of the source record
     * @param {string} sourceSysId - sys_id of the source record
     * @param {string} priority - Priority value (1=Critical, 2=High, 3=Moderate, 4=Low)
     * @returns {string} sys_id of the created issue, or null on failure
     */
    createGRCIssue: function(shortDescription, sourceTable, sourceSysId, priority) {
        var issue = new GlideRecord('sn_grc_issue');
        issue.initialize();
        issue.short_description = shortDescription;
        issue.source_table = sourceTable;
        issue.source_record = sourceSysId;
        issue.priority = priority || '3';
        issue.state = 'open';
        return issue.insert();
    },

    type: 'GRCUtils'
};
