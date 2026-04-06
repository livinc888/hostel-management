const Room = require('../models/Room');
const User = require('../models/User');

const getRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, block } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (block) query.block = block.toUpperCase();

    const rooms = await Room.find(query)
      .populate('occupants', 'name email phone')
      .sort({ block: 1, floor: 1, roomNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Room.countDocuments(query);

    res.json({
      rooms,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createRoom = async (req, res) => {
  try {
    const { roomNumber, type, capacity, floor, block } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room with this number already exists' });
    }

    const room = new Room({
      roomNumber,
      type,
      capacity,
      floor,
      block: block.toUpperCase()
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { roomNumber, type, capacity, status, floor, block } = req.body;
    
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (roomNumber && roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber });
      if (existingRoom) {
        return res.status(400).json({ message: 'Room number already exists' });
      }
      room.roomNumber = roomNumber;
    }

    room.type = type || room.type;
    room.capacity = capacity || room.capacity;
    room.status = status || room.status;
    room.floor = floor || room.floor;
    room.block = block ? block.toUpperCase() : room.block;

    await room.save();

    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is already full' });
    }

    if (student.roomId) {
      const oldRoom = await Room.findById(student.roomId);
      if (oldRoom) {
        oldRoom.occupants = oldRoom.occupants.filter(id => id.toString() !== studentId);
        if (oldRoom.occupants.length === 0) {
          oldRoom.status = 'available';
        }
        await oldRoom.save();
      }
    }

    room.occupants.push(studentId);
    room.status = 'occupied';
    await room.save();

    student.roomId = roomId;
    await student.save();

    res.json({
      message: 'Room assigned successfully',
      room: await Room.findById(roomId).populate('occupants', 'name email phone')
    });
  } catch (error) {
    console.error('Assign room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeStudentFromRoom = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.roomId) {
      return res.status(400).json({ message: 'Student has no assigned room' });
    }

    const room = await Room.findById(student.roomId);
    if (room) {
      room.occupants = room.occupants.filter(id => id.toString() !== studentId);
      if (room.occupants.length === 0) {
        room.status = 'available';
      }
      await room.save();
    }

    student.roomId = null;
    await student.save();

    res.json({
      message: 'Student removed from room successfully'
    });
  } catch (error) {
    console.error('Remove student from room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRooms,
  createRoom,
  updateRoom,
  assignRoom,
  removeStudentFromRoom
};
