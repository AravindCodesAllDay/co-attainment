const express = require("express");
const mongoose = require("mongoose");

const { Namelist } = require("../models/namelist");
const { User } = require("../models/user");

const router = express.Router();

const handleErrorResponse = (res, status, message) => {
  return res.status(status).json({ message });
};

const verifyUserOwnership_bundle = async (userId, listId, listType) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(listId)
  ) {
    throw new Error("Invalid user ID or list ID.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user[listType].some((bundle) => bundle._id.equals(listId))) {
    throw new Error("List not associated with the user.");
  }
};

const verifyUserOwnership_namelist = async (userId, listId, listType) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(listId)
  ) {
    throw new Error("Invalid user ID or list ID.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  let found = false;
  for (let bundle of user.bundles) {
    if (bundle[listType].includes(listId)) {
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error("List not associated with the user.");
  }
};

// Create a new namelist in a specific bundle
router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, bundleId } = req.body;

    if (
      !title ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
    ) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    await verifyUserOwnership_bundle(userId, bundleId, "bundles");

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, "User not found.");
    }

    const bundle = user.bundles.find(
      (bundle) => bundle._id.toString() === bundleId
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, "Bundle not found.");
    }

    const namelist = await Namelist.create({ title });

    bundle.namelists.push(namelist._id);

    await user.save();
    return res.status(201).json(namelist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Get all namelists of a specific bundle
router.get("/:bundleId/:userId", async (req, res) => {
  try {
    const { userId, bundleId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
    ) {
      return handleErrorResponse(res, 400, "Invalid user ID or bundle ID.");
    }

    await verifyUserOwnership_bundle(userId, bundleId, "bundles");

    const user = await User.findById(userId).populate({
      path: "bundles.namelists",
      populate: {
        path: "namelists",
        model: "Namelist",
        select: "title _id",
      },
    });

    if (!user) {
      return handleErrorResponse(res, 404, "User not found.");
    }

    const bundle = user.bundles.find(
      (bundle) => bundle._id.toString() === bundleId
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, "Bundle not found.");
    }

    return res.status(200).json(bundle.namelists);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Delete a namelist
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { namelistId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId)
    ) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    await verifyUserOwnership_namelist(userId, namelistId, "namelists");

    const namelist = await Namelist.findByIdAndDelete(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, "User not found.");
    }

    user.bundles.forEach((bundle) => {
      const index = bundle.namelists.indexOf(namelistId);
      if (index !== -1) {
        bundle.namelists.splice(index, 1);
      }
    });

    await user.save();

    return res.status(200).json({ message: "Name list deleted successfully." });
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Add a student to a namelist
router.post("/student/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { namelistId, studentDetail } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !studentDetail
    ) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    await verifyUserOwnership_namelist(userId, namelistId, "namelists");

    const namelist = await Namelist.findById(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    namelist.students.push(studentDetail);
    await namelist.save();

    return res.status(200).json(namelist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Get students in a namelist
router.get("/student/:namelistId/:userId", async (req, res) => {
  try {
    const { userId, namelistId } = req.params;

    await verifyUserOwnership_namelist(userId, namelistId, "namelists");

    const namelist = await Namelist.findById(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    return res.status(200).json(namelist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, error.message);
  }
});

// Update student details in a namelist
router.put("/student/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { namelistId, studentId, studentDetail } = req.body;

    if (!userId || !namelistId || !studentDetail || !studentId) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    await verifyUserOwnership_namelist(userId, namelistId, "namelists");

    const namelist = await Namelist.findById(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    const student = namelist.students.id(studentId);
    if (!student) {
      return handleErrorResponse(
        res,
        404,
        "Student not found in the name list."
      );
    }

    student.rollno = studentDetail.rollno;
    student.name = studentDetail.name;

    await namelist.save();

    return res
      .status(200)
      .json({ message: "Student details updated successfully." });
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Delete a student from a namelist
router.delete("/student/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { namelistId, studentId } = req.body;

    if (!userId || !namelistId || !studentId) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided (userId, namelistId, studentId)."
      );
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return handleErrorResponse(res, 400, "Invalid student ID format.");
    }

    await verifyUserOwnership_namelist(userId, namelistId, "namelists");

    const namelist = await Namelist.findById(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    const studentIndex = namelist.students.findIndex(
      (student) => student._id.toString() === studentId
    );
    if (studentIndex === -1) {
      return handleErrorResponse(
        res,
        404,
        "Student not found in the namelist."
      );
    }

    namelist.students.splice(studentIndex, 1);

    await namelist.save();

    return res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    console.error(error.message);
    let statusCode = 500;
    let errorMessage = "Internal Server Error";

    if (error.name === "MongoError") {
      statusCode = 400;
      errorMessage = "Database error occurred.";
    }

    return handleErrorResponse(res, statusCode, errorMessage);
  }
});

module.exports = router;
