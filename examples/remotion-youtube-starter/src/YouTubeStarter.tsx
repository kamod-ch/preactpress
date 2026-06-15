import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type StarterProps = {
  title: string;
  subtitle: string;
};

const palette = {
  bg: '#0a0f1e',
  bg2: '#18233f',
  text: '#fffdf5',
  muted: '#b8c3ff',
  card: 'rgba(13, 21, 39, 0.72)',
  border: 'rgba(255,253,245,0.14)',
  accent: '#4f8cff',
  accent2: '#00c2a8',
  accent3: '#ff8a3d',
};

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 22px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.08)',
  border: `1px solid ${palette.border}`,
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: 0.2,
};

const FeatureCard: React.FC<{
  color: string;
  title: string;
  body: string;
  index: number;
}> = ({color, title, body, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = spring({
    fps,
    frame: frame - index * 8,
    config: {damping: 200, stiffness: 170},
  });

  return (
    <div
      style={{
        flex: 1,
        minHeight: 340,
        borderRadius: 36,
        padding: 36,
        background: palette.card,
        border: `1px solid ${palette.border}`,
        boxShadow: '0 20px 80px rgba(0,0,0,0.28)',
        transform: `translateY(${interpolate(reveal, [0, 1], [70, 0])}px) scale(${interpolate(
          reveal,
          [0, 1],
          [0.94, 1],
        )})`,
        opacity: reveal,
        backdropFilter: 'blur(18px)',
      }}
    >
      <div
        style={{
          width: 78,
          height: 78,
          borderRadius: 24,
          background: color,
          boxShadow: `0 0 40px ${color}`,
          marginBottom: 28,
        }}
      />
      <div style={{fontSize: 42, fontWeight: 800, color: palette.text, marginBottom: 18}}>{title}</div>
      <div style={{fontSize: 28, lineHeight: 1.45, color: 'rgba(248,250,252,0.82)'}}>{body}</div>
    </div>
  );
};

export const YouTubeStarter: React.FC<StarterProps> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn = spring({fps, frame, config: {damping: 200, stiffness: 120}});
  const logoReveal = spring({fps, frame: frame - 6, config: {damping: 160, stiffness: 150}});
  const heroShift = interpolate(fadeIn, [0, 1], [80, 0], {extrapolateRight: 'clamp'});
  const backgroundDrift = interpolate(frame, [0, 450], [0, -120], {extrapolateRight: 'clamp'});
  const outro = spring({
    fps,
    frame: frame - 360,
    config: {damping: 200, stiffness: 120, mass: 0.9},
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        background: `radial-gradient(circle at 20% 20%, rgba(124,58,237,0.35), transparent 30%),
          radial-gradient(circle at 80% 10%, rgba(34,211,238,0.20), transparent 28%),
          linear-gradient(135deg, ${palette.bg} 0%, ${palette.bg2} 100%)`,
        color: palette.text,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -200,
          transform: `translateY(${backgroundDrift}px)`,
          opacity: 0.45,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 68,
          right: 88,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '18px 24px',
          borderRadius: 24,
          background: 'rgba(13, 21, 39, 0.62)',
          border: `1px solid ${palette.border}`,
          backdropFilter: 'blur(18px)',
          transform: `translateY(${interpolate(logoReveal, [0, 1], [-28, 0])}px) scale(${interpolate(
            logoReveal,
            [0, 1],
            [0.96, 1],
          )})`,
          opacity: logoReveal,
          boxShadow: '0 20px 60px rgba(0,0,0,0.24)',
        }}
      >
        <Img
          src={staticFile('preactpress-wordmark-light.svg')}
          style={{width: 300, height: 'auto', display: 'block'}}
        />
      </div>
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill style={{justifyContent: 'center', padding: '100px 120px'}}>
          <div style={chipStyle}>▶ preactpress · YouTube starter</div>
          <div
            style={{
              marginTop: 42,
              fontSize: 94,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: -2.4,
              maxWidth: 1320,
              transform: `translateY(${heroShift}px)`,
              opacity: fadeIn,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 38,
              lineHeight: 1.35,
              maxWidth: 1040,
              color: 'rgba(248,250,252,0.86)',
              transform: `translateY(${heroShift + 12}px)`,
              opacity: fadeIn,
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 18,
              marginTop: 42,
              opacity: fadeIn,
              transform: `translateY(${heroShift + 18}px)`,
            }}
          >
            <div style={{...chipStyle, background: 'rgba(79,140,255,0.18)'}}>Preact docs</div>
            <div style={{...chipStyle, background: 'rgba(0,194,168,0.14)'}}>MDX components</div>
            <div style={{...chipStyle, background: 'rgba(255,138,61,0.14)'}}>Static deploys</div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={118} durationInFrames={200}>
        <AbsoluteFill style={{padding: '120px'}}>
          <div style={{fontSize: 64, fontWeight: 900, letterSpacing: -1.4, marginBottom: 22}}>
            Why teams pick PreactPress
          </div>
          <div style={{fontSize: 30, color: 'rgba(248,250,252,0.78)', marginBottom: 46}}>
            Position the product clearly: write in Markdown, add Preact components, ship polished docs with a lightweight stack.
          </div>
          <div style={{display: 'flex', gap: 28, alignItems: 'stretch'}}>
            <FeatureCard
              index={0}
              color={palette.accent}
              title="Write in MDX"
              body="Publish docs with Markdown-first workflows and drop interactive Preact components directly into content."
            />
            <FeatureCard
              index={1}
              color={palette.accent2}
              title="Theme quickly"
              body="Start with the built-in docs experience: nav, sidebar, search, dark mode and polished layout patterns."
            />
            <FeatureCard
              index={2}
              color={palette.accent3}
              title="Deploy anywhere"
              body="Render static output for GitHub Pages, Netlify, Cloudflare Pages, Vercel or any simple hosting target."
            />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={330} durationInFrames={120}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '120px',
            opacity: interpolate(outro, [0, 1], [0, 1], {easing: Easing.out(Easing.cubic)}),
            transform: `scale(${interpolate(outro, [0, 1], [0.94, 1])})`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              textTransform: 'uppercase',
              letterSpacing: 5,
              color: palette.muted,
              marginBottom: 26,
            }}
          >
            Built for launch videos
          </div>
          <div style={{fontSize: 106, fontWeight: 900, letterSpacing: -2.8, marginBottom: 26}}>
            Turn PreactPress into your next product video
          </div>
          <div style={{fontSize: 36, lineHeight: 1.4, maxWidth: 980, color: 'rgba(255,253,245,0.84)'}}>
            Swap in your release message, feature highlights and call-to-action — then export an MP4 with Remotion.
          </div>
          <div
            style={{
              marginTop: 44,
              padding: '22px 34px',
              borderRadius: 999,
              background: 'linear-gradient(90deg, rgba(79,140,255,0.96), rgba(0,194,168,0.96))',
              color: '#fff',
              fontSize: 30,
              fontWeight: 800,
              boxShadow: '0 20px 70px rgba(34,211,238,0.28)',
            }}
          >
            pnpm run render
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
