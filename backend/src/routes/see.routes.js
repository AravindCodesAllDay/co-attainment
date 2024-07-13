const express = require("express");
const mongoose = require("mongoose");

const {
  NameList,
  SEE,
  User,
  COlist,
  PtList,
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

  if (!user[listType].includes(listId)) {
    throw new Error("List not associated with the user.");
  }
};

// GET route to retrieve all lists titles and IDs for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, "Invalid user ID");
    }

    const user = await User.findById(userId)
      .populate("bundles.namelists", "title _id")
      .populate("bundles.semlists.courselists", "title _id")
      .populate("bundles.semlists.ptlists", "title _id")
      .populate("bundles.semlists.seelists", "title _id");

    if (!user) {
      return handleErrorResponse(res, 404, "User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving lists", error: error.message });
  }
});

// GET route to retrieve student details for a specific list
router.get("/seelist/:seeId/:userId", async (req, res) => {
  try {
    const { userId, seeId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(seeId)
    ) {
      return handleErrorResponse(res, 400, "Invalid user ID or SEE list ID");
    }

    await verifyUserOwnership(userId, seeId, "seelists");

    const seeList = await SEE.findById(seeId);

    if (!seeList) {
      return handleErrorResponse(res, 404, "SEE list not found");
    }

    res.status(200).json(seeList);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving student details",
      error: error.message,
    });
  }
});

router.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, courses, namelistId } = req.body;

    if (
      !title ||
      !courses ||
      !Array.isArray(courses) ||
      !namelistId ||
      !userId
    ) {
      return handleErrorResponse(res, 400, "Invalid input data");
    }

    await verifyUserOwnership(userId, namelistId, "namelists");

    const nameList = await NameList.findById(namelistId);
    if (!nameList) {
      return handleErrorResponse(res, 404, "NameList not found");
    }

    const populatedStudents = nameList.students.map((student) => {
      const scores = {};
      courses.forEach((course) => {
        scores[course] = 0;
      });
      return {
        rollno: student.rollno,
        name: student.name,
        scores,
      };
    });

    const newSEEList = new SEE({
      title,
      courses,
      students: populatedStudents,
    });

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, "User not found");
    }

    const savedSEEList = await newSEEList.save();
    user.bundles.semlists.push(savedSEEList._id);
    await user.save();

    res.status(201).json({
      message: "SEE list created successfully",
      seeList: savedSEEList,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating SEE list", error: error.message });
  }
});

router.put("/score/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { seeId, rollno, scores } = req.body;

    if (!seeId || !userId || !rollno || !scores || typeof scores !== "object") {
      return handleErrorResponse(res, 400, "Invalid input data");
    }

    await verifyUserOwnership(userId, seeId, "seelists");

    const seeList = await SEE.findById(seeId);
    if (!seeList) {
      return handleErrorResponse(res, 404, "SEE list not found");
    }

    const student = seeList.students.find(
      (student) => student.rollno === rollno
    );
    if (!student) {
      return handleErrorResponse(res, 404, "Student not found");
    }

    for (let course in scores) {
      if (student.scores.has(course)) {
        student.scores.set(course, scores[course]);
      }
    }

    const updatedSEEList = await seeList.save();
    res.status(200).json({
      message: "Student scores updated successfully",
      seeList: updatedSEEList,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating student scores", error: error.message });
  }
});

router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { seeId } = req.body;

    if (!seeId || !userId) {
      return handleErrorResponse(res, 400, "Invalid input data");
    }

    await verifyUserOwnership(userId, seeId, "seelists");

    const seeList = await SEE.findById(seeId);
    if (!seeList) {
      return handleErrorResponse(res, 404, "SEE list not found");
    }

    await seeList.remove();

    const user = await User.findById(userId);
    user.bundles.semlists = user.bundles.semlists.filter(
      (listId) => listId.toString() !== seeId
    );
    await user.save();

    res.status(200).json({ message: "SEE list deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting SEE list", error: error.message });
  }
});

module.exports = router;
