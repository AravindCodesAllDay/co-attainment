const express = require("express");

const {
  NameList,
  SEE,
  User,
  COlist,
  Sem,
  Bundle,
  PtList,
} = require("../models/co_attainment");

const router = express.Router();

const verifyUserOwnership = async (userId, coId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.bundles.some((bundle) => bundle.courselists.includes(coId))) {
    throw new Error("User does not have access to this CO list");
  }
};

// Route to get all bundles for a user
router.get("/bunsems/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, "Invalid user ID.");
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, "User not found.");
    }

    return res.status(200).json(user.bundles);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Route to add a new bundle
router.post("/addbundle/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { title } = req.body;

    if (!title || !userId) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, "user not found.");
    }

    const bundle = await Bundle.create({ title });

    user.bundles.push(bundle);
    await user.save();

    return res.status(201).json(bundle);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// router.get("/sems/:bundleId/:userId", async (req, res) => {
//   try {
//     const { userId, bundleId } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(userId) ||
//       !mongoose.Types.ObjectId.isValid(bundleId)
//     ) {
//       return handleErrorResponse(res, 400, "Invalid ID format");
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return handleErrorResponse(res, 404, "User not found.");
//     }

//     const bundle = user.bundles.find(
//       (bundle) => bundle._id.toString() === bundleId
//     );

//     if (!bundle) {
//       return handleErrorResponse(res, 404, "Bundle not found.");
//     }

//     return res.status(200).json(bundle);
//   } catch (error) {
//     console.error(error.message);
//     return handleErrorResponse(res, 500, "Internal Server Error");
//   }
// });

// Route to add a new semester list
router.post("/addsem/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, bundleId } = req.body;

    if (!title || !userId || !bundleId) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, "user not found.");
    }

    const bundle = user.bundles.id(bundleId);

    if (!bundle) {
      return handleErrorResponse(res, 404, "Bundle not found.");
    }
    const semlist = await Sem.create({ title });

    bundle.semlists.push(semlist);
    await user.save();

    return res.status(201).json(semlist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

module.exports = router;