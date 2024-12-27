import React from 'react';
import HomeNavbar from "../components/HomeNavbar";
import HomeBody from "../components/HomeBody";
import AboutUs from "../components/AboutUs"; 
import OurTeam from "../components/OurTeam"
import ContactUs from "../components/ContactUs";

export default function LandingPage() {
  return (
    <div className="font-montserrat overflow-auto">
      <HomeNavbar />
      <HomeBody />
      <AboutUs />
      <OurTeam />
      <ContactUs />
    </div>
  );
}
