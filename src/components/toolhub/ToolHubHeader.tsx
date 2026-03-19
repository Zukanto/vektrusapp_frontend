import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const ToolHubHeader: React.FC = () => {
  const { user, userProfile } = useAuth();

  const firstName =
    userProfile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    '';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mx-auto mb-6">
        <img
          src="https://res.cloudinary.com/dcgwtngml/image/upload/v1756215064/vektrus_H15_sp8eco.png"
          alt="Vektrus Logo"
          className="h-14 w-auto"
        />
      </div>
      <h1 className="text-3xl font-bold text-[#111111] mb-3">
        {firstName ? `${greeting()}, ${firstName}!` : 'Willkommen in der Vektrus Beta'}
      </h1>
      <p className="text-lg text-[#7A7A7A] max-w-2xl mx-auto leading-relaxed">
        Dein Startpunkt für alle Tools, Tipps und Updates. Entdecke Vektrus und gestalte die Plattform mit uns.
      </p>
    </div>
  );
};
