/**
 * =============================================================================
 * Script Type  : Business Rule (Before)
 * Table        : sn_risk_risk
 * When/Trigger : Before Insert and Update
 * Condition    : current.likelihood.changes() || current.impact.changes()
 * Description  : Automatically calculates a composite risk score using a 5x5
 *                risk matrix (likelihood x impact). Maps the score to a rating
 *                label (Low / Medium / High / Critical). Sets both fields on
 *                the current record — no .update() needed in a Before BR.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Definition > Business Rules
 *   - Table: Risk [sn_risk_risk]
 *   - When: Before
 *   - Insert: true, Update: true
 *   - Condition: current.likelihood.changes() || current.impact.changes()
 *   - Advanced: checked
 *   - Paste this script in the "Script" field
 *   - Adjust the matrix values and rating thresholds to match your org's
 *     risk appetite and scoring methodology
 * =============================================================================
 */

// 5x5 Risk Matrix: riskMatrix[likelihood][impact] = composite score
var riskMatrix = {
    '1': { '1': 1,  '2': 2,  '3': 3,  '4': 4,  '5': 5 },
    '2': { '1': 2,  '2': 4,  '3': 6,  '4': 8,  '5': 10 },
    '3': { '1': 3,  '2': 6,  '3': 9,  '4': 12, '5': 15 },
    '4': { '1': 4,  '2': 8,  '3': 12, '4': 16, '5': 20 },
    '5': { '1': 5,  '2': 10, '3': 15, '4': 20, '5': 25 }
};

var likelihood = current.likelihood.toString();
var impact = current.impact.toString();

// Guard clause: only calculate if both fields have values
if (likelihood && impact && riskMatrix[likelihood] && riskMatrix[likelihood][impact]) {
    var compositeScore = riskMatrix[likelihood][impact];

    // Map score to rating label
    var ratingLabel;
    if (compositeScore <= 4) {
        ratingLabel = 'low';
    } else if (compositeScore <= 9) {
        ratingLabel = 'medium';
    } else if (compositeScore <= 15) {
        ratingLabel = 'high';
    } else {
        ratingLabel = 'critical';
    }

    // Set fields directly — Before BR, no update() needed
    current.risk_score = compositeScore;
    current.risk_rating = ratingLabel;

    gs.info('Risk score calculated for {0}: likelihood={1}, impact={2}, score={3}, rating={4}',
        [current.number, likelihood, impact, compositeScore, ratingLabel]);
}
