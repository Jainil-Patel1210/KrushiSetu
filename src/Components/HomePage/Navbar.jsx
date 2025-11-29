import React,{useState, useEffect} from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    const handleLoginClick = () => {
      navigate('/login');
    };

    const handleNavbarToggle = () => {
      setIsOpen(!isOpen);
    };

    const handleHomeClick = () => {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('home');
      } else {
        navigate('/');
      }
      setIsOpen(false);
    };

    const scrollToSection = (sectionId) => {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            const navbarHeight = 64;
            const offsetPosition =
              element.getBoundingClientRect().top +
              window.pageYOffset -
              navbarHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          const navbarHeight = 64;
          const offsetPosition =
            element.getBoundingClientRect().top +
            window.pageYOffset -
            navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }

      setActiveSection(sectionId);
      setIsOpen(false);
    };

    // 🔥 IMPORTANT FIX – detect current page
    useEffect(() => {
      if (location.pathname === "/subsidy-list") {
        setActiveSection("subsidy");
        return;
      }

      if (location.pathname.startsWith("/news/")) {
        setActiveSection("news");
        return;
      }

      if (location.pathname !== "/") {
        setActiveSection("home");
        return;
      }

      const handleScroll = () => {
        const sections = ["home", "subsidy", "news", "faq", "contact"];
        const viewportCenter = window.scrollY + window.innerHeight / 2;

        let minDistance = Infinity;
        let closestSection = "home";

        sections.forEach((sectionId) => {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementCenter = window.scrollY + rect.top + rect.height / 2;
            const distance = Math.abs(viewportCenter - elementCenter);

            if (distance < minDistance) {
              minDistance = distance;
              closestSection = sectionId;
            }
          }
        });

        setActiveSection(closestSection);
      };

      let rafId = null;
      let ticking = false;

      const onScroll = () => {
        if (!ticking) {
          rafId = window.requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      handleScroll();

      return () => {
        window.removeEventListener("scroll", onScroll);
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }, [location.pathname]);

    return (
      <>
        <div className="w-full bg-white text-black sticky top-0 z-50 shadow-md">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-2">
                <img src="/Krushisetu_banner-removebg-preview.png" className="h-15 w-40 bg-transparent" />
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-200 hover:bg-gray-100 focus:outline-none"
                onClick={handleNavbarToggle}
              >
                <div className="relative h-5 w-6">
                  <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all ${isOpen ? "top-2.5 rotate-45" : "top-0"}`} />
                  <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all ${isOpen ? "opacity-0" : "top-2.5 opacity-100"}`} />
                  <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all ${isOpen ? "top-2.5 -rotate-45" : "top-5"}`} />
                </div>
              </button>

              {/* Desktop Menu */}
              <div className="lg:flex space-x-6 hidden md:hidden">
                <button onClick={handleHomeClick} className={`Navbar ${activeSection === "home" ? "active" : ""}`}>Home</button>

                <button
                  onClick={() => scrollToSection("subsidy")}
                  className={`Navbar ${activeSection === "subsidy" ? "active" : ""}`}
                >
                  Subsidy
                </button>

                <button onClick={() => scrollToSection("news")} className={`Navbar ${activeSection === "news" ? "active" : ""}`}>
                  News
                </button>

                <button onClick={() => scrollToSection("faq")} className={`Navbar ${activeSection === "faq" ? "active" : ""}`}>
                  FAQ
                </button>

                <button onClick={() => scrollToSection("contact")} className={`Navbar ${activeSection === "contact" ? "active" : ""}`}>
                  Contact Us
                </button>

                <button onClick={handleLoginClick} className="bg-green-600 text-white font-semibold text-xl px-8 py-2 rounded-full">
                  Login
                </button>
              </div>

              {/* Mobile Menu */}
              {isOpen && (
                <div className="lg:hidden absolute top-16 right-0 w-2/4 shadow-md z-40">
                  <button onClick={handleHomeClick} className={`Navbar-mobile ${activeSection === "home" ? "active" : ""}`}>
                    Home
                  </button>
                  <button onClick={() => scrollToSection("subsidy")} className={`Navbar-mobile ${activeSection === "subsidy" ? "active" : ""}`}>
                    Subsidy
                  </button>
                  <button onClick={() => scrollToSection("news")} className={`Navbar-mobile ${activeSection === "news" ? "active" : ""}`}>
                    News
                  </button>
                  <button onClick={() => scrollToSection("faq")} className={`Navbar-mobile ${activeSection === "faq" ? "active" : ""}`}>
                    FAQ
                  </button>
                  <button onClick={() => scrollToSection("contact")} className={`Navbar-mobile ${activeSection === "contact" ? "active" : ""}`}>
                    Contact Us
                  </button>

                  <button onClick={handleLoginClick} className="Navbar-mobile mb-2 font-semibold">
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
