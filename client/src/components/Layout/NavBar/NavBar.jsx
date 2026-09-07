import { Link } from 'react-router-dom';
import './nav-bar.css';

const NavBar = () => {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo-link">
          <h1>MERN Starter</h1>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-item">
              Home
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
