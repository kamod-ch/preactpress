import {Composition} from 'remotion';
import {YouTubeStarter} from './YouTubeStarter';

export const Root = () => {
  return (
    <Composition
      id="YouTubeStarter"
      component={YouTubeStarter}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={450}
      defaultProps={{
        title: 'PreactPress ships docs fast',
        subtitle: 'Preact + MDX documentation, packaged as a clean YouTube starter in Remotion',
      }}
    />
  );
};
