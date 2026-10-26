import { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

export default function Membership() {
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    member: '',
    plan: 'Basic',
    price: '999',
    startDate: new Date().toLocaleDateString('en-CA'),
    expiryDate: '',
    status: 'Active',
  });

  async function fetchData() {
    try {
      setLoading(true);

      const [membersRes, membershipsRes] = await Promise.all([
        fetch(`${API}/members`),
        fetch(`${API}/memberships`),
      ]);

      if (!membersRes.ok || !membershipsRes.ok) {
        throw new Error('Failed to load data. Check your backend.');
      }

      const membersData = await membersRes.json();
      const membershipsData = await membershipsRes.json();

      setMembers(membersData);
      setMemberships(membershipsData);
    } catch (error) {
      setMessage(error.message || 'Cannot connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!form.member) {
      setMessage('Please select a member. Add a member first if the list is empty.');
      return;
    }

    if (!form.expiryDate || form.expiryDate < form.startDate) {
      setMessage('Please select a valid expiry date.');
      return;
    }

    try {
      const response = await fetch(`${API}/memberships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save membership.');
      }

      setMessage('Membership added successfully!');

      setForm({
        member: '',
        plan: 'Basic',
        price: '999',
        startDate: new Date().toLocaleDateString('en-CA'),
        expiryDate: '',
        status: 'Active',
      });

      await fetchData();
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    }
  }

  return (
    <div style={styles.page}>
      <h1>Membership Management</h1>
      <p style={styles.subtitle}>Create and manage gym memberships.</p>

      {message && <p style={styles.message}>{message}</p>}

      <section style={styles.card}>
        <h2>Add Membership</h2>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>
            Select Member
            <select
              name="member"
              value={form.member}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Choose a member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.phone})
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Membership Plan
            <select
              name="plan"
              value={form.plan}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </label>

          <label style={styles.label}>
            Price (₹)
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Start Date
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Expiry Date
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              min={form.startDate}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <button type="submit" style={styles.button}>
            Add Membership
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2>All Memberships ({memberships.length})</h2>

        {loading ? (
          <p>Loading...</p>
        ) : memberships.length === 0 ? (
          <p>No memberships found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {memberships.map((item) => (
                  <tr key={item._id}>
                    <td>{item.member?.name || 'Unknown'}</td>
                    <td>{item.plan}</td>
                    <td>₹{item.price}</td>
                    <td>
                      {item.startDate
                        ? new Date(item.startDate).toLocaleDateString('en-IN')
                        : '-'}
                    </td>
                    <td>
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString('en-IN')
                        : '-'}
                    </td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    padding: '30px',
    background: '#f4f6f9',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    color: '#1e293b',
  },
  subtitle: {
    color: '#64748b',
    marginBottom: '25px',
  },
  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '16px',
  },
  input: {
    display: 'block',
    width: '100%',
    maxWidth: '500px',
    boxSizing: 'border-box',
    padding: '11px',
    marginTop: '7px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    background: '#fff',
  },
  button: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  message: {
    padding: '12px',
    background: '#e0ecff',
    borderRadius: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
};