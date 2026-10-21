import StatusBar from "@/components/StatusBar";
import Hero from "@/components/Hero";
import EngineeringLog from "@/components/EngineeringLog";
import Runbook from "@/components/Runbook";
import Deployments from "@/components/Deployments";
import StatusPage from "@/components/StatusPage";
import Systems from "@/components/Systems";
import Telemetry from "@/components/Telemetry";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BootIntro from "@/components/BootIntro";
import SeverityProvider from "@/components/severity/SeverityProvider";

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
        <Contact />
      </main>
      <Footer />
    </SeverityProvider>
  );
}
