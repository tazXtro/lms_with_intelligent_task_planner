"use client"
import React, { useEffect, useState, memo } from 'react';
import { BookOpen, Brain, Calendar, Target, TrendingUp, Users, GraduationCap } from 'lucide-react';

// --- Type Definitions ---
type IconType = 'courses' | 'ai' | 'calendar' | 'goals' | 'progress' | 'community';

type GlowColor = 'cyan' | 'purple';

interface SkillIconProps {
  type: IconType;
}

interface SkillConfig {
  id: string;
  orbitRadius: number;
  size: number;
  speed: number;
  iconType: IconType;
  phaseShift: number;
  glowColor: GlowColor;
  label: string;
}

interface OrbitingSkillProps {
  config: SkillConfig;
  angle: number;
}

interface GlowingOrbitPathProps {
  radius: number;
  glowColor?: GlowColor;
  animationDelay?: number;
}

// --- Icon Components ---
const iconComponents: Record<IconType, { component: () => React.JSX.Element; color: string }> = {
  courses: {
    component: () => <BookOpen className="w-full h-full text-cyan-400" strokeWidth={2} />,
    color: '#22D3EE'
  },
  ai: {
    component: () => <Brain className="w-full h-full text-purple-400" strokeWidth={2} />,
    color: '#A78BFA'
  },
  calendar: {
    component: () => <Calendar className="w-full h-full text-blue-400" strokeWidth={2} />,
    color: '#60A5FA'
  },
  goals: {
    component: () => <Target className="w-full h-full text-green-400" strokeWidth={2} />,
    color: '#4ADE80'
  },
  progress: {
    component: () => <TrendingUp className="w-full h-full text-orange-400" strokeWidth={2} />,
    color: '#FB923C'
  },
  community: {
    component: () => <Users className="w-full h-full text-pink-400" strokeWidth={2} />,
    color: '#F472B6'
  }
};

// --- Memoized Icon Component ---
const SkillIcon = memo(({ type }: SkillIconProps) => {
  const IconComponent = iconComponents[type]?.component;
  return IconComponent ? <IconComponent /> : null;
});
SkillIcon.displayName = 'SkillIcon';

// --- Configuration for the Orbiting Skills ---
const skillsConfig: SkillConfig[] = [
  // Inner Orbit
  { 
    id: 'courses',
    orbitRadius: 100, 
    size: 40, 
    speed: 1, 
    iconType: 'courses', 
    phaseShift: 0, 
    glowColor: 'cyan',
    label: 'Browse Courses'
  },
  { 
    id: 'ai',
    orbitRadius: 100, 
    size: 45, 
    speed: 1, 
    iconType: 'ai', 
    phaseShift: (2 * Math.PI) / 3, 
    glowColor: 'cyan',
    label: 'AI Planning'
  },
  { 
    id: 'calendar',
    orbitRadius: 100, 
    size: 40, 
    speed: 1, 
    iconType: 'calendar', 
    phaseShift: (4 * Math.PI) / 3, 
    glowColor: 'cyan',
    label: 'Schedule'
  },
  // Outer Orbit
  { 
    id: 'goals',
    orbitRadius: 180, 
    size: 50, 
    speed: -0.6, 
    iconType: 'goals', 
    phaseShift: 0, 
    glowColor: 'purple',
    label: 'Set Goals'
  },
  { 
    id: 'progress',
    orbitRadius: 180, 
    size: 45, 
    speed: -0.6, 
    iconType: 'progress', 
    phaseShift: (2 * Math.PI) / 3, 
    glowColor: 'purple',
    label: 'Track Progress'
  },
  { 
    id: 'community',
    orbitRadius: 180, 
    size: 40, 
    speed: -0.6, 
    iconType: 'community', 
    phaseShift: (4 * Math.PI) / 3, 
    glowColor: 'purple',
    label: 'Join Community'
  },
];

