import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import HeroSection from '../components/home/HeroSection';
import ServicesSection from '../components/home/ServicesSection';
import WhyChooseUsSection from '../components/home/WhyChooseUsSection';
import EmployerSection from '../components/home/EmployerSection';
import EmployeeCardsSection from '../components/home/EmployeeCardsSection';
import HowWeWorkSection from '../components/home/HowWeWorkSection';
import LocationCardsSection from '../components/home/LocationCardsSection';
import ContactCTASection from '../components/home/ContactCTASection';
import TrustedBySection from '../components/home/TrustedBySection';
import { getHeroData, updateHeroData, uploadHeroImage } from '../services/api';

export default function HomeManagement() {
  // ── Hero section state (still managed here, image upload flows through parent) ──
  const [heroSaving, setHeroSaving] = useState(false);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [heroData, setHeroData] = useState({
    title: '',
    highlightedText: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    heroImage: '',
    heroImageFile: null,
    stats: [],
    isActive: true,
  });

  // ── Load hero data on mount ────────────────────────────────────────────────
  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await getHeroData();
        if (res && res.data) {
          setHeroData(prev => ({ ...prev, ...res.data, heroImageFile: null }));
        }
      } catch {
        toast.error('Failed to load hero data');
      } finally {
        setIsHeroLoading(false);
      }
    };
    loadHero();
  }, []);

  // ── Hero onChange handler ──────────────────────────────────────────────────
  const handleHeroChange = (_, data) => setHeroData(data);

  // ── Hero save ──────────────────────────────────────────────────────────────
  const handleHeroSubmit = async () => {
    if (!heroData.title || !heroData.title.trim()) {
      toast.error('Hero section requires a title');
      return;
    }

    setHeroSaving(true);
    try {
      let currentHeroImage = heroData.heroImage;

      // 1. Upload new image first if a file was selected
      if (heroData.heroImageFile) {
        const uploadRes = await uploadHeroImage(heroData.heroImageFile);
        if (uploadRes.success) {
          currentHeroImage = uploadRes.data.heroImage;
          setHeroData(prev => ({ ...prev, heroImage: currentHeroImage, heroImageFile: null }));
        }
      }

      // 2. Save text fields
      await updateHeroData({
        title: heroData.title,
        highlightedText: heroData.highlightedText,
        subtitle: heroData.subtitle,
        description: heroData.description,
        buttonText: heroData.buttonText,
        buttonLink: heroData.buttonLink,
        heroImage: currentHeroImage,
        // Omit stats when unavailable so an unrelated Hero save cannot clear existing records.
        ...(Array.isArray(heroData.stats) ? { stats: heroData.stats } : {}),
        isActive: heroData.isActive,
      });

      toast.success('Hero section saved successfully!');
    } catch (error) {
      console.error('Hero save error:', error);
      toast.error(error.message || 'Failed to save hero section');
    } finally {
      setHeroSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Home Page Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Each section saves independently — changes to one section never affect another.
        </p>
      </div>

      <div className="space-y-6">
        {/* Hero — managed here for image upload flow */}
        <HeroSection
          data={heroData}
          onChange={handleHeroChange}
          onSave={handleHeroSubmit}
          isSaving={heroSaving}
          isLoading={isHeroLoading}
        />

          {/* Employer Section — fully self-contained, backed by employer section API */}
        <EmployerSection />

        {/* Services — fully self-contained, loads & saves its own data */}
        <ServicesSection />


        {/* How We Work — fully self-contained, backed by How We Work API */}
        <HowWeWorkSection />

        {/* Location Cards — fully self-contained, backed by location cards API */}
        <LocationCardsSection />

        

        {/* Why Choose Us — fully self-contained, backed by ApproachCards API */}
        <WhyChooseUsSection />
        
        {/* Trusted By — fully self-contained, section + logos management */}
        <TrustedBySection />

    
        {/* Contact CTA — fully self-contained, has its own save button */}
        <ContactCTASection />

      </div>
    </div>
  );
}