import { Html } from '@react-three/drei'

const FocusBadge = ({ label }) => (
  <Html center distanceFactor={1.5} occlude>
    <div
      style={{
        minWidth: '32px',
        padding: '1px 5px',
        borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.3)',
        background: 'rgba(6,10,18,0.7)',
        color: '#fff',
        fontSize: '10px',
        letterSpacing: '0.05em',
        textAlign: 'center',
        pointerEvents: 'none',
        backdropFilter: 'blur(4px)',
      }}
    >
      {label}
    </div>
  </Html>
)

export default FocusBadge