// --- Memoized Orbiting Skill Component ---
const OrbitingSkill = memo(({ config, angle }: OrbitingSkillProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { orbitRadius, size, iconType, label } = config;

  useEffect(() => {
    setMounted(true);
  }, []);

  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;

  return (
    <div
      className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: mounted ? `translate(calc(${x}px - 50%), calc(${y}px - 50%))` : 'translate(-50%, -50%)',
        zIndex: isHovered ? 20 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      suppressHydrationWarning
    >
      <div
        className={`
          relative w-full h-full p-2 bg-[#0D1426]/90 backdrop-blur-sm border border-white/20
          rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${isHovered ? 'scale-125 shadow-2xl border-cyan-400/50' : 'shadow-lg hover:shadow-xl'}
        `}
        style={{
          boxShadow: isHovered
            ? `0 0 30px ${iconComponents[iconType]?.color}40, 0 0 60px ${iconComponents[iconType]?.color}20` 
            : undefined
        }}
      >
        <SkillIcon type={iconType} />
        {isHovered && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#0D1426]/95 backdrop-blur-sm border border-cyan-400/30 rounded text-xs text-white whitespace-nowrap pointer-events-none">
            {label}
          </div>
        )}
      </div>
    </div>
  );
});
OrbitingSkill.displayName = 'OrbitingSkill';

// --- Optimized Orbit Path Component ---
const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan', animationDelay = 0 }: GlowingOrbitPathProps) => {
  const glowColors = {
    cyan: {
      primary: 'rgba(34, 211, 238, 0.3)',
      secondary: 'rgba(34, 211, 238, 0.15)',
      border: 'rgba(34, 211, 238, 0.25)'
    },
    purple: {
      primary: 'rgba(167, 139, 250, 0.3)',
      secondary: 'rgba(167, 139, 250, 0.15)',
      border: 'rgba(167, 139, 250, 0.25)'
    }
  };

  const colors = glowColors[glowColor] || glowColors.cyan;

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        animationDelay: `${animationDelay}s`,
      }}
    >
      {/* Glowing background */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
          boxShadow: `0 0 60px ${colors.primary}, inset 0 0 60px ${colors.secondary}`,
          animation: 'pulse 4s ease-in-out infinite',
          animationDelay: `${animationDelay}s`,
        }}
      />

      {/* Static ring for depth */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${colors.border}`,
          boxShadow: `inset 0 0 20px ${colors.secondary}`,
        }}
      />
    </div>
  );
});
GlowingOrbitPath.displayName = 'GlowingOrbitPath';

// --- Main App Component ---
export default function OrbitingSkills() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPaused || !mounted) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setTime(prevTime => prevTime + deltaTime);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, mounted]);

  const orbitConfigs: Array<{ radius: number; glowColor: GlowColor; delay: number }> = [
    { radius: 100, glowColor: 'cyan', delay: 0 },
    { radius: 180, glowColor: 'purple', delay: 1.5 }
  ];

  return (
    <main className="w-full h-[600px] flex items-center justify-center overflow-hidden bg-[#0D1426] rounded-xl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #22D3EE 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #A78BFA 0%, transparent 50%)`,
          }}
        />
      </div>

      <div 
        className="relative w-[calc(100%-40px)] h-[calc(100%-40px)] md:w-[450px] md:h-[450px] flex items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        
        {/* Central Icon with enhanced glow */}
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full flex items-center justify-center z-10 relative shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500/15 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="relative z-10">
            <GraduationCap className="w-9 h-9 text-cyan-400" strokeWidth={2} />
          </div>
        </div>

        {/* Render glowing orbit paths */}
        {orbitConfigs.map((config) => (
          <GlowingOrbitPath
            key={`path-${config.radius}`}
            radius={config.radius}
            glowColor={config.glowColor}
            animationDelay={config.delay}
          />
        ))}

        {/* Render orbiting skill icons */}
        {skillsConfig.map((config) => {
          const angle = time * config.speed + (config.phaseShift || 0);
          return (
            <OrbitingSkill
              key={config.id}
              config={config}
              angle={angle}
            />
          );
        })}
      </div>
    </main>
  );
}
