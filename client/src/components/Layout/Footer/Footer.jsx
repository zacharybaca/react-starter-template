import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            MERN<span className="logo-accent">Starter</span>
          </Link>
          <p className="footer-tagline">
            Lightweight React + Express + MongoDB starter template.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} MERN Starter</p>
        <div className="footer-legal">
          <span>Built for MERN projects</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
