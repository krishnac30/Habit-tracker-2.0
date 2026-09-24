import React from 'react';
import {
  Footprints,
  Droplet,
  BookOpen,
  Brain,
  Moon,
  Dumbbell,
  Flame,
  Heart,
  Sparkles,
  Coffee,
  Target,
  Compass,
  Zap,
  Sun,
  Shield,
  Award,
  CheckCircle2,
  Calendar,
  Smile,
  Home,
  CheckSquare,
  CircleDot
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = '', size = 20, style }) => {
  const iconProps = { className, size, style };

  switch (name.toLowerCase()) {
    case 'footprints':
    case 'walk':
      return <Footprints {...iconProps} />;
    case 'droplet':
    case 'water':
      return <Droplet {...iconProps} />;
    case 'bookopen':
    case 'read':
      return <BookOpen {...iconProps} />;
    case 'brain':
    case 'meditate':
      return <Brain {...iconProps} />;
    case 'moon':
    case 'sleep':
      return <Moon {...iconProps} />;
    case 'dumbbell':
    case 'gym':
      return <Dumbbell {...iconProps} />;
    case 'flame':
      return <Flame {...iconProps} />;
    case 'heart':
      return <Heart {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'coffee':
      return <Coffee {...iconProps} />;
    case 'target':
      return <Target {...iconProps} />;
    case 'compass':
      return <Compass {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'sun':
      return <Sun {...iconProps} />;
    case 'shield':
      return <Shield {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'check':
      return <CheckCircle2 {...iconProps} />;
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'mood':
      return <Smile {...iconProps} />;
    case 'home':
      return <Home {...iconProps} />;
    case 'habits':
      return <CheckSquare {...iconProps} />;
    case 'goals':
      return <CircleDot {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};
