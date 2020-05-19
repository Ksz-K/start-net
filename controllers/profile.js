const normalize = require("normalize-url");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const Profile = require("../models/Profile");
const User = require("../models/User");

//  @route  GET api/profile/me
//  @desc   Get current user profile
//  @access Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id }).populate(
    "user",
    ["name", "avatar"]
  );

  if (!profile) {
    return next(
      new ErrorResponse(`There is no profile for user ${req.user.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: profile,
  });
});

//  @route  POST api/profile
//  @desc   Create or update user profile
//  @access Private
exports.profile = asyncHandler(async (req, res, next) => {
  const {
    company,
    location,
    website,
    bio,
    skills,
    status,
    githubusername,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook,
  } = req.body;

  //Build profile object
  const profileFields = {
    user: req.user.id,
    company,
    location,
    website: website === "" ? "" : normalize(website, { forceHttps: true }),
    bio,
    skills: Array.isArray(skills)
      ? skills
      : skills.split(",").map((skill) => " " + skill.trim()),
    status,
    githubusername,
  };

  // Build social object and add to profileFields
  const socialfields = { youtube, twitter, instagram, linkedin, facebook };

  for (const [key, value] of Object.entries(socialfields)) {
    if (value && value.length > 0)
      socialfields[key] = normalize(value, { forceHttps: true });
  }
  profileFields.social = socialfields;

  //Create Profile - using upsert option (creates new doc if no match is found):
  let profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { $set: profileFields },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    data: profile,
  });
});

//  @route  GET api/profile
//  @desc   Get all profiles
//  @access Public
exports.getAllProfiles = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//  @route  GET api/profile/user/:user_id
//  @desc   Get profile by user ID
//  @access Private
exports.getProfileByID = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({
    user: req.params.user_id,
  }).populate("user", ["name", "avatar"]);

  if (!profile) {
    return next(
      new ErrorResponse(
        `There is no profile for user ${req.params.user_id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: profile,
  });
});

//  @route  Delete api/profile
//  @desc   Delete profile, user & posts
//  @access Private

exports.deleteProfilenUser = asyncHandler(async (req, res, next) => {
  // @todo - remove users posts

  //Remove profile
  await Profile.findOneAndRemove({
    user: req.user.id,
  });

  //Remove user
  await User.findOneAndRemove({
    _id: req.user.id,
  });

  res.status(200).json({
    success: true,
    data: { msg: "User deleted" },
  });
});

//  @route  PUT api/profile/experience
//  @desc   Add profile experience
//  @access Private

exports.addExperience = asyncHandler(async (req, res, next) => {
  const { title, company, location, from, to, current, description } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description,
  };

  const profile = await Profile.findOne({ user: req.user.id });

  profile.experience.unshift(newExp);

  await profile.save();

  res.status(200).json({
    success: true,
    data: profile,
  });
});
