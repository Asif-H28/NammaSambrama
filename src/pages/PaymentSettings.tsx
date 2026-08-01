import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { showToast } from '@/features/ui/uiSlice'
import {
  fetchPaymentSettings,
  savePaymentSettings,
  deletePaymentQr,
} from '@/features/payment/paymentThunks'

export function PaymentSettings() {
  const dispatch = useAppDispatch()
  const payment = useAppSelector((s) => s.payment.data)
  const loaded = useAppSelector((s) => s.payment.loaded)
  const saving = useAppSelector((s) => s.payment.saving)

  const [upiId, setUpiId] = useState('')
  const [payeeName, setPayeeName] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrPreview, setQrPreview] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loaded) dispatch(fetchPaymentSettings())
  }, [loaded, dispatch])

  useEffect(() => {
    if (payment) {
      setUpiId(payment.upiId || '')
      setPayeeName(payment.payeeName || '')
      setQrPreview(payment.qrImageUrl || '')
    }
  }, [payment])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setQrFile(file)
    setQrPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!upiId.trim()) {
      dispatch(showToast('UPI ID is required'))
      return
    }
    try {
      await dispatch(
        savePaymentSettings({ upiId: upiId.trim(), payeeName: payeeName.trim(), qrFile: qrFile || undefined }),
      ).unwrap()
      setQrFile(null)
      dispatch(showToast('Payment settings saved ✓'))
    } catch (err) {
      dispatch(showToast(String(err)))
    }
  }

  const handleDeleteQr = async () => {
    try {
      await dispatch(deletePaymentQr()).unwrap()
      setQrPreview('')
      setQrFile(null)
      dispatch(showToast('QR image removed'))
    } catch (err) {
      dispatch(showToast(String(err)))
    }
  }

  const upiDeepLink = upiId.trim()
    ? `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(payeeName.trim() || 'Namma Sambrama')}`
    : ''

  return (
    <div className="animate-rise">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-[22px]">
        <div>
          <div
            className="text-[11px] uppercase"
            style={{ letterSpacing: '.12em', color: 'var(--color-accent)' }}
          >
            Settings
          </div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 30 }}>Payment Settings</h2>
          <p className="text-muted m-0 text-[13px]">
            Configure UPI ID and QR code for customer payments. This will appear on the public site.
          </p>
        </div>
      </div>

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))' }}
      >
        {/* ─── Form Card ─── */}
        <div className="card elev-sm" style={{ padding: 28 }}>
          <h3
            style={{
              margin: '0 0 22px',
              font: '600 17px/1 var(--font-heading)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M7 15h0M2 9.5h20" />
            </svg>
            UPI Details
          </h3>

          {/* UPI ID */}
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="payment-upi-id"
              className="text-[12px] uppercase"
              style={{
                display: 'block',
                marginBottom: 7,
                letterSpacing: '.1em',
                color: 'var(--color-neutral-400)',
                fontWeight: 600,
              }}
            >
              UPI ID *
            </label>
            <input
              id="payment-upi-id"
              type="text"
              className="form-input"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-divider)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <p
              className="m-0"
              style={{ marginTop: 5, fontSize: 11, color: 'var(--color-neutral-500)' }}
            >
              Example: nammasambrama@ybl, business@paytm
            </p>
          </div>

          {/* Payee Name */}
          <div style={{ marginBottom: 22 }}>
            <label
              htmlFor="payment-payee-name"
              className="text-[12px] uppercase"
              style={{
                display: 'block',
                marginBottom: 7,
                letterSpacing: '.1em',
                color: 'var(--color-neutral-400)',
                fontWeight: 600,
              }}
            >
              Payee Name
            </label>
            <input
              id="payment-payee-name"
              type="text"
              className="form-input"
              placeholder="Namma Sambrama Events"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-divider)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <p
              className="m-0"
              style={{ marginTop: 5, fontSize: 11, color: 'var(--color-neutral-500)' }}
            >
              Displayed in the customer's payment app
            </p>
          </div>

          {/* QR Upload */}
          <div style={{ marginBottom: 24 }}>
            <label
              className="text-[12px] uppercase"
              style={{
                display: 'block',
                marginBottom: 7,
                letterSpacing: '.1em',
                color: 'var(--color-neutral-400)',
                fontWeight: 600,
              }}
            >
              QR Code Image
            </label>

            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
              style={{
                position: 'relative',
                padding: qrPreview ? 0 : '36px 20px',
                borderRadius: 'var(--radius-md)',
                border: `2px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                background: dragOver
                  ? 'color-mix(in srgb,var(--color-accent) 6%,transparent)'
                  : 'var(--color-surface)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all .2s ease',
                overflow: 'hidden',
              }}
            >
              {qrPreview ? (
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 20,
                  }}
                >
                  <img
                    src={qrPreview}
                    alt="QR Preview"
                    style={{
                      maxWidth: 200,
                      maxHeight: 200,
                      borderRadius: 12,
                      objectFit: 'contain',
                    }}
                  />
                </div>
              ) : (
                <>
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-neutral-400)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ margin: '0 auto 10px' }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <p
                    className="m-0"
                    style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}
                  >
                    Drop your QR code image here or{' '}
                    <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>browse</span>
                  </p>
                  <p
                    className="m-0"
                    style={{ marginTop: 4, fontSize: 11, color: 'var(--color-neutral-500)' }}
                  >
                    PNG, JPG up to 10 MB
                  </p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Delete QR button */}
            {qrPreview && (
              <div className="flex gap-2" style={{ marginTop: 10 }}>
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileRef.current?.click()
                  }}
                  style={{ fontSize: 12 }}
                >
                  Replace image
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleDeleteQr}
                  style={{ fontSize: 12, color: '#e05252' }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '13px 24px',
              fontSize: 14.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 16,
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin .6s linear infinite',
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* ─── Live Preview Card ─── */}
        <div className="card elev-sm" style={{ padding: 28 }}>
          <h3
            style={{
              margin: '0 0 22px',
              font: '600 17px/1 var(--font-heading)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Live Preview
          </h3>

          <p className="m-0" style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginBottom: 16 }}>
            This is how the payment section will appear on your public site.
          </p>

          {/* Preview frame */}
          <div
            style={{
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
              background:
                'linear-gradient(165deg,#050a18,#0d1b3e 55%,#1a2750)',
              border: '1px solid rgba(212,175,55,.25)',
            }}
          >
            {qrPreview ? (
              <div style={{ marginBottom: 18 }}>
                <div
                  className="qr-preview-ring"
                  style={{
                    display: 'inline-block',
                    padding: 6,
                    borderRadius: 18,
                    background:
                      'linear-gradient(135deg,rgba(212,175,55,.5),rgba(212,175,55,.15),rgba(212,175,55,.5))',
                  }}
                >
                  <img
                    src={qrPreview}
                    alt="QR"
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 14,
                      objectFit: 'contain',
                      background: '#fff',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: 160,
                  height: 160,
                  margin: '0 auto 18px',
                  borderRadius: 14,
                  border: '2px dashed rgba(212,175,55,.35)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'rgba(244,237,224,.4)',
                  fontSize: 11,
                }}
              >
                QR will appear here
              </div>
            )}

            {upiId.trim() && (
              <p
                className="m-0"
                style={{
                  fontSize: 12,
                  color: 'rgba(244,237,224,.6)',
                  marginBottom: 14,
                  fontFamily: "'Poppins',sans-serif",
                }}
              >
                UPI: <strong style={{ color: 'rgba(244,237,224,.85)' }}>{upiId.trim()}</strong>
              </p>
            )}

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                borderRadius: 999,
                background:
                  upiDeepLink
                    ? 'linear-gradient(150deg,#c9a84c,#d4af37 45%,#b8942e)'
                    : 'rgba(255,255,255,.08)',
                color: upiDeepLink ? '#12182c' : 'rgba(255,255,255,.3)',
                font: "700 14px/1 'Poppins',sans-serif",
                cursor: upiDeepLink ? 'pointer' : 'not-allowed',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 15h0M2 9.5h20" />
              </svg>
              Pay Now
            </div>

            {!upiId.trim() && !qrPreview && (
              <p
                className="m-0"
                style={{
                  marginTop: 16,
                  fontSize: 11.5,
                  color: 'rgba(244,237,224,.35)',
                  fontStyle: 'italic',
                }}
              >
                Fill in UPI details on the left to see the preview
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
