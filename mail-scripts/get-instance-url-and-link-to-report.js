/**
 * =============================================================================
 * Script Type  : Mail Script
 * Table        : (used in email notifications)
 * When/Trigger : Included in email notification template
 * Description  : Generates a clickable "Click here" link pointing to a
 *                Performance Analytics dashboard on the current instance.
 *                Uses gs.getProperty() to get the instance URL dynamically.
 * =============================================================================
 * ServiceNow Setup:
 *   - Navigate to System Notification > Email > Mail Scripts
 *   - Create a new Mail Script with a descriptive name
 *   - Paste this script in the "Script" field
 *   - Reference it in an email template using: ${mail_script:your_script_name}
 *   - Update the dashboardLink path to match your target dashboard/report
 * =============================================================================
 */

// Mail script to print link that displays "Click here"

var instanceURL = gs.getProperty('glide.servlet.uri');

var dashboardLink = instanceURL + "/$pa_dashboardLinkhere";

var link = '<a href="' + dashboardLink + '">Click here</a>';

template.print(link);
