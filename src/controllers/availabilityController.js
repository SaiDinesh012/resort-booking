const Room = require("../models/Room");
const Booking = require("../models/Booking");

// @desc    Check room availability for specified dates and guests
// @route   GET /api/availability
exports.checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, adults, children, rooms: requestedRooms } = req.query;

    // Validation
    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "Check-in and Check-out dates are required." });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD." });
    }

    if (checkInDate < today) {
      return res.status(400).json({ error: "Check-in date cannot be in the past." });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "Check-out date must be after check-in date." });
    }

    const numAdults = parseInt(adults, 10) || 1;
    const numChildren = parseInt(children, 10) || 0;
    const totalGuests = numAdults + numChildren;
    const numRoomsNeeded = parseInt(requestedRooms, 10) || 1;

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Find all active rooms that can accommodate the guests
    const allRooms = await Room.find({ status: { $ne: "maintenance" } });

    // Find conflicting bookings
    const overlappingBookings = await Booking.find({
      bookingStatus: { $nin: ["cancelled", "rejected"] },
      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn },
        },
      ],
    });

    // Count bookings per room
    const bookingsByRoom = {};
    overlappingBookings.forEach((b) => {
      const rId = b.roomId;
      if (rId) {
        bookingsByRoom[rId] = (bookingsByRoom[rId] || 0) + 1;
      }
    });

    // Filter available rooms
    const availableRooms = allRooms
      .filter((room) => {
        // Capacity check
        if (room.maxOccupancy && room.maxOccupancy < totalGuests) {
          return false;
        }

        // Inventory check
        const totalInventory = room.inventory || room.totalRooms || 5;
        const bookedCount = bookingsByRoom[room.id] || 0;
        return totalInventory - bookedCount >= numRoomsNeeded;
      })
      .map((room) => {
        const totalInventory = room.inventory || room.totalRooms || 5;
        const bookedCount = bookingsByRoom[room.id] || 0;
        const remainingInventory = Math.max(0, totalInventory - bookedCount);
        const totalPrice = (room.basePrice || 0) * nights;

        return {
          ...room.toObject(),
          availableInventory: remainingInventory,
          nights,
          totalPrice,
          isAvailable: remainingInventory > 0,
        };
      });

    return res.json({
      success: true,
      checkIn,
      checkOut,
      nights,
      adults: numAdults,
      children: numChildren,
      totalAvailable: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return res.status(500).json({ error: error.message || "Failed to check availability." });
  }
};
