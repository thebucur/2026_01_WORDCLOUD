import QRCodeSVG from 'react-qr-code';
import { useQRCodeVisibility } from '../context/QRCodeVisibilityContext';
import './QRCode.css';

const QRCode = () => {
  const { toggleVisibility } = useQRCodeVisibility();

  // Get the current URL and change path to /vote
  const getVoteUrl = () => {
    const currentUrl = window.location.origin;
    return `${currentUrl}/vote`;
  };

  const voteUrl = getVoteUrl();

  return (
    <div className="qr-code-container">
      <div className="qr-code-wrapper">
        <QRCodeSVG
          value={voteUrl}
          size={400}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
        />
        <div className="qr-code-label">Scanează pentru a vota</div>
        <button
          type="button"
          onClick={toggleVisibility}
          className="qr-code-hide-btn"
          title="Ascunde codul QR"
        >
          Ascunde
        </button>
      </div>
    </div>
  );
};

export default QRCode;
