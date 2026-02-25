# SN-Scripts: ServiceNow IRM/GRC Starter Scripts

A collection of practical, production-quality starter scripts for ServiceNow Integrated Risk Management (IRM) and Governance, Risk, and Compliance (GRC) development. These scripts serve as copy-paste references when working in a ServiceNow Personal Developer Instance (PDI) or project.

## Folder Structure

| Folder | Purpose |
|---|---|
| `business-rules/` | Server-side scripts that run on record insert, update, delete, or query |
| `client-scripts/` | Browser-side scripts that run on form load, field change, or form submit |
| `script-includes/` | Reusable server-side classes and client-callable AJAX handlers |
| `ui-actions/` | Form buttons and context menu actions with client and/or server logic |
| `scheduled-jobs/` | Scripts that run on a schedule (daily, weekly, etc.) |
| `fix-scripts/` | One-time data migration and cleanup scripts with DRY_RUN mode |
| `mail-scripts/` | Email template scripts for rich HTML notifications |
| `acl-scripts/` | Access Control List script conditions for field and record security |
| `catalog-and-flows/` | Service Catalog validation scripts and Flow Designer script steps |
| `utilities/` | Miscellaneous helper scripts (background scripts, tools) |

## Scripts

### Business Rules

| File | Type | Table | Description |
|---|---|---|---|
| `validate-required-fields-before-submit.js` | Before | sn_risk_risk | Validates required fields when submitting for assessment |
| `state-transition-validation.js` | Before | sn_risk_risk | Enforces valid state transitions using a state machine map |
| `cascade-update-related-records.js` | After | sn_compliance_control | Cascades state changes to related risks and issues via M2M |
| `auto-calculate-risk-score.js` | Before | sn_risk_risk | Calculates risk score from a 5x5 likelihood/impact matrix |
| `set-assignment-based-on-category.js` | Before | sn_risk_risk | Auto-assigns risks to groups based on category |
| `auto-populate-policy-from-control-objective.js` | Before | (configurable) | Auto-populates policy field from control objective M2M |
| `parse-excel-attachment-create-child-records.js` | After | (configurable) | Parses Excel attachment and creates child records |
| `validate-related-record-exists.js` | Before | sn_bia_impact_analysis | Validates vendor dependency exists before approval |

### Client Scripts

| File | Type | Description |
|---|---|---|
| `on-submit-required-field-validation.js` | onSubmit | Validates required fields with field-level error messages |
| `on-change-dynamic-mandatory-fields.js` | onChange | Toggles field visibility/mandatory based on risk response |
| `on-load-set-defaults-and-visibility.js` | onLoad | Sets defaults, role-based visibility, state-based locking |
| `on-change-cascading-reference-filter.js` | onChange | Cascading reference filter with GlideAjax |

### Script Includes

| File | Client Callable | Description |
|---|---|---|
| `GRCUtils.js` | No | Utility class: risk ratings, M2M traversal, issue counting, issue creation |
| `GRCAjaxUtils.js` | Yes | AJAX handler: score validation, reference qualifier filtering |

### UI Actions

| File | Table | Description |
|---|---|---|
| `submit-for-review.js` | sn_risk_risk | Confirmation dialog + state transition + notification event |
| `bulk-close-related-issues.js` | sn_compliance_control | Bulk-closes open issues linked to a closed control |

### Scheduled Jobs

| File | Frequency | Description |
|---|---|---|
| `overdue-task-notification.js` | Daily | Notifies overdue task assignees, escalates after 7 days |
| `periodic-compliance-status-check.js` | Weekly | Evaluates control effectiveness from test results |

### Fix Scripts

| File | Description |
|---|---|
| `bulk-update-records.js` | Bulk category remapping with DRY_RUN mode |
| `data-cleanup-orphaned-records.js` | Finds and cleans orphaned M2M records and issues |

### Mail Scripts, ACLs, Catalog & Flows

| File | Type | Description |
|---|---|---|
| `rich-notification-with-record-details.js` | Mail Script | HTML email with risk details, controls, and action button |
| `get-instance-url-and-link-to-report.js` | Mail Script | Simple link to a PA dashboard |
| `role-based-field-access.js` | ACL Script | Role + state-based field-level write control |
| `risk-exception-request-validation.js` | Catalog + Flow | Catalog onSubmit validation + Flow Designer script step |

### Utilities

| File | Description |
|---|---|
| `force-attachment-to-update-set.js` | Forces an attachment and its chunks into the current Update Set |

## How to Use These Scripts

