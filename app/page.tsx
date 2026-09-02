import { MapCanvas } from "./map-canvas";
import { MapControls } from "./map-controls";

export default function HomePage() {
  return (
    <section className="relative h-[calc(100dvh-72px)] overflow-hidden bg-dusk md:h-dvh">
      <MapCanvas />
      <MapControls />
    </section>
  );
}
