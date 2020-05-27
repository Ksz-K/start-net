const normalize = require("normalize-url");
const request = require("request");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const Profile = require("../models/Profile");
const User = require("../models/User");
const Post = require("../models/Post");

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

  if (!status) {
    return next(new ErrorResponse(`Status is required`, 500));
  }
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
  // Remove user posts
  await Post.deleteMany({ user: req.user.id });

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

//  @route  Delete api/profile/experience/:exp_id
//  @desc   Delete experience from profile
//  @access Private

exports.deleteExperience = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });

  //Get remove index
  const removeIndex = profile.experience
    .map((item) => item.id)
    .indexOf(req.params.exp_id);

  if (removeIndex === -1) {
    return next(
      new ErrorResponse(
        `There is no experience array of ID ${req.params.exp_id}`,
        404
      )
    );
  }
  profile.experience.splice(removeIndex, 1);

  await profile.save();

  res.status(200).json({
    success: true,
    data: profile,
  });
});

//  @route  PUT api/profile/education
//  @desc   Add profile education
//  @access Private

exports.addEducation = asyncHandler(async (req, res, next) => {
  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  } = req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  };

  const profile = await Profile.findOne({ user: req.user.id });

  profile.education.unshift(newEdu);

  await profile.save();

  res.status(200).json({
    success: true,
    data: profile,
  });
});

//  @route  Delete api/profile/education/:edu_id
//  @desc   Delete education from profile
//  @access Private

exports.deleteEducation = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });

  //Get remove index
  const removeIndex = profile.education
    .map((item) => item.id)
    .indexOf(req.params.edu_id);

  if (removeIndex === -1) {
    return next(
      new ErrorResponse(
        `There is no education array of ID ${req.params.edu_id}`,
        404
      )
    );
  }
  profile.education.splice(removeIndex, 1);

  await profile.save();

  res.status(200).json({
    success: true,
    data: profile,
  });
});

//  @route  Get api/profile/github/:username
//  @desc   Get user repos from Git Hub
//  @access Public

exports.getGitHubRepos = asyncHandler(async (req, res, next) => {
  const options = {
    uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GH_CLIENT_ID}&client_secret=${process.env.GH_SECRET}`,
    method: "GET",
    headers: {
      "user-agent": "node-js",
    },
  };

  request(options, (error, response, body) => {
    if (error) console.log(error);

    if (response.statusCode !== 200) {
      return next(
        new ErrorResponse(
          `No Git Hub profile found for user ${req.params.username}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: JSON.parse(body),
    });
  });
});
