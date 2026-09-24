const Ticket = require("../models/Ticket");
const Activity = require("../models/Activity");
const User = require("../models/User");
const { getSlaDue } = require("../utils/sla");

function canAccess(user, ticket) {
  return (
    user.role !== "student" ||
    String(ticket.student?._id || ticket.student) === String(user._id)
  );
}

// Admin can modify every ticket.
// Staff can modify only tickets assigned to themselves.
function canModify(user, ticket) {
  if (user.role === "admin") return true;

  if (user.role === "staff") {
    return (
      ticket.assignedTo &&
      String(ticket.assignedTo) === String(user._id)
    );
  }

  return false;
}

exports.list = async (req, res, next) => {
  try {
    const query = {};

    // Students see only their own tickets.
    // Staff/Admin see all tickets.
    if (req.user.role === "student") {
      query.student = req.user._id;
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.category) query.category = req.query.category;
    if (req.query.assignedTo) query.assignedTo = req.query.assignedTo;

    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, "i") },
        { ticketNo: new RegExp(req.query.search, "i") }
      ];
    }

    const tickets = await Ticket.find(query)
      .populate("student", "name email department")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("student", "name email department")
      .populate("assignedTo", "name email role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!canAccess(req.user, ticket)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const activities = await Activity.find({ ticket: ticket._id })
      .populate("actor", "name role")
      .sort({ createdAt: 1 });

    res.json({ ticket, activities });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority = "Medium"
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required"
      });
    }

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      student: req.user._id,
      slaDueAt: getSlaDue(priority)
    });

    await Activity.create({
      ticket: ticket._id,
      actor: req.user._id,
      type: "created",
      message: `Ticket created with ${priority} priority`
    });

    const populated = await Ticket.findById(ticket._id)
      .populate("student", "name email department");

    res.status(201).json({ ticket: populated });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!canAccess(req.user, ticket)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      status,
      priority,
      assignedTo,
      comment
    } = req.body;

    /*
     * STUDENT
     * Students cannot change ticket management fields.
     * They can only add comments to their own tickets.
     */
    if (req.user.role === "student") {
      if (
        status !== undefined ||
        priority !== undefined ||
        assignedTo !== undefined
      ) {
        return res.status(403).json({
          message: "Students can only add comments"
        });
      }

      if (comment && comment.trim()) {
        await Activity.create({
          ticket: ticket._id,
          actor: req.user._id,
          type: "comment",
          message: comment.trim()
        });
      }

      const populated = await Ticket.findById(ticket._id)
        .populate("student", "name email department")
        .populate("assignedTo", "name email role");

      const activities = await Activity.find({
        ticket: ticket._id
      })
        .populate("actor", "name role")
        .sort({ createdAt: 1 });

      return res.json({
        ticket: populated,
        activities
      });
    }

    /*
     * STAFF / ADMIN
     *
     * Admin:
     * - Can modify every ticket
     * - Can assign/reassign tickets
     *
     * Staff:
     * - Can modify only tickets assigned to themselves
     * - Cannot assign/reassign tickets
     */
    const modifyingFields =
      status !== undefined ||
      priority !== undefined ||
      assignedTo !== undefined ||
      (comment && comment.trim());

    if (modifyingFields && !canModify(req.user, ticket)) {
      return res.status(403).json({
        message: "You can only modify tickets assigned to you"
      });
    }

    /*
     * ONLY ADMIN CAN ASSIGN / REASSIGN
     */
    if (assignedTo !== undefined) {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Only administrators can assign or reassign tickets"
        });
      }

      if (assignedTo) {
        const staff = await User.findOne({
          _id: assignedTo,
          role: "staff",
          active: true
        });

        if (!staff) {
          return res.status(400).json({
            message: "Please select an active staff member"
          });
        }
      }

      ticket.assignedTo = assignedTo || null;

      await Activity.create({
        ticket: ticket._id,
        actor: req.user._id,
        type: "assignment",
        message: assignedTo
          ? "Ticket assigned to a support staff member"
          : "Ticket unassigned"
      });
    }

    /*
     * PRIORITY
     */
    if (priority && priority !== ticket.priority) {
      ticket.priority = priority;
      ticket.slaDueAt = getSlaDue(
        priority,
        ticket.createdAt
      );

      await Activity.create({
        ticket: ticket._id,
        actor: req.user._id,
        type: "priority",
        message: `Priority changed to ${priority}`
      });
    }

    /*
     * STATUS
     */
    if (status && status !== ticket.status) {
      const allowedStatuses = [
        "Open",
        "Assigned",
        "In Progress",
        "Pending Student",
        "Resolved",
        "Closed"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status"
        });
      }

      ticket.status = status;

      if (status === "Resolved") {
        ticket.resolvedAt = new Date();
      }

      if (status === "Closed") {
        ticket.closedAt = new Date();
      }

      await Activity.create({
        ticket: ticket._id,
        actor: req.user._id,
        type:
          status === "Resolved"
            ? "resolution"
            : status === "Closed"
              ? "closure"
              : "status",
        message: `Status changed to ${status}`
      });
    }

    /*
     * COMMENT
     */
    if (comment && comment.trim()) {
      await Activity.create({
        ticket: ticket._id,
        actor: req.user._id,
        type: "comment",
        message: comment.trim()
      });
    }

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate("student", "name email department")
      .populate("assignedTo", "name email role");

    const activities = await Activity.find({
      ticket: ticket._id
    })
      .populate("actor", "name role")
      .sort({ createdAt: 1 });

    res.json({
      ticket: populated,
      activities
    });
  } catch (error) {
    next(error);
  }
};

exports.staff = async (req, res, next) => {
  try {
    // Only actual staff members are assignable.
    const users = await User.find({
      role: "staff",
      active: true
    })
      .select("name email role department")
      .sort({ name: 1 });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "student"
        ? { student: req.user._id }
        : {};

    const [
      total,
      active,
      resolved,
      overdue,
      byCategory,
      byPriority
    ] = await Promise.all([
      Ticket.countDocuments(filter),

      Ticket.countDocuments({
        ...filter,
        status: {
          $nin: ["Resolved", "Closed"]
        }
      }),

      Ticket.countDocuments({
        ...filter,
        status: "Resolved"
      }),

      Ticket.countDocuments({
        ...filter,
        status: {
          $nin: ["Resolved", "Closed"]
        },
        slaDueAt: {
          $lt: new Date()
        }
      }),

      Ticket.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      Ticket.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      metrics: {
        total,
        active,
        resolved,
        overdue
      },
      byCategory,
      byPriority
    });
  } catch (error) {
    next(error);
  }
};