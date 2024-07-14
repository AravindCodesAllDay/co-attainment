const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { User } = require("../models/user");

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

router.post("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const newUser = new User({ email });
      user = await newUser.save();
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).send({
      token: token,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

router.get("/protected", verifyToken, (req, res) => {
  res
    .status(200)
    .json({ message: "Access to protected route granted", user: req.user });
});

router.get("/colist/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided." });
  }
  const user = await User.findById(userId).populate(
    "bundles.semlists.courselists"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  const coLists = user.bundles.flatMap((bundle) =>
    bundle.semlists.flatMap((sem) => sem.courselists)
  );
  return res.status(200).json(coLists);
});

router.post("/cotype/:userId", async (req, res) => {
  const { userId } = req.params;
  const { cotype } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !cotype) {
    return res
      .status(400)
      .json({ message: "User ID and cotype must be provided." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.cotypes.push(cotype);
    await user.save();

    return res
      .status(200)
      .json({ message: "Cotype added successfully.", cotypes: user.cotypes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding cotype", error: error.message });
  }
});

router.delete("/cotype/:userId", async (req, res) => {
  const { userId } = req.params;
  const { cotype } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !cotype) {
    return res
      .status(400)
      .json({ message: "User ID and cotype must be provided." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.cotypes = user.cotypes.filter((ct) => ct !== cotype);
    await user.save();

    return res
      .status(200)
      .json({ message: "Cotype deleted successfully.", cotypes: user.cotypes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting cotype", error: error.message });
  }
});

module.exports = router;
