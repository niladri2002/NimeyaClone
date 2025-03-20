
import "./home.css"; 

interface Homeprops {
  onNext: () => void;
}

const Home = ({ onNext }: Homeprops) => {
  const handleNavigation = () => {
    onNext();
  };

  return (
    <div className="container">
      <h1 className="title">Welcome to Our Service</h1>
      <div className="card" onClick={handleNavigation}>
        <img src="/will_creation.png" alt="Will Creation" className="image" />
        <h2>Will Creator</h2>
        <p>Ensure your family members are taken care of by creating your will.</p>
        <button className="button" onSubmit={handleNavigation}>LET'S GET STARTED</button>
      </div>
    </div>
  );
};

export default Home;
