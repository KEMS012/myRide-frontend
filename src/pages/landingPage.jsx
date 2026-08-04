import { useState } from "react";
import "../styles/landing.css";
import { Link } from "react-router-dom";
import { FaLocationDot, FaArrowRight, FaBolt, FaCalendarDays, FaIdCard, FaBuilding, FaUsers,   FaMapPin, FaTriangleExclamation, FaLock, FaShieldHalved, FaCalendarCheck, FaMotorcycle, FaTrophy, FaGraduationCap, FaBagShopping, FaHouse, FaLandmark, FaBus, FaSchool, FaRing, FaChampagneGlasses, FaBriefcase, FaPlane, FaMedal, FaChurch, FaHospital, FaCity, FaRoute, FaBars } from "react-icons/fa6";

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="landing-page">
      <header className={`navbar${menuOpen ? " menu-open" : ""}`}>
        <div className="logo">
          <img src="/myryde-logo.png" alt="MyRyde" className="logo-img" />
          <span className="logo-text">MyRyde</span>
        </div>

        <nav>
          <ul className={`nav-menu${menuOpen ? " open" : ""}`}>
            <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
            <li><a href="#services" onClick={() => setMenuOpen(false)}>Services</a></li>
            <li><a href="#safety" onClick={() => setMenuOpen(false)}>Safety</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
          </ul>
        </nav>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <FaBars />
        </button>

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/register" className="signup-btn">SignUp</Link>
        </div>
      </header>

      <section className="hero" id="home">

        <div className="hero-content">

          <span className="location-tag">
            <FaLocationDot />
            Launching in Ogbomoso
          </span>

          <h1>
            Reliable Transit For
            <span> OGBOMOSO </span>
            Daily Lifestyle
          </h1>

          <p>
            Experience safe, affordable and reliable transportation <b>ANYWHERE. ANYTIME. YOURS</b>.
            Going to school, work or events? MyRyde is your trusted ride companion.
            MyRyde connects you with trusted drivers around Ogbomoso.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              Book a Ride
              <FaArrowRight />
            </Link>

            <Link to="/register" className="secondary-btn">
              Learn More
            </Link>
          </div>

          <div className="hero-stats">

            <div className="stat-card">
              <h3>50+</h3>
              <span>Verified Drivers</span>
            </div>

            <div className="stat-card">
              <h3>400+</h3>
              <span>Happy Riders</span>
            </div>

            <div className="stat-card">
              <h3>24/7</h3>
              <span>Customer Support</span>
            </div>

          </div>

        </div>

        <div className="booking-card">

          <h2>Book Your Ride</h2>

          <label>Pickup Location</label>
          <input
            type="text"
            placeholder="Enter pickup location"
          />

          <label>Destination</label>
          <input
            type="text"
            placeholder="Where are you going?"
          />

          <label>Ride Type</label>

          <select>
            <option>Standard Ride</option>
            <option>Executive Ride</option>
            <option>Fixed Rider</option>
          </select>

          <div className="ride-choice">

            <div className="ride-option active">

              <FaBolt />

              <h4>Ride Now</h4>

              <small>Instant Booking</small>

            </div>

            <div className="ride-option">

              <FaCalendarDays />

              <h4>Schedule</h4>

              <small>Book Later</small>

            </div>

          </div>

          <button className="find-btn">
            Find Available Ride
          </button>

          <p className="booking-note">
            Secure • Verified Drivers • Safe Journey
          </p>

        </div>

      </section>

<section className="how-section">

  <div className="section-title">
    <span>HOW IT WORKS</span>
    <h2>Ride In Three Simple Steps</h2>
    <p>Getting around Ogbomoso has never been easier.</p>
  </div>

  <div className="steps-container">

    <div className="step-card">
      <div className="step-number">1</div>
      <h3>Book Your Ride</h3>
      <p>Choose your pickup point, destination and preferred ride type.</p>
    </div>

    <div className="step-card">
      <div className="step-number">2</div>
      <h3>Get Matched</h3>
      <p>We'll connect you with the nearest available verified driver.</p>
    </div>

    <div className="step-card">
      <div className="step-number">3</div>
      <h3>Enjoy Your Trip</h3>
      <p>Track your ride and arrive safely at your destination.</p>
    </div>

  </div>

</section>

