/**
 * =============================================================================
 * Script Type  : Fix Script / Background Script
 * Table        : sys_attachment, sys_attachment_doc
 * When/Trigger : Run manually from Scripts - Background
 * Description  : Forces a specific attachment (and its binary chunks) into
 *                the current Update Set. Useful when an attachment is not
 *                captured automatically by the update set picker.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Scripts - Background
 *   - Update the sys_id on line 19 to match your target attachment
 *   - Run the script
 *   - Verify the attachment appears in your current Update Set
 * =============================================================================
 */

// Query for the record
var rec = new GlideRecord('sys_attachment');
rec.get('3aa94bfedbf52150c497ab0b13961919');
addAttachmentToUpdateSet(rec);

function addAttachmentToUpdateSet(attachmentGR) {
    var um = new GlideUpdateManager2();
    um.saveRecord(attachmentGR);

    var attdoc = new GlideRecord('sys_attachment_doc');
    attdoc.addQuery('sys_attachment', attachmentGR.sys_id);
    attdoc.orderBy('position');
    attdoc.query();
    while (attdoc.next()) {
        um.saveRecord(attdoc);
    }
}
