import './home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <h1>
            <span className="hero-accent">MERN Boilerplate</span>
          </h1>
          <p>Start building your app with a lightweight full-stack baseline.</p>
        </div>
      </section>

      <div className="page-content">
        <section className="all-companies-section">
          <h2>Includes React frontend, Express API, MongoDB connection, and custom fetcher.</h2>
        </section>
      </div>
    </div>
  );
};

export default Home;
