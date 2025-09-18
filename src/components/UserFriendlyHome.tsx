import React from 'react';
import { DynamicIndustryHero } from './DynamicIndustryHero';
import { IndustryCarousel } from './IndustryCarousel';
import { BusinessShowcase } from './BusinessShowcase';
import { BusinessModelShowcase } from './BusinessModelShowcase';
import { JanitorialServices } from './JanitorialServices';
import { UniversalIndustryGrid } from './UniversalIndustryGrid';
import CompetitiveAdvantage from './CompetitiveAdvantage';
import StudentHero from './StudentHero';
import StudentFeatures from './StudentFeatures';
import EducationFeatures from './EducationFeatures';
import { IndustryAnalysisGrid } from './IndustryAnalysisGrid';
import { OdysseyDemo } from './OdysseyDemo';

export default function UserFriendlyHome() {
  return (
    <div className="min-h-screen">
      <DynamicIndustryHero />
      <IndustryCarousel />
      <IndustryAnalysisGrid />
      <OdysseyDemo />
      <BusinessModelShowcase />
      <JanitorialServices />
      <StudentHero />
      <StudentFeatures />
      <EducationFeatures />
      <BusinessShowcase />
      <UniversalIndustryGrid />
      <CompetitiveAdvantage />
    </div>
  );
}