const Booking = require("../models/Booking");
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
    const booking = await Booking.findOne({ $or: [{ id }, { bookingNumber: id }] });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch booking" });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const body = req.body;

    // Validate dates
    if (!body.checkIn || !body.checkOut) {
      return res.status(400).json({ error: "Check-in and Check-out dates are required." });
    }

    const checkInDate = new Date(body.checkIn);
    const checkOutDate = new Date(body.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    if (checkInDate < today) {
      return res.status(400).json({ error: "Check-in date cannot be in the past." });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "Check-out date must be after check-in date." });
    }

    // Check overlapping bookings
    if (body.roomId) {
      const overlappingCount = await Booking.countDocuments({
        roomId: body.roomId,
        bookingStatus: { $nin: ["cancelled"] },
        $or: [
          {
            checkIn: { $lt: body.checkOut },
            checkOut: { $gt: body.checkIn },
          },
        ],
      });
      if (overlappingCount >= 5) {
        return res.status(409).json({
          error: "Selected accommodation is fully booked for these dates. Please choose alternate dates.",
        });
      }
    }

    const bookingId = `book-${Date.now()}`;
    const bookingNumber = `RG-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentMethod = body.paymentMethod || "pay_at_resort";
    const paymentStatus = body.paymentStatus === "paid" ? "paid" : "pending";

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
      nights: body.nights || 1,
      adults: body.adults || 1,
      children: body.children || 0,
      guestDetails: body.guestDetails,
      priceBreakdown: body.priceBreakdown,
      paymentStatus,
      paymentMethod,
      bookingStatus: "confirmed",
      notes: body.notes || "Booked online via Royalgrandin Resort Website",
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: "Booking Created",
          description: `Booking #${bookingNumber} confirmed`,
          actor: `${body.guestDetails?.firstName || "Guest"} ${body.guestDetails?.lastName || ""}`,
        },
      ],
    });

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

    const booking = await Booking.findOne({ $or: [{ id }, { bookingNumber: id }] });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

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

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update booking" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findOneAndDelete({ $or: [{ id }, { bookingNumber: id }] });
    if (!deletedBooking) return res.status(404).json({ error: "Booking not found" });

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete booking" });
  }
};
