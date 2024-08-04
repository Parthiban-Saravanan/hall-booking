const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const rooms = [];
const bookings = [];
let bookingIdCounter = 1;

app.get('/', (req, res) => {
    res.send('Server is working well!');
});

// 1. Create a Room
app.post('/rooms', (req, res) => {
    const { numberOfSeats, amenities, pricePerHour } = req.body;

    const newRoom = {
        id: rooms.length + 1,
        numberOfSeats,
        amenities,
        pricePerHour,
        bookings: [],
    };

    rooms.push(newRoom);
    res.status(201).send(newRoom);
});

// 2. Book a Room
app.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    const room = rooms.find((room) => room.id === roomId);

    if (!room) {
        return res.status(404).send({ message: 'Room not found' });
    }

    const isRoomBooked = room.bookings.some(
        (booking) =>
            booking.date === date &&
            ((startTime >= booking.startTime && startTime < booking.endTime) ||
                (endTime > booking.startTime && endTime <= booking.endTime))
    );

    if (isRoomBooked) {
        return res.status(400).send({ message: 'Room is already booked for the given time' });
    }

    const newBooking = {
        id: bookingIdCounter++,
        customerName,
        date,
        startTime,
        endTime,
        roomId,
    };

    room.bookings.push(newBooking);
    bookings.push(newBooking);

    res.status(201).send(newBooking);
});

// 3. List All Rooms with Booked Data
app.get('/rooms', (req, res) => {
    const roomsWithBookings = rooms.map((room) => ({
        roomName: `Room ${room.id}`,
        bookedStatus: room.bookings.length > 0,
        bookings: room.bookings,
    }));

    res.send(roomsWithBookings);
});

// 4. List All Customers with Booked Data
app.get('/customers', (req, res) => {
    const customers = bookings.map((booking) => ({
        customerName: booking.customerName,
        roomName: `Room ${booking.roomId}`,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
    }));

    res.send(customers);
});

// 5. List Customer Booking History
app.get('/customers/:customerName/bookings', (req, res) => {
    const { customerName } = req.params;

    const customerBookings = bookings
        .filter((booking) => booking.customerName === customerName)
        .map((booking) => ({
            customerName: booking.customerName,
            roomName: `Room ${booking.roomId}`,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            bookingId: booking.id,
            bookingDate: booking.date,
            bookingStatus: 'Confirmed',
        }));

    res.send(customerBookings);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
