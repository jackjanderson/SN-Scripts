/**
 * =============================================================================
 * Script Type  : Catalog Client Script + Flow Designer Script Step
 * Table        : sc_cat_item (Risk Exception Request catalog item)
 * When/Trigger : onSubmit (catalog client script) / Script step in flow
 * Description  : Two-part script:
 *                PART 1 - Catalog Client Script that validates risk exception
 *                request variables on form submission.
 *                PART 2 - Flow Designer Script Step that creates the exception
 *                record and updates the associated risk.
 * =============================================================================
 * ServiceNow Setup (Part 1 - Catalog Client Script):
 *   - Navigate to Service Catalog > Catalog Definitions > Maintain Items
 *   - Open your Risk Exception Request catalog item
 *   - Go to the "Catalog Client Scripts" related list
 *   - Create new: Type = onSubmit, Active = true
 *   - Paste the PART 1 function in the Script field
 *
 * ServiceNow Setup (Part 2 - Flow Designer Script Step):
 *   - Open Flow Designer
 *   - Create/edit a flow triggered by: Record Created on sc_req_item
 *     where cat_item = Risk Exception Request
 *   - Add a "Script Step" action
 *   - Define inputs: riskSysId, justification, expirationDate, requestedBy
 *   - Paste the PART 2 function in the Script field
 *   - Map inputs from trigger data (fd_data.trigger.current.variables.*)
 * =============================================================================
 */

// =============================================
// PART 1: Catalog Client Script (onSubmit)
// =============================================
function onSubmit() {
    var riskRef = g_form.getValue('risk_reference');
    var justification = g_form.getValue('exception_justification');
    var expirationDate = g_form.getValue('exception_expiration');
    var approverRef = g_form.getValue('exception_approver');

    var errors = [];

    // Validate risk reference is selected
    if (!riskRef) {
        errors.push('Please select a Risk record.');
    }

    // Validate justification is at least 50 characters
    if (!justification || justification.length < 50) {
        errors.push('Exception justification must be at least 50 characters.');
    }

    // Validate expiration date
    if (!expirationDate) {
        errors.push('Exception expiration date is required.');
    } else {
        var today = new Date();
        var expDate = new Date(expirationDate);
        var oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (expDate <= today) {
            errors.push('Expiration date must be in the future.');
        }
        if (expDate > oneYearFromNow) {
            errors.push('Exception cannot exceed one year. For longer periods, contact GRC admin.');
        }
    }

    // Validate approver is selected
    if (!approverRef) {
        errors.push('An approver must be selected.');
    }

    // Show all errors and stop submission if any found
    if (errors.length > 0) {
        for (var i = 0; i < errors.length; i++) {
            g_form.addErrorMessage(errors[i]);
        }
        return false;
    }
    return true;
}


// =============================================
// PART 2: Flow Designer - Script Step
// =============================================
/**
 * Flow trigger: Record created on sc_req_item
 *   where cat_item = Risk Exception Request
 *
 * Script Step Inputs (configure in Flow Designer):
 *   riskSysId      (String): fd_data.trigger.current.variables.risk_reference
 *   justification  (String): fd_data.trigger.current.variables.exception_justification
 *   expirationDate (String): fd_data.trigger.current.variables.exception_expiration
 *   requestedBy    (Reference): fd_data.trigger.current.requested_for
 *
 * Script Step Outputs:
 *   exception_sys_id (String): sys_id of the created exception
 *   risk_number      (String): number of the associated risk
 */
(function execute(inputs, outputs) {

    // Create the risk exception record
    var exception = new GlideRecord('sn_risk_exception');
    exception.initialize();
    exception.risk = inputs.riskSysId;
    exception.justification = inputs.justification;
    exception.expiration_date = inputs.expirationDate;
    exception.requested_by = inputs.requestedBy;
    exception.state = 'pending_approval';
    var exceptionSysId = exception.insert();

    // Update the risk record with work notes about the pending exception
    var risk = new GlideRecord('sn_risk_risk');
    if (risk.get(inputs.riskSysId)) {
        risk.work_notes = 'Risk exception requested by ' +
            inputs.requestedBy.getDisplayValue() +
            '. Pending approval. Exception expires: ' + inputs.expirationDate;
        risk.update();
    }

    // Set outputs for downstream flow actions (e.g., approval, notifications)
    outputs.exception_sys_id = exceptionSysId;
    outputs.risk_number = risk.number ? risk.number.toString() : '';

})(inputs, outputs);
