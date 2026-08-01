import type { PaymentSettings } from '@/types'

interface PaymentQrSectionProps {
  paymentData: PaymentSettings
  upiLink: string
  kn: boolean
}

function PhonePeBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5"
      style={{
        padding: '6px 13px',
        borderRadius: 10,
        background: '#5f259f',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "'Poppins', sans-serif",
        boxShadow: '0 2px 8px rgba(95,37,159,0.25)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#ffffff" />
        <path
          d="M14.5 8H11.5V6.8h3a.4.4 0 0 0 .4-.4V5.2a.4.4 0 0 0-.4-.4H8.8a.4.4 0 0 0-.4.4v13.2a.4.4 0 0 0 .4.4h1.8a.4.4 0 0 0 .4-.4v-4.8h2.3a3.1 3.1 0 0 0 3.1-3.1V11.1A3.1 3.1 0 0 0 14.5 8zm1 3.1a1.3 1.3 0 0 1-1.3 1.3H11.5V9.6h3a1.3 1.3 0 0 1 1.3 1.3v1.2z"
          fill="#5f259f"
        />
      </svg>
      <span>PhonePe</span>
    </div>
  )
}

function GooglePayBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5"
      style={{
        padding: '6px 13px',
        borderRadius: 10,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        color: '#3c4043',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "'Poppins', sans-serif",
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.09z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.72-4.96z"
        />
      </svg>
      <span>G Pay</span>
    </div>
  )
}

function PaytmBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5"
      style={{
        padding: '6px 13px',
        borderRadius: 10,
        background: '#002e6e',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 800,
        fontFamily: "'Poppins', sans-serif",
        boxShadow: '0 2px 8px rgba(0,46,110,0.25)',
      }}
    >
      <span style={{ color: '#00baf2' }}>pay</span>
      <span style={{ color: '#ffffff', background: '#00baf2', padding: '1px 5px', borderRadius: 4 }}>tm</span>
    </div>
  )
}

export function PaymentQrSection({ paymentData, upiLink, kn }: PaymentQrSectionProps) {
  return (
    <section
      id="payment"
      style={{
        padding: 'clamp(56px,7vw,84px) 24px',
        background: 'linear-gradient(180deg, var(--p-bg) 0%, color-mix(in srgb, var(--p-deep) 5%, var(--p-bg)) 100%)',
        borderTop: '1px solid color-mix(in srgb, var(--p-gold) 15%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--p-gold) 15%, transparent)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 860 }}>
        <div className="text-center" style={{ marginBottom: 40 }}>
          <div
            className="inline-block"
            style={{
              font: "600 12px/1 'Poppins',sans-serif",
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--p-gold-dark)',
              marginBottom: 10,
            }}
          >
            {kn ? 'ಪಾವತಿ ಮಾಹಿತಿ' : 'Payment Details'}
          </div>
          <h2
            style={{
              margin: '0 0 12px',
              font: "700 clamp(26px,4vw,36px)/1.2 'Playfair Display',serif",
              color: 'var(--p-deep)',
            }}
          >
            {kn ? 'ಸುಲಭ ಮತ್ತು ಸುರಕ್ಷಿತ ಪಾವತಿ' : 'Easy & Direct Payment'}
          </h2>
          <p
            className="mx-auto"
            style={{
              maxWidth: 580,
              margin: 0,
              fontSize: 14.5,
              lineHeight: 1.65,
              color: 'var(--p-muted)',
            }}
          >
            {kn
              ? 'ನಿಮ್ಮ ಈವೆಂಟ್ ಬುಕಿಂಗ್ ಮುಂಗಡ ಪಾವತಿಗಾಗಿ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗಿನ Pay Now ಬಟನ್ ಒತ್ತಿ.'
              : 'Scan the QR code or tap Pay Now below to pay advance for your event booking.'}
          </p>
        </div>

        <div
          className="mx-auto flex flex-col md:flex-row items-center justify-center gap-8"
          style={{
            padding: 36,
            borderRadius: 24,
            background: 'var(--p-card, #ffffff)',
            boxShadow: '0 16px 40px -12px rgba(0,0,0,0.08)',
            border: '1px solid color-mix(in srgb, var(--p-gold) 25%, transparent)',
            maxWidth: 680,
          }}
        >
          {paymentData.qrImageUrl && (
            <div className="flex-shrink-0 text-center">
              <div
                style={{
                  padding: 14,
                  borderRadius: 20,
                  background: '#ffffff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  border: '1px solid #eaeaea',
                  display: 'inline-block',
                }}
              >
                <img
                  src={paymentData.qrImageUrl}
                  alt="Payment QR Code"
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: 'contain',
                    borderRadius: 12,
                    display: 'block',
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: 'var(--p-muted)',
                  fontWeight: 600,
                }}
              >
                {kn ? 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿ' : 'Scan to Pay'}
              </div>
            </div>
          )}

          <div className="flex-1 w-full flex flex-col justify-center text-center md:text-left" style={{ minWidth: 240 }}>
            {paymentData.payeeName && (
              <div style={{ marginBottom: 20 }}>
                <span
                  style={{
                    fontSize: 11.5,
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    color: 'var(--p-muted)',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {kn ? 'ಸ್ವೀಕರಿಸುವವರ ಹೆಸರು' : 'Payee Name'}
                </span>
                <strong
                  style={{
                    fontSize: 20,
                    fontFamily: "'Playfair Display', serif",
                    color: 'var(--p-deep)',
                  }}
                >
                  {paymentData.payeeName}
                </strong>
              </div>
            )}

            {/* Pay Now Button */}
            <div style={{ marginBottom: 20 }}>
              <a
                href={upiLink || '#'}
                className="w-full inline-flex items-center justify-center gap-2"
                style={{
                  padding: '14px 28px',
                  borderRadius: 14,
                  background: 'linear-gradient(150deg,var(--p-gold-light),var(--p-gold) 45%,var(--p-gold-dark))',
                  color: 'var(--p-deeper)',
                  font: "700 15px/1 'Poppins',sans-serif",
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px -4px rgba(212,175,55,.45)',
                  transition: 'all .2s ease',
                  cursor: upiLink ? 'pointer' : 'default',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                {kn ? 'ಈಗಲೇ ಪಾವತಿಸಿ (Pay Now)' : 'Pay Now'}
              </a>
            </div>

            {/* Supported Payment Logos */}
            <div>
              <span
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: 'var(--p-muted)',
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                {kn ? 'ಸ್ವೀಕರಿಸಲಾಗುವ ಆಪ್‌ಗಳು' : 'Accepted via'}
              </span>
              <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                <PhonePeBadge />
                <GooglePayBadge />
                <PaytmBadge />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
