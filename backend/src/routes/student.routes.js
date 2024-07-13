const express = require("express");
const mongoose = require("mongoose");

const {
  User,
  SEE,
  PtList,
  NameList,
  COlist,
} = require("../models/co_attainment");

const router = express.Router();

const handleErrorResponse = (res, status, message) => {
  return res.status(status).json({ message });
};

const verifyUserOwnership = async (userId, listId, listType) => {
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

  if (!user.bundles.some((bundle) => bundle.semlists.includes(listId))) {
    throw new Error("List not associated with the user.");
  }
};

// Route to get all name lists for a user
router.get("/namelists/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, "Invalid user ID.");
    }

    const user = await User.findById(userId).populate({
      path: "bundles.semlists",
      select: "title _id",
    });
    if (!user) {
      return handleErrorResponse(res, 404, "User not found.");
    }

    const nameLists = user.bundles.flatMap((bundle) => bundle.semlists);
    return res.status(200).json(nameLists);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Route to get students from a specific semester list
router.get("/students/:semlistId/:userId", async (req, res) => {
  try {
    const { userId, semlistId } = req.params;

    await verifyUserOwnership(userId, semlistId, "semlists");

    const semlist = await COlist.findById(semlistId);
    if (!semlist) {
      return handleErrorResponse(res, 404, "Semester list not found.");
    }

    return res.status(200).json(semlist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, error.message);
  }
});

// Route to add a new semester list
router.post("/addlist/:userId", async (req, res) => {
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

    const semlist = await COlist.create({ title });
    const user = await User.findById(userId);
    const bundle = user.bundles.id(bundleId);

    if (!bundle) {
      return handleErrorResponse(res, 404, "Bundle not found.");
    }

    bundle.semlists.push(semlist._id);
    await user.save();

    return res.status(201).json(semlist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Route to add a new student to a semester list
router.put("/addstudent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { semlistId, studentDetail } = req.body;

    if (!userId || !semlistId || !studentDetail) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    await verifyUserOwnership(userId, semlistId, "semlists");

    const semlist = await COlist.findById(semlistId);
    if (!semlist) {
      return handleErrorResponse(res, 404, "Semester list not found.");
    }

    semlist.students.push(studentDetail);
    await semlist.save();

    return res.status(200).json(semlist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Route to update student details in a semester list
router.put("/students/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { semlistId, studentId, studentDetail } = req.body;

    if (!userId || !semlistId || !studentDetail || !studentId) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    await verifyUserOwnership(userId, semlistId, "semlists");

    const semlist = await COlist.findById(semlistId);
    if (!semlist) {
      return handleErrorResponse(res, 404, "Semester list not found.");
    }

    const student = semlist.students.id(studentId);
    if (!student) {
      return handleErrorResponse(
        res,
        404,
        "Student not found in the semester list."
      );
    }

    student.rollno = studentDetail.rollno;
    student.name = studentDetail.name;
    student.registration_no = studentDetail.registration_no;

    await semlist.save();

    return res
      .status(200)
      .json({ message: "Student details updated successfully." });
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Route to delete a semester list
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const semlist = await COlist.findByIdAndDelete(id);
    if (!semlist) {
      return handleErrorResponse(res, 404, "Semester list not found.");
    }

    await User.updateMany(
      { "bundles.semlists": id },
      { $pull: { "bundles.$.semlists": id } }
    );

    return res
      .status(200)
      .json({ message: "Semester list deleted successfully." });
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

// Route to delete a student from a semester list
router.delete("/student/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { semlistId, studentId } = req.body;

    if (!userId || !semlistId || !studentId) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided (userId, semlistId, studentId)."
      );
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return handleErrorResponse(res, 400, "Invalid student ID format.");
    }

    await verifyUserOwnership(userId, semlistId, "semlists");

    const semlist = await COlist.findById(semlistId);
    if (!semlist) {
      return handleErrorResponse(res, 404, "Semester list not found.");
    }

    const studentIndex = semlist.students.findIndex(
      (student) => student._id.toString() === studentId
    );
    if (studentIndex === -1) {
      return handleErrorResponse(
        res,
        404,
        "Student not found in the semester list."
      );
    }

    semlist.students.splice(studentIndex, 1);

    await semlist.save();

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
