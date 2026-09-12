import StatusBar from "@/components/StatusBar";
import Hero from "@/components/Hero";
import EngineeringLog from "@/components/EngineeringLog";
import Deployments from "@/components/Deployments";
import Systems from "@/components/Systems";
import Telemetry from "@/components/Telemetry";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SeverityProvider from "@/components/severity/SeverityProvider";

export default function Home() {
  return (
    <SeverityProvider>
      <StatusBar />
      <main>
        <Hero />
        <EngineeringLog />
        <Deployments />
        <Systems />
        <Telemetry />
        <Contact />
      </main>
      <Footer />
    </SeverityProvider>
  );
}