<section className="why-section">

  <div className="section-title">
    <span>WHY MYRYDE?</span>
    <h2>Why Ogbomoso Chooses MyRyde</h2>
  </div>

  <div className="why-grid">

    <div className="why-card">
      <div className="icon-box"><FaShieldHalved /></div>
      <h3>Verified Drivers</h3>
      <p>Every driver passes identity verification before joining MyRyde.</p>
    </div>

    <div className="why-card">
      <div className="icon-box"><FaCalendarCheck /></div>
      <h3>Schedule Rides</h3>
      <p>Plan rides ahead and receive reminders through Google Calendar.</p>
    </div>

    <div className="why-card">
      <div className="icon-box"><FaMotorcycle /></div>
      <h3>Fixed Rider</h3>
      <p>Students and workers can keep the same trusted rider every week.</p>
    </div>

    <div className="why-card">
      <div className="icon-box"><FaTrophy /></div>
      <h3>Ride Rewards</h3>
      <p>Earn ride streaks, loyalty points and exclusive discounts.</p>
    </div>

  </div>

</section>

<section className="services-section" id="services">

  <div className="section-title">
    <span>OUR SERVICES</span>
    <h2>Transportation Made Easy</h2>
  </div>

  <div className="services-grid">

    <div className="service-card">
      <img
        src="/images/standard-ride.jpg"
        alt="Standard Ride"
      />
      <div className="service-content">
        <h3>Standard Ride</h3>
        <p>Affordable transportation for your everyday movement.</p>
      </div>
    </div>

    <div className="service-card">
      <img
        src="/images/executive-ride.jpg"
        alt="Executive Ride"
      />
      <div className="service-content">
        <h3>Executive Ride</h3>
        <p>Luxury cars for weddings, meetings and special occasions.</p>
      </div>
    </div>

    <div className="service-card">
      <img
        src="/images/bike-ride.jpg"
        alt="Bike Ride"
      />
      <div className="service-content">
        <h3>Fixed Rider</h3>
        <p>Book the same trusted bike rider weekly or monthly.</p>
      </div>
    </div>

    <div className="service-card">
      <img
        src="/images/scheduled-ride.jpg"
        alt="Scheduled Ride"
      />
      <div className="service-content">
        <h3>Scheduled Ride</h3>
        <p>Never miss an appointment by planning your rides in advance.</p>
      </div>
    </div>

  </div>

</section>

<section className="destination-section">

  <div className="section-title">
    <span>POPULAR DESTINATIONS</span>
    <h2>Move Easily Around Ogbomoso</h2>
    <p>Frequently visited places by MyRyde riders.</p>
  </div>

  <div className="destination-grid">

    <div className="destination-card">
      <h3><FaGraduationCap /> LAUTECH</h3>
      <p>Daily rides for students and staff.</p>
    </div>

    <div className="destination-card">
      <h3><FaBagShopping /> Oja-Igbo</h3>
      <p>Fast and affordable market transportation.</p>
    </div>

    <div className="destination-card">
      <h3><FaHouse /> Takie</h3>
      <p>Quick pickup and drop-off around Takie.</p>
    </div>

    <div className="destination-card">
      <h3><FaLandmark /> Soun Area</h3>
      <p>Reliable transportation within the city centre.</p>
    </div>

    <div className="destination-card">
      <h3><FaBus /> Owode</h3>
      <p>Daily trips connecting nearby communities.</p>
    </div>

    <div className="destination-card">
      <h3><FaSchool /> Baptist High School</h3>
      <p>Safe transportation for students and staff.</p>
    </div>

    <div className="destination-card">
      <h3><FaHouse /> Caretaker</h3>
      <p>Daily pickup and drop-off around Caretaker area.</p>
    </div>

    <div className="destination-card">
      <h3><FaCity /> Carlifornia</h3>
      <p>Reliable rides connecting Carlifornia to the city centre.</p>
    </div>

    <div className="destination-card">
      <h3><FaHospital /> General Hospital</h3>
      <p>Quick and comfortable trips to the hospital.</p>
    </div>

    <div className="destination-card">
      <h3><FaChurch /> Okelerin Baptist Church</h3>
      <p>Dependable transportation for church events and programmes.</p>
    </div>

    <div className="destination-card">
      <h3><FaBuilding /> Oja-Oba</h3>
      <p>Quick rides to and from the popular Oja-Oba market area.</p>
    </div>

    <div className="destination-card">
      <h3><FaRoute /> New Garage</h3>
      <p>Easy access rides connecting the New Garage motor park.</p>
    </div>

  </div>

