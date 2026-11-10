import StatusBar from "@/components/StatusBar";
import Hero from "@/components/Hero";
import EngineeringLog from "@/components/EngineeringLog";
import Runbook from "@/components/Runbook";
import Deployments from "@/components/Deployments";
import StatusPage from "@/components/StatusPage";
import Systems from "@/components/Systems";
import Telemetry from "@/components/Telemetry";
import Activity from "@/components/Activity";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BootIntro from "@/components/BootIntro";
import SeverityProvider from "@/components/severity/SeverityProvider";

export const revalidate = 21600; // re-render every 6h so the activity heatmap stays fresh

export default function Home() {
  return (
    <SeverityProvider>
      <BootIntro />
      <StatusBar />
      <main>
        <Hero />
        <EngineeringLog />
        <Runbook />
        <Deployments />
        <StatusPage />
        <Systems />
        <Telemetry />
        <Activity />
        <Contact />
      </main>
      <Footer />
    </SeverityProvider>
  );
}
