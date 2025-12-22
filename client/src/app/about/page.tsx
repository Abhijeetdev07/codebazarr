import AboutCTA from "@/components/homepage/AboutCTA";
import AboutFeatures from "@/components/homepage/AboutFeatures";
import AboutHero from "@/components/homepage/AboutHero";
import AboutHowItWorks from "@/components/homepage/AboutHowItWorks";
import AboutMissionVision from "@/components/homepage/AboutMissionVision";
import AboutWhyChooseUs from "@/components/homepage/AboutWhyChooseUs";

export default function AboutPage() {
    return (
        <div className="bg-white">
            <AboutHero />
            <AboutMissionVision />
            <AboutFeatures />
            <AboutHowItWorks />
            <AboutWhyChooseUs />
            <AboutCTA />
        </div>
    );
}
