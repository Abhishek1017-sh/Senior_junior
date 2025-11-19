// Utility functions for the application

/**
 * Format date and time for display
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

/**
 * Format date only (without time)
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Check if user has a specific role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean} True if user has role
 */
export const hasRole = (userRole, requiredRole) => {
  if (userRole === 'both') return true;
  return userRole === requiredRole;
};

/**
 * Get initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials (e.g., "JD")
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

/**
 * Mask an email address for public display. Shows first character of local-part
 * and the full domain, e.g., "a***@gmail.com". Returns empty string if invalid.
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const parts = email.split('@');
  if (parts.length !== 2) return '';
  const [local, domain] = parts;
  if (local.length <= 1) return `*@${domain}`;
  const first = local[0];
  return `${first}***@${domain}`;
};

/**
 * Generic string masker that shows first N and last M characters and masks the rest
 */
export const maskString = (value, { showFirst = 1, showLast = 0 } = {}) => {
  if (!value || typeof value !== 'string') return '';
  if (value.length <= showFirst + showLast) return '*'.repeat(value.length);
  const first = value.slice(0, showFirst);
  const last = showLast ? value.slice(-showLast) : '';
  const middle = '*'.repeat(Math.max(3, value.length - showFirst - showLast));
  return `${first}${middle}${last}`;
};