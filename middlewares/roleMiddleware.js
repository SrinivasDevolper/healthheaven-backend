const roleMiddleWare = (...role) => {
  // console.log("roles", role);
  return (req, res, next) => {
    if (role.includes(req.users.role)) {
      next();
      return;
    }
    return res.status(403).send("access denied");
  };
};

module.exports = roleMiddleWare;
