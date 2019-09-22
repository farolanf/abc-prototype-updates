import Dashboard from './containers/Dashboard';
import Login from './containers/Login';
import SingleQueryPage from './containers/SingleQueryPage';
import BulkQueries from './containers/BulkQueries';
import FileUploadedPage from './containers/FileUploadedPage';
import UsersManagementPage from './containers/UsersManagementPage';
import EmailNotificationsPage from './containers/EmailNotificationsPage';
import SlaPage from './containers/SlaPage';

/**
 * Generate an object with all necessary fields to render a page.
 * @param {string} path - The page path
 * @param {string} title - THe page title (for SEO)
 * @param {Function} component - The component to be rendered. Containers can also be used
 * @param {string} description - The page description (for SEO) [OPTIONAL]
 * @param {string} keywords - The comma separated page keywords (for SEO) [OPTIONAL]
 * @returns {object}
 */
const createPage = (path, title, component, description, keywords) => ({
  path,
  title,
  description,
  keywords,
  component
});

export default [
  createPage('/', 'Login', Login),
  createPage('/dashboard', 'Dashboard', Dashboard),
  createPage('/login', 'Login', Login),
  createPage('/singleQueryPage', 'SingleQueryPage', SingleQueryPage),
  createPage('/bulkQueries', 'BulkQueries', BulkQueries),
  createPage('/fileUploadedPage', 'FileUploadedPage', FileUploadedPage),
  createPage('/usersManagementPage', 'UsersManagementPage', UsersManagementPage),
  createPage('/sla', 'SlaPage', SlaPage),
  createPage('/emailNotifications', 'EmailNotificationsPage', EmailNotificationsPage)
];
