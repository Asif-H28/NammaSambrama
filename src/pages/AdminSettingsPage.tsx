import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '@/lib/api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { showToast } from '@/features/ui/uiSlice'

interface AdminUser {
  id: string
  username: string
  email: string
  isVerified: boolean
  createdAt?: string
}

export function AdminSettingsPage() {
  const dispatch = useAppDispatch()
  const currentAdmin = useAppSelector((s) => s.auth.admin)

  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await api.get<{ admins: AdminUser[] }>('/admin/users', true)
      setAdmins(res.admins || [])
    } catch (err) {
      dispatch(showToast(String(err)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const openAddModal = () => {
    setEditingAdmin(null)
    setUsername('')
    setEmail('')
    setPassword('')
    setShowModal(true)
  }

  const openEditModal = (user: AdminUser) => {
    setEditingAdmin(user)
    setUsername(user.username)
    setEmail(user.email)
    setPassword('')
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      dispatch(showToast('Username is required'))
      return
    }
    if (!email.trim()) {
      dispatch(showToast('Email address is required'))
      return
    }
    if (!editingAdmin && (!password || password.length < 6)) {
      dispatch(showToast('Password must be at least 6 characters'))
      return
    }

    setSaving(true)
    try {
      if (editingAdmin) {
        await api.put(`/admin/users/${editingAdmin.id}`, {
          username: username.trim(),
          email: email.trim(),
          password: password ? password : undefined,
        }, true)
        dispatch(showToast('Admin account updated ✓'))
      } else {
        await api.post('/admin/users', {
          username: username.trim(),
          email: email.trim(),
          password,
        }, true)
        dispatch(showToast('Allowed admin user created ✓'))
      }
      setShowModal(false)
      fetchAdmins()
    } catch (err) {
      dispatch(showToast(String(err)))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: AdminUser) => {
    if (user.email === 'asif28072001@gmail.com') {
      dispatch(showToast('Cannot delete primary super admin account'))
      return
    }
    if (!confirm(`Are you sure you want to remove access for ${user.email}?`)) {
      return
    }
    try {
      await api.del(`/admin/users/${user.id}`, undefined, true)
      dispatch(showToast('Admin access removed ✓'))
      fetchAdmins()
    } catch (err) {
      dispatch(showToast(String(err)))
    }
  }

  if (currentAdmin?.email !== 'asif28072001@gmail.com') {
    return (
      <div className="card text-center p-12">
        <h3 style={{ fontSize: 18, color: 'var(--color-text)' }}>Access Restricted</h3>
        <p style={{ color: 'var(--color-neutral-400)', fontSize: 14 }}>
          Only the super admin can access management settings.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-rise">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <div
            className="text-[11px] uppercase font-semibold"
            style={{ letterSpacing: '.12em', color: 'var(--color-accent)' }}
          >
            Access Management
          </div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 30, color: 'var(--color-text)' }}>
            Admin Panel Users
          </h2>
          <p className="m-0 text-[13px]" style={{ color: 'var(--color-neutral-400)' }}>
            Manage email addresses and passwords allowed to access the admin console.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-2"
          style={{
            padding: '10px 18px',
            fontSize: 13.5,
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(150deg,var(--color-accent-500),var(--color-accent-700))',
            color: '#ffffff',
            boxShadow: '0 4px 14px color-mix(in srgb, var(--color-accent) 35%, transparent)',
          }}
        >
          + Add Admin User
        </button>
      </div>

      {/* Admin Users List */}
      {loading ? (
        <div className="p-8 text-center" style={{ color: 'var(--color-neutral-400)' }}>
          Loading admin accounts...
        </div>
      ) : (
        <div
          className="overflow-hidden"
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-divider)',
            background: 'var(--color-surface)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--color-divider)',
                  background: 'color-mix(in srgb, var(--color-accent) 5%, transparent)',
                }}
              >
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--color-text)' }}>Username</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--color-text)' }}>Email ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--color-text)' }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--color-text)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid var(--color-divider)',
                    transition: 'background .15s ease',
                  }}
                >
                  <td style={{ padding: '14px 18px', color: 'var(--color-text)', fontWeight: 500 }}>
                    {u.username}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--color-neutral-300)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        background: u.isVerified ? '#16a34a' : 'var(--color-neutral-700)',
                        color: '#ffffff',
                      }}
                    >
                      {u.isVerified ? 'Active Admin' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="btn btn-secondary text-xs"
                        style={{ padding: '6px 12px' }}
                      >
                        Edit
                      </button>
                      {u.email !== 'asif28072001@gmail.com' && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="btn btn-secondary text-xs text-red-400"
                          style={{ padding: '6px 12px' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Admin Modal */}
      {showModal &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              background: 'rgba(10, 14, 26, 0.82)',
              backdropFilter: 'blur(10px)',
            }}
            onClick={() => setShowModal(false)}
          >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 20,
              background: '#161e31',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.75)',
              overflow: 'hidden',
              color: '#f8fafc',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0f172a',
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
                {editingAdmin ? 'Edit Admin User' : 'Add Allowed Admin User'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                  Email ID *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                  {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  placeholder={editingAdmin ? '••••••••' : 'at least 6 characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: 13.5,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(150deg, #6366f1, #4f46e5)',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {saving ? 'Saving...' : editingAdmin ? 'Save Changes' : 'Allow Access'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
