/**
 * =============================================================================
 * Script Type  : Business Rule (After)
 * Table        : sn_audit_audit_task_question (or parent task table)
 * When/Trigger : After Insert
 * Description  : Parses an Excel attachment on the current record, reads the
 *                column headers dynamically, and creates child records
 *                (audit task questions) for each row in the spreadsheet.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Business Rules
 *   - Table: (your target table)
 *   - When: After
 *   - Insert: true
 *   - Advanced: checked
 *   - Paste this script in the "Script" field
 *   - Ensure the user has permissions to read sys_attachment
 * =============================================================================
 */

(function executeRule(current, previous /*null when async*/) {
    var attachment = new GlideRecord('sys_attachment');
    attachment.addQuery('table_sys_id', current.sys_id);
    attachment.setLimit(1);
    attachment.query();
    if (attachment.next()) {
        var sa = new GlideSysAttachment();
        var attachmentStream = sa.getContentStream(attachment.sys_id);
        var parser = new sn_impex.GlideExcelParser();
        parser.parse(attachmentStream);
        var headers = parser.getColumnHeaders();
        var header1 = headers[0];
        var header2 = headers[1];
        gs.info(header1 + " " + header2);
        while (parser.next()) {
            // var question = parser.getValue('Question');
            var row = parser.getRow();
            // print row value for both columns
            gs.info(row[header1] + ' ' + row[header2]);
            var gr = new GlideRecord('sn_audit_audit_task_question');
            gr.initialize();
            gr.u_question = row[header1];
            gr.insert();
        }
    }
})(current, previous);
