import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <header className="top-bar">
      <div>
        <p className="top-bar__kicker">MyPPT Hub</p>
        <h1>{title}</h1>
        {subtitle ? <p className="top-bar__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
