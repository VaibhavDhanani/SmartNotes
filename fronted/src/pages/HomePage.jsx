import { FileText, Users, Clock, Zap, ChevronRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Navbar from '../components/Navbar';

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