const Notice = require('../models/Notice');

const getNotices = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, priority, targetAudience } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;

    if (query.validUntil) {
      query.$or = [
        { validUntil: null },
        { validUntil: { $gte: new Date() } }
      ];
    }

    const notices = await Notice.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience, validUntil } = req.body;

    const notice = new Notice({
      title,
      content,
      category: category || 'general',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      validUntil: validUntil ? new Date(validUntil) : null,
      createdBy: req.user.id
    });

    await notice.save();

    const populatedNotice = await Notice.findById(notice._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Notice created successfully',
      notice: populatedNotice
    });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience, validUntil, isActive } = req.body;
    
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.category = category || notice.category;
    notice.priority = priority || notice.priority;
    notice.targetAudience = targetAudience || notice.targetAudience;
    notice.validUntil = validUntil ? new Date(validUntil) : notice.validUntil;
    notice.isActive = isActive !== undefined ? isActive : notice.isActive;

    await notice.save();

    const updatedNotice = await Notice.findById(notice._id)
      .populate('createdBy', 'name');

    res.json({
      message: 'Notice updated successfully',
      notice: updatedNotice
    });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getActiveNotices = async (req, res) => {
  try {
    const query = {
      isActive: true,
      $or: [
        { validUntil: null },
        { validUntil: { $gte: new Date() } }
      ]
    };

    if (req.user.role === 'student') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' }
      ];
    }

    const notices = await Notice.find(query)
      .populate('createdBy', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);

    res.json(notices);
  } catch (error) {
    console.error('Get active notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getActiveNotices
};
