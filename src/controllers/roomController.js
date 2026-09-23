const mongoose = require("mongoose");
const Room = require("../models/Room");

// @desc    Get all rooms
// @route   GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const { type, status, featured } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    const rooms = await Room.find(query).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch rooms" });
  }
};

// @desc    Get room by ID or slug
// @route   GET /api/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { slug: id }, { _id: id }] }
      : { $or: [{ id }, { slug: id }] };

    const room = await Room.findOne(filter);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch room" });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.basePrice) {
      return res.status(400).json({ error: "Name and Base Price are required." });
    }

    const id = body.id || `room-${Date.now()}`;
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    const basePrice = Number(body.basePrice);
    const weekendPrice = body.weekendPrice ? Number(body.weekendPrice) : Math.round(basePrice * 1.25);

    const newRoom = await Room.create({
      ...body,
      id,
      slug,
      basePrice,
      weekendPrice,
      status: body.status || "available",
      images: body.images?.length ? body.images : ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"],
    });

    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create room" });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const updatedRoom = await Room.findOneAndUpdate(
      filter,
      { $set: req.body },
      { new: true }
    );

    if (!updatedRoom) return res.status(404).json({ error: "Room not found" });
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update room" });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const deletedRoom = await Room.findOneAndDelete(filter);
    if (!deletedRoom) return res.status(404).json({ error: "Room not found" });

    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete room" });
  }
};
