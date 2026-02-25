/**
 * =============================================================================
 * Script Type  : UI Action (Form Button)
 * Table        : sn_risk_risk
 * When/Trigger : Form button click (visible when state is Draft)
 * Description  : Provides a "Submit for Review" button that shows a
 *                confirmation dialog, then transitions the risk to assessment
 *                state. Fires a notification event and redirects back to
 *                the record.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > UI Actions
 *   - Table: Risk [sn_risk_risk]
 *   - Name: Submit for Review
 *   - Show insert: false
 *   - Show update: true
 *   - Condition: current.state == 'draft'
 *   - Client: true (check this box)
 *   - Onclick: submitForReview()
 *   - Paste the CLIENT portion in the "Script" field under Client
 *   - Paste the SERVER portion in the "Script" field under Server
 *   - Set Action name: submit_for_review
 * =============================================================================
 */

// =============================================
// CLIENT-SIDE PORTION (Onclick script)
// =============================================
function submitForReview() {
    // Show a confirmation dialog before submitting
    var dialog = new GlideDialogWindow('glide_confirm_basic');
    dialog.setTitle('Submit for Review');
    dialog.setBody('Are you sure you want to submit this risk for review? ' +
        'This will notify the Risk Manager and transition the record to Assessment state.');
    dialog.setPreference('onPromptComplete', function() {
        // Set the state and submit the form
        g_form.setValue('state', 'assess');
        gsftSubmit(null, g_form.getFormElement(), 'submit_for_review');
    });
    dialog.render();
}

// =============================================
// SERVER-SIDE PORTION (Script)
// =============================================
if (typeof window == 'undefined') {
    current.state = 'assess';
    current.submitted_date = new GlideDateTime();
    current.update();

    // Fire a notification event
    // Create the event in System Policy > Events > Registry first:
    //   Name: risk.submitted_for_review
    //   Table: sn_risk_risk
    gs.eventQueue('risk.submitted_for_review',
        current,
        current.risk_owner.toString(),
        current.assignment_group.toString()
    );

    gs.addInfoMessage('Risk ' + current.number + ' has been submitted for review.');
    action.setRedirectURL(current);
}
