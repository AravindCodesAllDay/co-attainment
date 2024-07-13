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

// Helper function to calculate average mark
const calculateAverageMark = (students) => {
  const totalMarks = students.reduce(
    (sum, student) => sum + student.totalMark,
    0
  );
  return students.length ? totalMarks / students.length : 0;
};

// Middleware to verify user ownership of PtList
const verifyUserOwnership = async (userId, ptListId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.ptlists.includes(ptListId)) {
    throw new Error("User does not have access to this PT list");
  }
};

// GET route to retrieve all PtList titles and IDs for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await User.findById(userId).populate(
      "bundles.ptlists",
      "title _id"
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Flattening the ptlists from bundles
    const ptLists = user.bundles.flatMap((bundle) => bundle.ptlists);
    res.status(200).json(ptLists);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET route to retrieve student details for a specific PtList
router.get("/ptlist/:ptListId/:userId", async (req, res) => {
  try {
    const { userId, ptListId } = req.params;

    if (!userId || !ptListId) {
      return res.status(400).send("Invalid user ID or PtList ID");
    }

    await verifyUserOwnership(userId, ptListId);

    const ptList = await PtList.findById(ptListId).populate(
      "students.parts.questions"
    );

    if (!ptList) {
      return res.status(404).send("PtList not found");
    }

    res.status(200).json(ptList);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Route to create a table of students from the NameList with user-defined parts
router.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { nameListId, title, parts, maxMark } = req.body;

    if (!nameListId || !title || !parts || !maxMark || !userId) {
      return res.status(400).send("Missing required fields");
    }

    const nameList = await NameList.findById(nameListId);
    if (!nameList) {
      return res.status(404).send("NameList not found");
    }

    // Initialize mark and typemark for each question
    const initializedParts = parts.map((part) => ({
      ...part,
      questions: part.questions.map((question) => ({
        ...question,
        mark: 0,
      })),
    }));

    const students = nameList.students.map((student) => {
      const typemark = new Map();
      parts.forEach((part) => {
        part.questions.forEach((question) => {
          typemark.set(question.option, 0);
        });
      });

      return {
        rollno: student.rollno,
        name: student.name,
        totalMark: 0,
        typemark: typemark,
        parts: initializedParts,
      };
    });

    const ptList = new PtList({
      title: title,
      students: students,
      maxMark: maxMark,
      structure: parts,
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await ptList.save();
    user.ptlists.push(ptList._id);

    await user.save();

    res.status(201).send(ptList);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Route to enter marks for multiple questions in multiple parts
router.put("/score/:userId", async (req, res) => {
  try {
    const { ptListId, studentId, parts } = req.body;
    const { userId } = req.params;

    if (!ptListId || !userId || !studentId || !Array.isArray(parts)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    await verifyUserOwnership(userId, ptListId);

    const ptList = await PtList.findById(ptListId);
    if (!ptList) {
      return res.status(404).send("PtList not found");
    }

    const student = ptList.students.id(studentId);
    if (!student) {
      return res.status(404).send("Student not found");
    }

    let totalMarkAdjustment = 0;
    let typemarkAdjustment = {};

    parts.forEach(({ title, questions }) => {
      let part = student.parts.find((p) => p.title === title);
      if (!part) {
        throw new Error(`Part title ${title} not found`);
      }

      questions.forEach(({ number, mark }) => {
        let question = part.questions.find((q) => q.number === number);
        if (!question) {
          throw new Error(`Question number ${number} not found`);
        }

        const previousMark = question.mark;
        question.mark = mark;

        totalMarkAdjustment += mark - previousMark;
        const questionType = question.option;
        if (!typemarkAdjustment[questionType]) {
          typemarkAdjustment[questionType] = 0;
        }
        typemarkAdjustment[questionType] += mark - previousMark;
      });
    });

    // Update total mark and type mark
    student.totalMark += totalMarkAdjustment;
    for (const [type, adjustment] of Object.entries(typemarkAdjustment)) {
      student.typemark.set(
        type,
        (student.typemark.get(type) || 0) + adjustment
      );
    }

    // Recalculate the average mark for the ptList
    ptList.averagemark = calculateAverageMark(ptList.students);

    await ptList.save();
    res.status(200).send(ptList);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Route to delete a PtList
router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { ptListId } = req.body;

    if (!ptListId || !userId) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    await verifyUserOwnership(userId, ptListId);

    const ptList = await PtList.findByIdAndDelete(ptListId);

    if (!ptList) {
      return res.status(404).send("PtList not found");
    }

    const user = await User.findById(userId);
    user.ptlists = user.ptlists.filter(
      (listId) => listId.toString() !== ptListId
    );

    await user.save();

    res.status(200).send({ message: "PtList deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
