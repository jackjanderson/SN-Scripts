/**
 * =============================================================================
 * Script Type  : Fix Script
 * Table        : Multiple (M2M tables, sn_grc_issue, sn_risk_assessment)
 * When/Trigger : Run manually (periodic data hygiene)
 * Description  : Identifies and optionally cleans up orphaned GRC records:
 *                M2M records where parent/child no longer exists, issues
 *                referencing deleted source records, and assessments linked
 *                to deleted risks. Generates a detailed report.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Fix Scripts
 *   - Name: GRC Data Cleanup - Orphaned Records
 *   - IMPORTANT: Run in sub-production first with DRY_RUN = true
 *   - Review the report output in System Logs
 *   - Set DRY_RUN = false to perform actual cleanup
 * =============================================================================
 */

(function() {
    var DRY_RUN = true;
    var report = [];

    // ----- Check 1: Orphaned risk-to-control M2M records -----
    report.push('=== Orphaned Risk-Control M2M Records ===');
    var orphanedM2M = findOrphanedM2M(
        'sn_risk_m2m_risk_control',  // M2M table
        'sn_risk_risk',              // field name for parent
        'sn_risk_risk',              // parent table
        'sn_compliance_control',     // field name for child
        'sn_compliance_control'      // child table
    );
    report.push('Found: ' + orphanedM2M + ' orphaned records');

    // ----- Check 2: Issues referencing deleted source records -----
    report.push('');
    report.push('=== Issues with Deleted Source Records ===');
    var orphanedIssues = findOrphanedIssuesBySource();
    report.push('Found: ' + orphanedIssues + ' orphaned issues');

    // ----- Check 3: Risk assessments referencing deleted risks -----
    report.push('');
    report.push('=== Risk Assessments with Deleted Risks ===');
    var orphanedAssessments = findOrphanedReference(
        'sn_risk_assessment',  // table to check
        'risk',                // reference field
        'sn_risk_risk'         // referenced table
    );
    report.push('Found: ' + orphanedAssessments + ' orphaned assessments');

    // Output the full report
    gs.info('Data Cleanup Report (DRY_RUN=' + DRY_RUN + '):\n' + report.join('\n'));

    /**
     * Finds M2M records where the parent or child record no longer exists.
     */
    function findOrphanedM2M(m2mTable, field1, table1, field2, table2) {
        var count = 0;
        var m2m = new GlideRecord(m2mTable);
        m2m.query();

        while (m2m.next()) {
            var parent = new GlideRecord(table1);
            var child = new GlideRecord(table2);

            if (!parent.get(m2m[field1]) || !child.get(m2m[field2])) {
                count++;
                gs.info('Orphaned M2M: {0} sys_id={1}', [m2mTable, m2m.sys_id]);
                if (!DRY_RUN) {
                    m2m.deleteRecord();
                }
            }
        }
        return count;
    }

    /**
     * Finds GRC issues whose source_record no longer exists in the source_table.
     */
    function findOrphanedIssuesBySource() {
        var count = 0;
        var issue = new GlideRecord('sn_grc_issue');
        issue.addNotNullQuery('source_record');
        issue.query();

        while (issue.next()) {
            var sourceTable = issue.source_table.toString();
            var sourceId = issue.source_record.toString();

            if (sourceTable && sourceId) {
                var source = new GlideRecord(sourceTable);
                if (!source.get(sourceId)) {
                    count++;
                    gs.info('Orphaned Issue: {0} (source: {1}/{2})',
                        [issue.number, sourceTable, sourceId]);
                    if (!DRY_RUN) {
                        issue.state = 'closed';
                        issue.close_notes = 'Auto-closed: Source record no longer exists.';
                        issue.update();
                    }
                }
            }
        }
        return count;
    }

    /**
     * Finds records in a table where a reference field points to a deleted record.
     */
    function findOrphanedReference(table, refField, refTable) {
        var count = 0;
        var gr = new GlideRecord(table);
        gr.addNotNullQuery(refField);
        gr.query();

        while (gr.next()) {
            var ref = new GlideRecord(refTable);
            if (!ref.get(gr[refField])) {
                count++;
                gs.info('Orphaned {0}: sys_id={1} references missing {2} record {3}',
                    [table, gr.sys_id, refTable, gr[refField]]);
            }
        }
        return count;
    }
})();
