import Hero from "@/components/Hero";
import FireCanvas from "@/components/FireCanvas";
import FlamesGame from "@/components/FlamesGame";

export default function Home() {
  return (
    <main id="app">
      <FireCanvas />
      <Hero />
      <FlamesGame />
    </main>
  );
}
