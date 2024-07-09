const express = require("express");
const mongoose = require("mongoose");

const NameList = require("../models/namelist");
const User = require("../models/user");

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

  if (!user[listType].includes(listId)) {
    throw new Error("List not associated with the user.");
  }
};

router.get("/namelists/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, "Invalid user ID.");
    }

    const user = await User.findById(userId).populate("namelists", "title _id");
    if (!user) {
      return handleErrorResponse(res, 404, "User not found.");
    }

    return res.status(200).json(user.namelists);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

router.get("/students/:namelistId/:userId", async (req, res) => {
  try {
    const { userId, namelistId } = req.params;

    await verifyUserOwnership(userId, namelistId, "namelists");

    const namelist = await NameList.findById(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    return res.status(200).json(namelist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, error.message);
  }
});

router.post("/addlist/:userId", async (req, res) => {
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

    const namelist = await NameList.create({ title });
    await User.findByIdAndUpdate(userId, {
      $push: { namelists: namelist._id },
    });

    return res.status(201).json(namelist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

router.put("/addstudent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { namelistId, rollno, name } = req.body;

    if (!userId || !namelistId || !rollno || !name) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided."
      );
    }

    await verifyUserOwnership(userId, namelistId, "namelists");

    const namelist = await NameList.findById(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    namelist.students.push({ rollno, name });
    await namelist.save();

    return res.status(200).json(namelist);
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const namelist = await NameList.findByIdAndDelete(id);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    await User.updateMany({ namelists: id }, { $pull: { namelists: id } });

    return res.status(200).json({ message: "Name list deleted successfully." });
  } catch (error) {
    console.error(error.message);
    return handleErrorResponse(res, 500, "Internal Server Error");
  }
});

router.delete("/student/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { namelistId, studentId } = req.body;

    // Validate required fields
    if (!userId || !namelistId || !studentId) {
      return handleErrorResponse(
        res,
        400,
        "All required fields must be provided (userId, namelistId, studentId)."
      );
    }

    // Validate student ID (assuming it's a Mongoose ObjectId)
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return handleErrorResponse(res, 400, "Invalid student ID format.");
    }

    // Verify user ownership (replace with your implementation)
    await verifyUserOwnership(userId, namelistId, "namelists");

    // Find the namelist
    const namelist = await NameList.findById(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    // Check if student exists in the namelist
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

    // Remove the student from the namelist array
    namelist.students.splice(studentIndex, 1);

    // Save the modified namelist
    await namelist.save();

    return res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    console.error(error.message);
    let statusCode = 500;
    let errorMessage = "Internal Server Error";

    // Provide more specific error messages based on error type
    if (error.name === "MongoError") {
      statusCode = 400; // Or a custom code for database errors
      errorMessage = "Database error occurred.";
    }

    return handleErrorResponse(res, statusCode, errorMessage);
  }
});

router.put("/students/:userId", async (req, res) => {
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

    await verifyUserOwnership(userId, namelistId, "namelists");

    const namelist = await NameList.findById(namelistId);
    if (!namelist) {
      return handleErrorResponse(res, 404, "Name list not found.");
    }

    const student = namelist.students.id(studentId); // Use the id method to find the subdocument
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

module.exports = router;
