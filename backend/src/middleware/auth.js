module.exports = (req, res, next) => {
  // Stub auth middleware for missing file
  req.user = req.user || { userId: 1 };
  next();
};
