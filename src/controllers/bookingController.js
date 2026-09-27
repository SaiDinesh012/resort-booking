const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");

exports.getBookings = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    if (status && status !== "all") query.bookingStatus = status;
    if (type) query.type = type;

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch bookings" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { bookingNumber: id }, { _id: id }] }
      : { $or: [{ id }, { bookingNumber: id }] };

    const booking = await Booking.findOne(filter);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch booking" });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const body = req.body;
    const bookingId = `book-${Date.now()}`;
    const bookingNumber = `VP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking = await Booking.create({
      id: bookingId,
      bookingNumber,
      type: body.type || "room",
      roomId: body.roomId,
      roomName: body.roomName,
      packageId: body.packageId,
      packageName: body.packageName,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      estimatedCheckInTime: body.estimatedCheckInTime || "12:00 PM - 02:00 PM",
      estimatedCheckOutTime: body.estimatedCheckOutTime || "10:00 AM - 11:00 AM",
      actualCheckIn: body.actualCheckIn,
      actualCheckOut: body.actualCheckOut,
      overstayHours: body.overstayHours || 0,
      overstayCharges: body.overstayCharges || 0,
      nights: body.nights || 1,
      adults: body.adults || 1,
      children: body.children || 0,
      guestDetails: body.guestDetails,
      priceBreakdown: body.priceBreakdown,
      paymentStatus: body.paymentStatus || "paid",
      paymentMethod: body.paymentMethod || "card",
      bookingStatus: body.bookingStatus || "confirmed",
      notes: body.notes || "Booked online via Website",
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: "Booking Created",
          description: `Booking #${bookingNumber} created successfully`,
          actor: `${body.guestDetails?.firstName} ${body.guestDetails?.lastName}`,
        },
      ],
    });

    // Auto-lock room if roomId is provided
    if (body.roomId) {
      const roomFilter = mongoose.Types.ObjectId.isValid(body.roomId)
        ? { $or: [{ id: body.roomId }, { _id: body.roomId }] }
        : { id: body.roomId };

      await Room.findOneAndUpdate(
        roomFilter,
        {
          $set: {
            status: body.bookingStatus === "checked-in" ? "occupied" : "occupied",
            lockedUntil: body.checkOut,
            currentBookingId: bookingId,
          },
        }
      );
    }

    // Auto update or create Customer
    if (body.guestDetails?.email) {
      const existingCustomer = await Customer.findOne({ email: body.guestDetails.email });
      if (existingCustomer) {
        existingCustomer.totalBookings += 1;
        existingCustomer.totalSpend += body.priceBreakdown?.total || 0;
        existingCustomer.lastBookingDate = new Date().toISOString();
        await existingCustomer.save();
      } else {
        await Customer.create({
          id: `cust-${Date.now()}`,
          firstName: body.guestDetails.firstName,
          lastName: body.guestDetails.lastName,
          email: body.guestDetails.email,
          phone: body.guestDetails.phone,
          address: body.guestDetails.address,
          city: body.guestDetails.city,
          country: body.guestDetails.country || "India",
          password: body.guestDetails.password,
          totalBookings: 1,
          totalSpend: body.priceBreakdown?.total || 0,
          lastBookingDate: new Date().toISOString(),
          status: "active",
        });
      }
    }

    // Auto create Payment record
    const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    await Payment.create({
      id: `pay-${Date.now()}`,
      paymentId,
      bookingId,
      bookingNumber,
      customerId: body.guestDetails?.email || `cust-${Date.now()}`,
      customerName: `${body.guestDetails?.firstName} ${body.guestDetails?.lastName}`,
      amount: body.priceBreakdown?.total || 0,
      currency: "INR",
      method: body.paymentMethod || "card",
      status: "success",
      gateway: "razorpay",
      gatewayOrderId: `order_${Math.random().toString(36).substring(7)}`,
      gatewayPaymentId: `pay_${Math.random().toString(36).substring(7)}`,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create booking" });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { bookingNumber: id }, { _id: id }] }
      : { $or: [{ id }, { bookingNumber: id }] };

    const booking = await Booking.findOne(filter);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Handle in-time and out-time transitions
    if (body.bookingStatus === "checked-in" && !body.actualCheckIn && !booking.actualCheckIn) {
      body.actualCheckIn = new Date().toISOString();
    }
    if (body.bookingStatus === "checked-out" && !body.actualCheckOut && !booking.actualCheckOut) {
      body.actualCheckOut = new Date().toISOString();
    }

    if (body.bookingStatus && body.bookingStatus !== booking.bookingStatus) {
      booking.timeline.push({
        timestamp: new Date().toISOString(),
        event: "Status Changed",
        description: `Booking status updated from ${booking.bookingStatus} to ${body.bookingStatus}`,
        actor: "Admin",
      });
    }

    Object.assign(booking, body);
    await booking.save();

    // Synchronize room status with booking status
    const targetRoomId = booking.roomId || body.roomId;
    if (targetRoomId) {
      const roomFilter = mongoose.Types.ObjectId.isValid(targetRoomId)
        ? { $or: [{ id: targetRoomId }, { _id: targetRoomId }] }
        : { id: targetRoomId };

      if (body.bookingStatus === "checked-in") {
        await Room.findOneAndUpdate(roomFilter, {
          $set: { status: "occupied", currentBookingId: booking.id, lockedUntil: booking.checkOut }
        });
      } else if (body.bookingStatus === "checked-out") {
        await Room.findOneAndUpdate(roomFilter, {
          $set: { status: "cleaning", currentBookingId: null, lockedUntil: null }
        });
      } else if (body.bookingStatus === "cancelled") {
        await Room.findOneAndUpdate(roomFilter, {
          $set: { status: "available", currentBookingId: null, lockedUntil: null }
        });
      }
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update booking" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { bookingNumber: id }, { _id: id }] }
      : { $or: [{ id }, { bookingNumber: id }] };

    const deletedBooking = await Booking.findOneAndDelete(filter);
    if (!deletedBooking) return res.status(404).json({ error: "Booking not found" });

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete booking" });
  }
};
