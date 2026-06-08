import React, { useEffect, useRef, useState } from 'react';

interface Stat {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  description: string;
}

const STATS: Stat[] = [
  { label: 'Hands-on Labs',      value: 50,    suffix: '+',  description: 'Real-world coding exercises' },
  { label: 'Learners',           value: 12000, suffix: '+',  prefix: '', description: 'Developers trained globally' },
  { label: 'Browsers Supported', value: 5,     suffix: '',   description: 'Chromium, Firefox, WebKit & more' },
  { label: 'Topics Covered',     value: 30,    suffix: '+',  description: 'From basics to CI/CD & API testing' },
];

// Easing: ease-out cubic so the count accelerates fast then decelerates
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOut(progress) * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, target, duration]);

  return count;
}

interface StatCardProps {
  stat: Stat;
  active: boolean;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, active, delay }) => {
  const count = useCountUp(stat.value, 1800, active);

  const formatted =
    stat.value >= 1000
      ? (count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K` : `${count}`)
      : `${count}`;

  return (
    <div
      className="stat-card"
      style={{
        transitionDelay: `${delay}ms`,
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <div className="stat-value">
        {stat.prefix ?? ''}{formatted}{stat.suffix}
      </div>
      <div className="stat-label">{stat.label}</div>
      <div className="stat-description">{stat.description}</div>
    </div>
  );
};

export const StatsCounter: React.FC = () => {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="stats-section">
      <div className="stats-header">
        <span className="stats-eyebrow">By the numbers</span>
        <h2 className="stats-title">Trusted by developers worldwide</h2>
      </div>
      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} active={active} delay={i * 100} />
        ))}
      </div>
    </div>
  );
};