These are **reference implementations**, not deployable Update Sets. Each script's header block describes exactly where to paste it in ServiceNow.

### Business Rules
1. Navigate to **System Definition > Business Rules**
2. Select the target table
3. Set **When** (Before/After), check Insert/Update/Delete as needed
4. Check **Advanced**
5. Paste the script in the **Script** field
6. Set the **Condition** field if specified in the header

### Client Scripts
1. Navigate to **System Definition > Client Scripts**
2. Select the target table
3. Set **Type** (onLoad, onChange, onSubmit)
4. For onChange: set the **Field name**
5. Paste the function in the **Script** field

### Script Includes
1. Navigate to **System Definition > Script Includes**
2. Set **Name** to match the class name exactly (e.g., `GRCUtils`)
3. Check **Client callable** if the script extends `AbstractAjaxProcessor`
4. Paste the entire class definition in the **Script** field

### UI Actions
1. Navigate to **System Definition > UI Actions**
2. Select the target table
3. Configure Show insert/update, Condition, and Client checkbox
4. For client+server actions: set **Onclick** function name and paste both portions

### Scheduled Jobs
1. Navigate to **System Definition > Scheduled Jobs > Scheduled Script Executions**
2. Set the schedule (Daily, Weekly, etc.)
3. Paste the script in the **Run this script** field

### Fix Scripts
1. Navigate to **System Definition > Fix Scripts**
2. **Always run with `DRY_RUN = true` first** and review logs
3. Check output in **System Logs > System Log > All**
4. Set `DRY_RUN = false` only after verifying the dry run output

### ACL Scripts
1. Navigate to **System Security > Access Control (ACL)**
2. Set Type, Operation, Table, and optionally Field
3. Add required roles in the **Roles** tab
4. Check **Advanced** and paste the script

### Mail Scripts
1. Navigate to **System Notification > Email > Mail Scripts**
2. Paste the script in the **Script** field
3. Reference in email templates using `${mail_script:script_name}`

## IRM/GRC Table Reference

| Table | Description |
|---|---|
| `sn_risk_risk` | Risk register |
| `sn_risk_assessment` | Risk assessments |
| `sn_risk_m2m_risk_control` | Risk-to-Control many-to-many |
| `sn_compliance_policy` | Compliance policies |
| `sn_compliance_control` | Compliance controls |
| `sn_compliance_control_objective` | Control objectives |
| `sn_compliance_test_result` | Control test results |
| `sn_compliance_m2m_policy_policy_statement` | Policy-to-Policy Statement M2M |
| `sn_compliance_m2m_policy_control` | Policy-to-Control M2M |
| `sn_compliance_m2m_control_objective_control` | Control Objective-to-Control M2M |
| `sn_audit_engagement` | Audit engagements |
| `sn_audit_audit_task_question` | Audit task questions |
| `sn_grc_issue` | GRC issues |
| `sn_grc_task` | GRC tasks |
| `sn_bia_dependency` | BIA dependencies |
| `sn_bia_impact_analysis` | BIA impact analyses |

## Conventions

- **File names**: Lowercase, hyphen-separated, `.js` extension
- **Headers**: Every file has a standardized block with Script Type, Table, Trigger, Description, and ServiceNow Setup instructions
- **Variable naming**: Short names (`gr`, `m2m`, `ga`) consistent with ServiceNow community conventions
- **Error handling**: `gs.addErrorMessage()` for user-facing errors, `gs.info()` / `gs.warn()` / `gs.error()` for logging
- **Abort pattern**: `current.setAbortAction(true)` in Before BRs to prevent saves
- **IIFE wrapping**: `(function executeRule(current, previous) { ... })(current, previous);` for After BRs and scheduled jobs
- **Fix scripts**: Always include a `DRY_RUN` flag with detailed logging

## Disclaimer

These scripts reference IRM/GRC plugin tables that require specific ServiceNow plugins to be activated:

- **Risk Management**: `com.sn_risk` (Risk [sn_risk_risk])
- **Compliance**: `com.sn_compliance` (Policy, Control, Control Objective)
- **Audit Management**: `com.sn_audit` (Engagement, Task Questions)
- **GRC Core**: `com.sn_grc` (Issues, Tasks)
- **BIA**: `com.sn_bia` (Dependencies, Impact Analysis)

Field names and table structures may vary by ServiceNow version, instance configuration, and whether you are working in a scoped or global application. Always verify table and field names against your target instance using the **System Dictionary** (`sys_dictionary.list`).
