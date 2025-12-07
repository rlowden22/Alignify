export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    error: "Unauthorized - Please log in",
    authenticated: false,
  });
}

export function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  res.status(400).json({
    error: "Already authenticated",
    authenticated: true,
  });
}

export function attachUserId(req, res, next) {
  if (req.isAuthenticated() && req.user) {
    req.userId = req.user._id.toString();
  }
  next();
}

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

export function logAuthStatus(req, res, next) {
  console.log("[Auth]", {
    authenticated: req.isAuthenticated(),
    user: req.user ? req.user.email : "guest",
    path: req.path,
    method: req.method,
  });
  next();
}
