import QRCodeSVG from 'react-qr-code';
import './QRCode.css';

const QRCode = () => {
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
          size={256}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
        />
        <div className="qr-code-label">Scanează pentru a vota</div>
      </div>
    </div>
  );
};

export default QRCode;