</section>

<section className="fixed-rider">

  <div className="fixed-left">

    <span className="section-badge">FEATURED</span>

    <h2>Fixed Rider Program</h2>

    <p>
      Our Fixed Rider feature allows passengers to ride with the
      same trusted bike rider every week or month. Perfect for
      students, workers and families who value consistency and trust.
    </p>

    <ul className="feature-list">
      <li>✔ Weekly & Monthly Plans</li>
      <li>✔ Same Trusted Rider</li>
      <li>✔ Priority Scheduling</li>
      <li>✔ Better Safety & Familiarity</li>
    </ul>

    <button className="primary-btn">
      Learn More
    </button>

  </div>

  <div className="fixed-right">

    <div className="driver-profile">

      <img
        src="/images/driver-profile.jpg"
        alt="Driver"
      />

      <h3>Musa A.</h3>

      <span>Verified Rider</span>

      <div className="driver-stats">

        <div>
          <h4>4.9⭐</h4>
          <small>Rating</small>
        </div>

        <div>
          <h4>20+</h4>
          <small>Trips</small>
        </div>

        <div>
          <h4>3 yrs</h4>
          <small>Experience</small>
        </div>

      </div>

    </div>

  </div>

</section>

<section className="executive-section">

  <div className="section-title">
    <span>EXECUTIVE RIDES</span>
    <h2>Travel In Comfort & Style</h2>
  </div>

  <div className="executive-grid">

    <div className="executive-card">
      <h3><FaRing /> Weddings</h3>
      <p>Luxury transportation for your special day.</p>
    </div>

    <div className="executive-card">
      <h3><FaChampagneGlasses /> Parties</h3>
      <p>Arrive comfortably and make an impression.</p>
    </div>

    <div className="executive-card">
      <h3><FaBriefcase /> Business Meetings</h3>
      <p>Executive rides for professionals.</p>
    </div>

    <div className="executive-card">
      <h3><FaPlane /> Airport Trips</h3>
      <p>Reliable scheduled airport transportation.</p>
    </div>

  </div>

</section>

<section className="calendar-section">

  <div className="calendar-text">

    <span className="section-badge">
      SMART SCHEDULING
    </span>

    <h2>Never Miss A Ride Again</h2>

    <p>
      Schedule rides in advance and automatically add them
      to your Google Calendar with reminders.
    </p>

    <button className="primary-btn">
      Schedule Ride
    </button>

  </div>

  <div className="calendar-card">

    <h3>Monday</h3>

    <div className="calendar-item">
      <strong>7:30 AM</strong>
      <p>Takie → LAUTECH</p>
    </div>

    <div className="calendar-item">
      <strong>4:30 PM</strong>
      <p>LAUTECH → Takie</p>
    </div>

    <button className="calendar-btn">
      ✓ Added to Google Calendar
    </button>

  </div>

</section>


<section className="rewards-section">

  <div className="section-title">
    <span>LOYALTY REWARDS</span>
    <h2>Ride More. Earn More.</h2>
    <p>Get rewarded every time you ride with MyRyde.</p>
  </div>

  <div className="reward-grid">

    <div className="reward-card">
      <h3><FaMedal /> Bronze</h3>
      <h1>5</h1>
      <p>Completed Rides</p>
    </div>

    <div className="reward-card featured">
      <h3><FaMedal /> Silver</h3>
      <h1>20</h1>
      <p>Completed Rides</p>
    </div>

    <div className="reward-card">
      <h3><FaMedal /> Gold</h3>
      <h1>50+</h1>
      <p>Completed Rides</p>
    </div>

  </div>

</section>


