export function validateRequired(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => !(field in req.body));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }
    next();
  };
}
