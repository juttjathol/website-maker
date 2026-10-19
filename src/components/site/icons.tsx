"use client";
import {
  AlignLeft, ArrowRight, Award, BarChart3, Bell, BookOpen, Briefcase, Brush,
  Building2, Calendar, Camera, Check, CircleHelp, Clock, Cloud, Code2, Columns3,
  Compass, Cpu, CreditCard, Database, Feather, FileText, Gift, Globe, Grid3x3,
  Heart, Home, Image as ImageIcon, Key, Layers, LayoutGrid, LayoutTemplate,
  Lightbulb, Mail, MapPin, Megaphone, MessageCircle, Minus, Monitor, MoreHorizontal,
  MoveVertical, Music2, Navigation, Newspaper, Palette, PanelBottom, Pencil, Phone,
  Pin, Play, Quote, Rocket, Search, Send, Settings, Share2, Shield, ShoppingBag,
  Sparkles, Square, Star, Store, Sun, Tag, ThumbsUp, Timer, TrendingUp, Type,
  Users, Video, Wand2, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  AlignLeft, ArrowRight, Award, BarChart: BarChart3, BarChart3, Bell, BookOpen,
  Briefcase, Brush, Building2, Calendar, Camera, Check, Clock, Cloud, Code2,
  Columns3, Compass, Cpu, CreditCard, Database, Feather, FileText, Gift, Globe,
  Grid3x3, Heart, HelpCircle: CircleHelp, Home, Image: ImageIcon, Key, Layers,
  LayoutGrid, LayoutTemplate, Lightbulb, Mail, MapPin, Megaphone, MessageCircle,
  Minus, Monitor, MoreHorizontal, MoveVertical, Music2, Navigation, Newspaper,
  Palette, PanelBottom, Pencil, Phone, Pin, Play, Quote, Rocket, Search, Send,
  Settings, Share2, Shield, ShoppingBag, Sparkles, Square, Star, Store, Sun, Tag,
  ThumbsUp, Timer, TrendingUp, Type, Users, Video, Wand2, Zap,
};

export const ICON_NAMES = Object.keys(ICONS).sort();

export function Icon({
  name,
  size = 24,
  strokeWidth = 2,
  className,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const C = ICONS[name] || Sparkles;
  return <C size={size} strokeWidth={strokeWidth} className={className} />;
}

/* --------------------------- social brand glyphs --------------------------- */

const XGlyph = ({ size = 19 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M18.9 2H22l-7.03 8.03L23.2 22h-6.5l-5.1-6.66L5.77 22H2.66l7.52-8.6L1.2 2h6.66l4.61 6.1L18.9 2Zm-1.14 18h1.83L7.02 3.88H5.06L17.76 20Z" />
  </svg>
);

const SOCIALS: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: (p: { size?: number }) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (p: { size?: number }) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="currentColor">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.6V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.5H7.5V14h2.7v8h3.3Z" />
    </svg>
  ),
  youtube: (p: { size?: number }) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="currentColor">
      <path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.2 12c0 1.6.1 3.2.4 4.8a2.8 2.8 0 0 0 2 2c1.6.4 8.4.4 8.4.4s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z" />
    </svg>
  ),
  tiktok: (p: { size?: number }) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="currentColor">
      <path d="M19.6 7.2a5.6 5.6 0 0 1-3.6-2.2V15a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v3a2.9 2.9 0 1 0 2 2.8V2h3a5.6 5.6 0 0 0 3.6 3.4v1.8Z" />
    </svg>
  ),
  x: (p: { size?: number }) => <XGlyph size={p.size || 17} />,
  linkedin: (p: { size?: number }) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="currentColor">
      <path d="M6.5 8.8H3.3V21h3.2V8.8ZM4.9 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.7 21v-6.7c0-3.6-1.9-5.3-4.5-5.3-2.1 0-3 1.1-3.5 1.9V8.8H9.5V21h3.2v-6.5c0-.4 0-.7.1-1 .3-.7.9-1.4 1.9-1.4 1.4 0 1.9 1 1.9 2.6V21h3.1Z" />
    </svg>
  ),
  github: (p: { size?: number }) => (
    <svg viewBox="0 0 24 24" width={p.size || 19} height={p.size || 19} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.9-.3 2.8 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1a3.6 3.6 0 0 1 .1 2.7 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  ),
  whatsapp: (p: { size?: number }) => <MessageCircle size={p.size || 19} />,
  pinterest: (p: { size?: number }) => <Pin size={p.size || 19} />,
  email: (p: { size?: number }) => <Mail size={p.size || 19} />,
  website: (p: { size?: number }) => <Globe size={p.size || 19} />,
};

export function SocialIcon({ platform, size }: { platform: string; size?: number }) {
  const C = SOCIALS[platform] || Globe;
  return <C size={size} />;
}