<section className="safety-section" id="safety">

  <div className="section-title light">
    <span>YOUR SAFETY</span>
    <h2>Security Comes First</h2>
    <p>Every ride is protected with multiple safety measures.</p>
  </div>

  <div className="safety-grid">

    <div className="safety-card">
      <div className="safety-icon"><FaIdCard /></div>
      <h3>NIN Verification</h3>
      <p>Every driver must complete identity verification.</p>
    </div>

    <div className="safety-card">
      <div className="safety-icon"><FaBuilding /></div>
      <h3>BVN Verification</h3>
      <p>Financial identity verification before approval.</p>
    </div>

    <div className="safety-card">
      <div className="safety-icon"><FaUsers /></div>
      <h3>Next of Kin</h3>
      <p>Emergency contacts are securely stored.</p>
    </div>

    <div className="safety-card">
      <div className="safety-icon"><FaMapPin /></div>
      <h3>Ride Monitoring</h3>
      <p>Every trip is logged for accountability.</p>
    </div>

    <div className="safety-card sos-card">
      <div className="safety-icon sos-icon"><FaTriangleExclamation /></div>
      <div className="sos-button">SOS</div>
      <h3>SOS Emergency</h3>
      <p>Passengers can quickly request emergency assistance.</p>
    </div>

    <div className="safety-card">
      <div className="safety-icon"><FaLock /></div>
      <h3>Data Privacy</h3>
      <p>Your personal information is securely protected.</p>
    </div>

  </div>

</section>



<section className="partner-section">

  <div className="section-title">
    <span>PARTNERSHIPS</span>
    <h2>Serving Our Community</h2>
  </div>

  <div className="partner-grid">

    <div className="partner-card">
      <h1><FaSchool /></h1>
      <h3>Schools</h3>
      <p>Safe transportation for students and staff.</p>
    </div>

    <div className="partner-card">
      <h1><FaChurch /></h1>
      <h3>Churches</h3>
      <p>Reliable rides for church programmes and events.</p>
    </div>

    <div className="partner-card">
      <h1><FaBuilding /></h1>
      <h3>Businesses</h3>
      <p>Corporate transport for employees and guests.</p>
    </div>

    <div className="partner-card">
      <h1><FaHospital /></h1>
      <h3>Hospitals</h3>
      <p>Quick and comfortable trips to health facilities.</p>
    </div>

  </div>

</section>



<section className="testimonial-section">

  <div className="section-title">
    <span>TESTIMONIALS</span>
    <h2>What Our Riders Say</h2>
  </div>

  <div className="testimonial-grid">

    <div className="testimonial-card">
      <p>
        "The Fixed Rider feature is perfect for my daily trips to LAUTECH."
      </p>
      <h4>- Adebayo, Student</h4>
    </div>

    <div className="testimonial-card">
      <p>
        "Scheduling my rides has saved me from being late for work."
      </p>
      <h4>- Esther, Banker</h4>
    </div>

    <div className="testimonial-card">
      <p>
        "Executive rides were excellent for my wedding ceremony."
      </p>
      <h4>- Samuel, Business Owner</h4>
    </div>

  </div>

</section>



<section className="faq-section">

  <div className="section-title">
    <span>FAQ</span>
    <h2>Frequently Asked Questions</h2>
  </div>

  <div className="faq-list">

    <div className="faq-item">
      <h3>Can I schedule rides?</h3>
      <p>Yes. You can schedule rides for any future date and time.</p>
    </div>

    <div className="faq-item">
      <h3>Are drivers verified?</h3>
      <p>Yes. Every driver completes our KYC verification before approval.</p>
    </div>

    <div className="faq-item">
      <h3>What is Fixed Rider?</h3>
      <p>It lets you ride with the same trusted driver repeatedly.</p>
    </div>

  </div>

</section>



<section className="download-section">

  <div className="download-content">

    <span>COMING SOON</span>

    <h2>Download The MyRyde App</h2>

    <p>
      Experience smarter transportation across Ogbomoso.
      Available soon on Android and iOS.
    </p>

    <div className="download-buttons">
      <button className="primary-btn">Google Play</button>
      <button className="secondary-btn">App Store</button>
    </div>

  </div>

</section>

<footer className="footer" id="contact">

  <div className="footer-grid">

    <div>
      <img src="/myryde-logo.png" alt="MyRyde" className="footer-logo" />
      <p>Reliable transportation built for Ogbomoso.</p>
    </div>

    <div>
      <h3>Company</h3>
      <p>About</p>
      <p>Services</p>
      <p>Safety</p>
    </div>

    <div>
      <h3>Support</h3>
      <p>Help Centre</p>
      <p>Contact</p>
      <p>FAQs</p>
    </div>

    <div>
      <h3>Contact</h3>
      <p>Ogbomoso, Oyo State</p>
      <p>support@myryde.com</p>
      <p>+234 808 591 9225</p>
    </div>

  </div>

  <hr />

  <p className="copyright">
    © 2026 MyRyde. All Rights Reserved.
  </p>

</footer>

    </div>
  );
}

export default LandingPage;