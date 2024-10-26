import React from 'react';
import HomeNavbar from "../components/HomeNavbar";
import HomeBody from "../components/HomeBody";
import AboutUs from "../pages/AboutUs"; 
import OurTeam from "../pages/OurTeam"
import ContactUs from "../pages/ContactUs";

export default function LandingPage() {
  return (
    <div className="font-montserrat">
      <HomeNavbar />
      <HomeBody />
      
      <div className="overflow-y-auto">
        <AboutUs />
        <OurTeam />
        <ContactUs />
      </div>
    </div>
  );
}
