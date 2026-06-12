import VolumeCalculator from "./VolumeCalculator.jsx";

const base = import.meta.env.BASE_URL;

export default function VolumePage() {
  return (
    <div className="shell">
      <header className="masthead">
        <a href={base} className="back-link">← How&apos;s it going?</a>
        <h1>Body <em>volume</em></h1>
        <p className="lede">
          How much of the world map would you cover if you were spread one nanometre thin?
          Enter your height and weight to find out.
        </p>
      </header>

      <section className="grid">
        <VolumeCalculator />
      </section>

      <footer className="colophon">
        <span>Density model calibrated to average human body composition</span>
        <span>Geographic areas from Wikipedia</span>
      </footer>
    </div>
  );
}
