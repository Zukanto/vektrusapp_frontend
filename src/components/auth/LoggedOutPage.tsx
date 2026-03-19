import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck as CheckCircle, LogIn } from 'lucide-react';

const LoggedOutPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/login', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  const circumference = 2 * Math.PI * 20;
  const progress = (countdown / 5) * circumference;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #F4FCFE 0%, #EAF7FB 100%)' }}
    >
      <div
        className="flex flex-col items-center text-center"
        style={{ maxWidth: 440, padding: '0 24px' }}
      >
        <div className="relative mb-8">
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 80, height: 80, background: 'white', boxShadow: '0 4px 24px rgba(73,183,227,0.18)' }}
          >
            <CheckCircle size={36} style={{ color: '#49D69E' }} />
          </div>
        </div>

        <h1
          className="font-bold mb-3"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 28, color: '#111111', letterSpacing: '-0.5px' }}
        >
          Erfolgreich abgemeldet
        </h1>

        <p
          className="mb-10"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, color: '#7A7A7A', lineHeight: 1.6 }}
        >
          Deine Sitzung wurde sicher beendet. Du wirst in Kürze zur Anmeldeseite weitergeleitet.
        </p>

        <div className="flex items-center gap-4 mb-10">
          <div className="relative" style={{ width: 52, height: 52 }}>
            <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="26"
                cy="26"
                r="20"
                fill="none"
                stroke="#E8F5FD"
                strokeWidth="3"
              />
              <circle
                cx="26"
                cy="26"
                r="20"
                fill="none"
                stroke="#49B7E3"
                strokeWidth="3"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center font-bold"
              style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#49B7E3' }}
            >
              {countdown}
            </span>
          </div>
          <span
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#7A7A7A' }}
          >
            Weiterleitung in {countdown} {countdown === 1 ? 'Sekunde' : 'Sekunden'}
          </span>
        </div>

        <button
          onClick={() => navigate('/login', { replace: true })}
          className="flex items-center gap-2 rounded-[var(--vektrus-radius-md)] transition-all duration-200"
          style={{
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontSize: 15,
            fontWeight: 700,
            color: 'white',
            background: 'linear-gradient(135deg, #49B7E3 0%, #2A8AB4 100%)',
            padding: '13px 28px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(73,183,227,0.3)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(73,183,227,0.45)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(73,183,227,0.3)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          <LogIn size={16} />
          Jetzt anmelden
        </button>

        <div className="mt-12">
          <span
            style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 20, fontWeight: 800, color: '#111111', letterSpacing: '-0.5px' }}
          >
            Vektrus
          </span>
          <span
            style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 11, fontWeight: 600, color: '#49B7E3', marginLeft: 6, letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            Beta
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoggedOutPage;
