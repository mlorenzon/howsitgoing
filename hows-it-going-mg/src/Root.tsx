import { Composition } from 'remotion';
import { Reel } from './Reel';

const FPS = 60;
const DURATION_S = 51.5;

export const Root: React.FC = () => (
  <Composition
    id="HowsItGoing"
    component={Reel}
    durationInFrames={Math.round(DURATION_S * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
