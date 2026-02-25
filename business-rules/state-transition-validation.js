/**
 * =============================================================================
 * Script Type  : Business Rule (Before)
 * Table        : sn_risk_risk
 * When/Trigger : Before Update
 * Condition    : current.state.changes()
 * Description  : Enforces valid state transitions using a state machine map.
 *                Prevents users from skipping states (e.g., jumping from
 *                Draft directly to Closed). Shows allowed transitions in
 *                the error message.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Business Rules
 *   - Table: Risk [sn_risk_risk]
 *   - When: Before
 *   - Update: true
 *   - Condition: current.state.changes()
 *   - Advanced: checked
 *   - Paste this script in the "Script" field
 *   - Adjust the validTransitions map to match your workflow states
 * =============================================================================
 */

var validTransitions = {
    'draft':   ['assess'],
    'assess':  ['draft', 'treat'],
    'treat':   ['assess', 'monitor'],
    'monitor': ['treat', 'closed'],
    'closed':  ['monitor']
};

var oldState = previous.state.toString();
var newState = current.state.toString();

var allowedStates = validTransitions[oldState];

if (allowedStates) {
    if (allowedStates.indexOf(newState) == -1) {
        gs.addErrorMessage(
            'Invalid state transition from "' + oldState + '" to "' + newState +
            '". Allowed transitions from "' + oldState + '": ' + allowedStates.join(', ')
        );
        current.setAbortAction(true);
    }
} else {
    // Unknown current state — allow the transition but log a warning
    gs.warn('State transition validation: Unknown state "' + oldState + '" — no transitions defined');
}
