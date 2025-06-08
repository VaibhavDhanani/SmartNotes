import { useNavigate } from 'react-router-dom';
import Features from '../components/General/Features';
import Hero from '../components/General/Hero';
import HowItWorks from '../components/General/HowItWorks';
import Navbar from '../components/General/Navbar';

const HomePage = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <Navbar />
        <Hero onGetStarted={handleGetStarted} />
        <Features />
        <HowItWorks />
      </div>
    </div>
  );
};

export default HomePage;