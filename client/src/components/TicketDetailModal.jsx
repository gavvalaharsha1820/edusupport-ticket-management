import { useEffect, useState } from "react";
import { PRIORITY, STATUS } from "../constants/options";
import { api } from "../lib/api";
import Badge from "./Badge";
import Modal from "./Modal";

function timeLeft(date) {
  const ms = new Date(date) - new Date();

  if (ms <= 0) return "Overdue";

  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);

  return days
    ? `${days}d ${hours % 24}h`
    : hours
      ? `${hours}h`
      : `${Math.floor(ms / 60000)}m`;
}

export default function TicketDetailModal({ id, user, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      api(`/tickets/${id}`),

      user.role === "admin"
        ? api("/tickets/staff")
        : Promise.resolve({ users: [] }),
    ])
      .then(([ticketData, staffData]) => {
        setData(ticketData);
        setStaff(staffData.users);

        setStatus(ticketData.ticket.status);
        setPriority(ticketData.ticket.priority);
        setAssignedTo(ticketData.ticket.assignedTo?._id || "");
      })
      .catch((error) => setError(error.message));
  }, [id, user.role]);

  if (!data) {
    return (
      <Modal title="Loading ticket" onClose={onClose}>
        <div className="loading-box">
          <div className="spinner" />
          Loading details…
        </div>
      </Modal>
    );
  }

  const ticket = data.ticket;

  /*
   * Permission model:
   *
   * Admin:
   *   Can modify every ticket.
   *
   * Staff:
   *   Can modify only their assigned tickets.
   *
   * Other staff:
   *   Read-only.
   */
  const isAdmin = user.role === "admin";

  const isAssignedStaff =
    user.role === "staff" &&
    ticket.assignedTo &&
    String(ticket.assignedTo._id) === String(user.id);

  const canModify = isAdmin || isAssignedStaff;

  const overdue =
    new Date(ticket.slaDueAt) < new Date() &&
    !["Resolved", "Closed"].includes(ticket.status);

  async function save() {
    setBusy(true);
    setError("");

    try {
      const payload = {
        comment,
      };

      /*
       * Only Admin can send assignedTo.
       */
      if (isAdmin) {
        payload.assignedTo = assignedTo;
        payload.status = status;
        payload.priority = priority;
      }

      /*
       * Assigned staff can update
       * status and priority.
       */
      if (isAssignedStaff) {
        payload.status = status;
        payload.priority = priority;
      }

      await api(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      onChanged();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={ticket.title}
      subtitle={ticket.ticketNo}
      onClose={onClose}
      wide
    >
      <div className="ticket-detail-layout">
        <section>
          <div className="badge-row">
            <Badge tone={ticket.status}>{ticket.status}</Badge>

            <Badge tone={ticket.priority}>{ticket.priority}</Badge>

            <Badge tone={ticket.category}>{ticket.category}</Badge>
          </div>

          <div className="detail-section">
            <span className="field-label">Description</span>

            <p className="description-text">{ticket.description}</p>
          </div>

          <div className="detail-section">
            <div className="section-heading">
              <div>
                <h3>Activity history</h3>
                <span>{data.activities.length} events</span>
              </div>
            </div>

            <div className="timeline">
              {data.activities.map((activity) => (
                <div className="timeline-item" key={activity._id}>
                  <div className="timeline-dot" />

                  <div>
                    <strong>{activity.actor?.name || "User"}</strong>

                    <small>
                      {new Date(activity.createdAt).toLocaleString()}
                    </small>

                    <p>{activity.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="ticket-side-panel">
          <div className="info-card">
            <span>Student</span>
            <strong>{ticket.student.name}</strong>
            <small>{ticket.student.email}</small>
          </div>

          <div className="info-card">
            <span>Category</span>
            <strong>{ticket.category}</strong>
          </div>

          <div className="info-card">
            <span>SLA</span>

            <strong className={overdue ? "danger-text" : ""}>
              {["Resolved", "Closed"].includes(ticket.status)
                ? "Completed"
                : timeLeft(ticket.slaDueAt)}
            </strong>
          </div>

          <div className="info-card">
            <span>Owner</span>

            <strong>{ticket.assignedTo?.name || "Unassigned"}</strong>
          </div>
        </aside>
      </div>

      {/* ADMIN MANAGEMENT */}
      {isAdmin && (
        <div className="management-box">
          <div className="form-grid">
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITY.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Assign support owner
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>

              {staff.map((person) => (
                <option value={person._id} key={person._id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* ASSIGNED STAFF MANAGEMENT */}
      {isAssignedStaff && (
        <div className="management-box">
          <div className="assigned-banner">
            ✓ This ticket is assigned to you. You can update its status and
            priority.
          </div>

          <div className="form-grid">
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITY.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {/* READ ONLY MESSAGE FOR OTHER STAFF */}
      {user.role === "staff" && !isAssignedStaff && (
        <div className="readonly-banner">
          <strong>View only</strong>
          <span>
            This ticket is assigned to{" "}
            {ticket.assignedTo?.name || "another staff member"}. Only the
            assigned staff member or an administrator can modify it.
          </span>
        </div>
      )}

      {/* COMMENT */}
      {(user.role === "student" || canModify) && (
        <label className="comment-field">
          Add comment
          <textarea
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add an update, question or resolution note…"
          />
        </label>
      )}

      {error && <div className="alert error">{error}</div>}

      <div className="modal-actions">
        <button className="button secondary" onClick={onClose}>
          Close
        </button>

        {(user.role === "student" || canModify) && (
          <button
            className="button primary"
            disabled={
              busy ||
              (!comment.trim() && user.role !== "admin" && !isAssignedStaff)
            }
            onClick={save}
          >
            {busy ? "Saving…" : "Save update"}
          </button>
        )}
      </div>
    </Modal>
  );
}
