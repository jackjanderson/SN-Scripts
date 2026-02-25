/**
 * =============================================================================
 * Script Type  : Fix Script
 * Table        : sn_risk_risk
 * When/Trigger : Run manually (one-time or as needed)
 * Description  : Bulk updates risk records to remap old category values to
 *                new ones after a taxonomy change. Includes a DRY_RUN mode
 *                to preview changes before executing, batch size limiting,
 *                and detailed logging.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Fix Scripts
 *   - Name: Bulk Update Risk Categories
 *   - IMPORTANT: Run in sub-production first with DRY_RUN = true
 *   - Review the output in System Logs > System Log > All
 *   - Once verified, set DRY_RUN = false and run again
 *   - Update the categoryMapping object to match your remapping needs
 * =============================================================================
 */

(function() {
    var DRY_RUN = true; // SET TO false TO EXECUTE UPDATES
    var BATCH_SIZE = 200;

    // Map old category values to new category values
    var categoryMapping = {
        'it_risk':          'technology',
        'information_risk': 'technology',
        'vendor_risk':      'third_party',
        'supplier_risk':    'third_party',
        'legal_risk':       'compliance',
        'regulatory_risk':  'compliance'
    };

    var updatedCount = 0;
    var errorCount = 0;
    var skippedCount = 0;

    // Build an encoded query for all old categories
    var oldCategories = Object.keys(categoryMapping);
    var encodedQuery = 'categoryIN' + oldCategories.join(',');

    var gr = new GlideRecord('sn_risk_risk');
    gr.addEncodedQuery(encodedQuery);
    gr.setLimit(BATCH_SIZE);
    gr.query();

    gs.info('Fix Script: Found {0} records to process (DRY_RUN={1})',
        [gr.getRowCount(), DRY_RUN]);

    while (gr.next()) {
        var oldCategory = gr.category.toString();
        var newCategory = categoryMapping[oldCategory];

        if (!newCategory) {
            skippedCount++;
            continue;
        }

        if (DRY_RUN) {
            gs.info('DRY RUN: Would update {0} category from "{1}" to "{2}"',
                [gr.number, oldCategory, newCategory]);
        } else {
            gr.category = newCategory;
            gr.work_notes = 'Category remapped from "' + oldCategory +
                '" to "' + newCategory + '" by fix script.';
            gr.setWorkflow(false);   // Prevent business rules from firing
            gr.autoSysFields(false); // Preserve sys_updated_on and sys_updated_by
            if (gr.update()) {
                updatedCount++;
            } else {
                errorCount++;
                gs.error('Fix Script: Failed to update record {0}', [gr.number]);
            }
        }
    }

    gs.info('Fix Script Complete: Updated={0}, Errors={1}, Skipped={2}',
        [updatedCount, errorCount, skippedCount]);
})();
