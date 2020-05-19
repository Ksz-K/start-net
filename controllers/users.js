const ErrorResponse = require("../utils/errorResponse");
const sendTokenResponse = require("../utils/sendTokenResponse");
const gravatar = require("gravatar");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

//  @route  POST api/users
//  @desc   Register user
//  @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const avatar = gravatar.url(email, {
    s: "200",
    r: "pg",
    d: "mm",
  });

  //Create user
  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  sendTokenResponse(user, 200, res);
});
