/**
 * Authentication Middleware for Passport.js
 * ES6 Module Version
 */

/**
 * Middleware to ensure user is authenticated
 * Use this to protect routes that require login
 *
 * @example
 * router.get('/profile', ensureAuthenticated, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    error: "Unauthorized - Please log in",
    authenticated: false,
  });
}

/**
 * Middleware to ensure user is NOT authenticated
 * Use this for routes that should only be accessible to guests
 * (e.g., login, signup pages)
 *
 * @example
 * router.post('/signup', ensureNotAuthenticated, signupHandler);
 */
export function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  res.status(400).json({
    error: "Already authenticated",
    authenticated: true,
  });
}

/**
 * Optional: Middleware to attach userId to request
 * Use this if you want backward compatibility with code
 * that expects req.userId instead of req.user._id
 *
 * @example
 * router.use(attachUserId);
 * router.get('/data', (req, res) => {
 *   console.log(req.userId); // Works alongside req.user
 * });
 */
export function attachUserId(req, res, next) {
  if (req.isAuthenticated() && req.user) {
    req.userId = req.user._id.toString();
  }
  next();
}

/**
 * Optional: Middleware to check if user owns a resource
 * Creates a reusable ownership checker
 *
 * @param {Function} getResourceUserId - Function that extracts userId from resource
 * @returns {Function} Express middleware
 *
 * @example
 * const checkGoalOwnership = checkOwnership(async (req) => {
 *   const goal = await db.getGoalById(req.params.id);
 *   return goal?.userId;
 * });
 * router.delete('/goals/:id', ensureAuthenticated, checkGoalOwnership, deleteGoal);
 */
export function checkOwnership(getResourceUserId) {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        return res.status(404).json({ error: "Resource not found" });
      }

      if (resourceUserId !== req.user._id.toString()) {
        return res.status(403).json({
          error: "Forbidden: You don't own this resource",
        });
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      res.status(500).json({ error: "Failed to verify ownership" });
    }
  };
}

/**
 * Optional: Middleware for role-based access control
 * Use this if you add user roles in the future
 *
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 *
 * @example
 * router.delete('/admin/users', ensureAuthenticated, requireRole(['admin']), handler);
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: "Unauthorized - Please log in",
      });
    }

    const userRole = req.user.role || "user";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Forbidden: Requires one of these roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
}

/**
 * Optional: Middleware to log authentication status
 * Useful for debugging
 *
 * @example
 * app.use(logAuthStatus);
 */
export function logAuthStatus(req, res, next) {
  console.log("[Auth]", {
    authenticated: req.isAuthenticated(),
    user: req.user ? req.user.email : "guest",
    path: req.path,
    method: req.method,
  });
  next();
}
