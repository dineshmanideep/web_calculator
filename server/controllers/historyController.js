/**
 * Author: Dinesh Manideep
 * History Controller
 *
 * Handles calculator history operations:
 * - Get user calculation history
 * - Add new history entry
 * - Clear history
 *
 * History entries are limited to the last 25 items per user
 */

import User from "../models/User.js";

/**
 * Get user calculation history
 * Returns history in reverse chronological order
 */
export const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id, "history");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return history in reverse chronological order
    const history = (user.history || []).slice().reverse();
    return res.json({ history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add new history entry
 * Keeps only the last 25 entries per user
 */
export const addHistory = async (req, res) => {
  try {
    const { expr, result } = req.body;

    if (!expr || result === undefined) {
      return res.status(400).json({ message: "Missing expr or result" });
    }

    const newEntry = {
      expr,
      result: String(result),
      createdAt: new Date(),
    };

    // Find user and push new entry, keeping only the last 25 entries
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user.id,
      {
        $push: {
          history: {
            $each: [newEntry],
            $slice: -25, // Keeps the last 25 elements of the array
          },
        },
      },
      { new: true, select: "history" },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return fresh history reversed
    return res.json({ history: updatedUser.history.slice().reverse() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

//Clear user calculation history
export const clearHistory = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.session.user.id,
      { $set: { history: [] } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "History cleared" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
