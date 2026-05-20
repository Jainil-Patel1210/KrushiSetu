import React,{useState, useEffect} from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    const handleLoginClick = () => {
      navigate('/login'); // Navigate to /login route
    };

    const handleNavbarToggle = () =>{
      setIsOpen(!isOpen);
    }

    const handleHomeClick = () => {
      if (location.pathname === '/') {
        // If on homepage, scroll to top
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        setActiveSection('home');
      } else {
        // If on other page, navigate to homepage
        navigate('/');
      }
      setIsOpen(false);
    };

    const scrollToSection = (sectionId) => {
      // If not on homepage, navigate to homepage first
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            const navbarHeight = 64;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      } else {
        // Already on homepage, just scroll
        const element = document.getElementById(sectionId);
        if (element) {
          const navbarHeight = 64;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
      setActiveSection(sectionId);
      setIsOpen(false);
    };

    useEffect(() => {
      // If on news detail page, set news as active
      if (location.pathname.startsWith('/news/')) {
        setActiveSection('news');
        return;
      }
      
      // If not on homepage, set home as active
      if (location.pathname !== '/') {
        setActiveSection('home');
        return;
      }

      const handleScroll = () => {
        const sections = ['home', 'subsidy', 'news', 'faq', 'contact'];
        
        // Get the center point of viewport for more stable detection
        const viewportCenter = window.scrollY + (window.innerHeight / 2);
        
        let minDistance = Infinity;
        let closestSection = 'home';
        
        // Find which section center is closest to viewport center
        sections.forEach(sectionId => {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementCenter = window.scrollY + rect.top + (rect.height / 2);
            const distance = Math.abs(viewportCenter - elementCenter);
            
            if (distance < minDistance) {
              minDistance = distance;
              closestSection = sectionId;
            }
          }
        });
        
        setActiveSection(closestSection);
      };

      // Throttle with RAF for smooth, consistent updates
      let rafId = null;
      let lastKnownScrollPosition = 0;
      let ticking = false;

      const onScroll = () => {
        lastKnownScrollPosition = window.scrollY;
        
        if (!ticking) {
          rafId = window.requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      handleScroll(); // Set initial active section
      
      return () => {
        window.removeEventListener('scroll', onScroll);
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
      };
    }, []);

    return (
    <>
      <div className="w-full bg-white text-black sticky top-0 z-50 shadow-md">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <img src='/Krushisetu_banner-removebg-preview.png' className='h-15 w-40 bg-transparent' />
          </div>
          
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              onClick={handleNavbarToggle}
            >
            <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              <div className="relative h-5 w-6">
                <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'top-2.5 rotate-45' : 'top-0 rotate-0'}`}/>
                <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'top-2.5 opacity-100'}`}/>
                <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'top-2.5 -rotate-45' : 'top-5 rotate-0'}`}/>
              </div>
            </button>

            <div className="lg:flex space-x-6 hidden md:hidden">
              <button onClick={handleHomeClick} className={`Navbar ${activeSection === 'home' ? 'active' : ''}`}>Home</button>
              <button onClick={() => scrollToSection('subsidy')} className={`Navbar ${activeSection === 'subsidy' ? 'active' : ''}`}>Subsidy</button>
              <button onClick={() => scrollToSection('news')} className={`Navbar ${activeSection === 'news' ? 'active' : ''}`}>News</button>
              <button onClick={() => scrollToSection('faq')} className={`Navbar ${activeSection === 'faq' ? 'active' : ''}`}>FAQ</button>
              <button onClick={() => scrollToSection('contact')} className={`Navbar ${activeSection === 'contact' ? 'active' : ''}`}>Contact Us</button>
              <button onClick={handleLoginClick} className="bg-green-600 hover:scale-105 text-white font-semibold text-xl flex items-center justify-center px-8 py-2 rounded-full">Login</button>
            </div>

            {isOpen && (
              <div className="lg:hidden absolute top-16 right-0 bg-white w-2/4 shadow-md z-40">
                <button onClick={handleHomeClick} className={`Navbar-mobile ${activeSection === 'home' ? 'active' : ''}`}>Home</button>
                <button onClick={() => scrollToSection('subsidy')} className={`Navbar-mobile ${activeSection === 'subsidy' ? 'active' : ''}`}>Subsidy</button>
                <button onClick={() => scrollToSection('news')} className={`Navbar-mobile ${activeSection === 'news' ? 'active' : ''}`}>News</button>
                <button onClick={() => scrollToSection('faq')} className={`Navbar-mobile ${activeSection === 'faq' ? 'active' : ''}`}>FAQ</button>
                <button onClick={() => scrollToSection('contact')} className={`Navbar-mobile ${activeSection === 'contact' ? 'active' : ''}`}>Contact Us</button>
                <button
                  onClick={handleLoginClick}
                  className="Navbar-mobile mb-2 font-semibold">
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
