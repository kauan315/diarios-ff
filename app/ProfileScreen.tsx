"use client";

import {
  ArrowLeft, Search, QrCode, Pencil, ChevronDown, Diamond,
  KeyRound, Lock, MessageSquare, Paintbrush, Bot, Palette, LogOut, X, EyeOff,
  Check, Crown, Sparkles, ShieldCheck, TrendingUp, Users, Zap, Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  nickname: string;
  onClose: () => void;
  onLogout: () => void;
  profilePhoto: string;
  hideProfilePhoto: boolean;
  onProfilePhotoChange: (photo: string) => void;
  onToggleHideProfilePhoto: () => void;
  contactNames?: string[];
};

export default function ProfileScreen({ nickname, onClose, onLogout, profilePhoto, hideProfilePhoto, onProfilePhotoChange, onToggleHideProfilePhoto, contactNames = [] }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [themePreset, setThemePreset] = useState("classic-green");
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [themeColor, setThemeColor] = useState("green");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [showAccount, setShowAccount] = useState(false);
  const [lastSeen, setLastSeen] = useState<"todos" | "ninguem">("todos");
  const [hiddenPhotoContacts, setHiddenPhotoContacts] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState("7");

  useEffect(() => {
    try {
      const savedLastSeen = localStorage.getItem("dff_last_seen");
      const savedHiddenContacts = localStorage.getItem("dff_hidden_photo_contacts");
      const savedDuration = localStorage.getItem("dff_default_duration");
      if (savedLastSeen === "todos" || savedLastSeen === "ninguem") setLastSeen(savedLastSeen);
      if (savedHiddenContacts) setHiddenPhotoContacts(JSON.parse(savedHiddenContacts));
      if (savedDuration) setDurationDays(savedDuration);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dff_last_seen", lastSeen);
      localStorage.setItem("dff_hidden_photo_contacts", JSON.stringify(hiddenPhotoContacts));
      localStorage.setItem("dff_default_duration", durationDays);
    } catch {}
  }, [lastSeen, hiddenPhotoContacts, durationDays]);
  useEffect(() => {
    try {
      const savedColor = localStorage.getItem("dff_theme_color");
      const savedMode = localStorage.getItem("dff_theme_mode");
      const savedPreset = localStorage.getItem("dff_theme_preset");
      if (savedPreset && ["classic-green", "pink-candy", "sky-blue", "ruby-red", "neon-cyber", "galaxy-purple", "royal-gold", "toxic-acid", "sunset-fire", "midnight"].includes(savedPreset)) setThemePreset(savedPreset);
      if (savedColor && ["green", "pink", "blue", "red"].includes(savedColor)) setThemeColor(savedColor);
      if (savedMode === "light" || savedMode === "dark") setThemeMode(savedMode);
    } catch {}
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;
    document.documentElement.dataset.theme = themeColor;
    document.documentElement.dataset.mode = themeMode;
    document.documentElement.dataset.preset = themePreset;
    try {
      localStorage.setItem("dff_theme_color", themeColor);
      localStorage.setItem("dff_theme_mode", themeMode);
      localStorage.setItem("dff_theme_preset", themePreset);
    } catch {}
  }, [themeColor, themeMode, themePreset, themeLoaded]);

  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"mensal" | "anual">("anual");
  const items = [
    { icon: Diamond, title: "Assinaturas", desc: "Conheça os benefícios premium" },
    { icon: KeyRound, title: "Conta", desc: "Gmail da conta e senha" },
    { icon: Lock, title: "Privacidade", desc: "Visto por último, foto de perfil e duração padrão" },
    { icon: Paintbrush, title: "Aparência", desc: "Cores e modo claro ou escuro" },
    { icon: Bot, title: "Bots", desc: "Configurações de bots" },
    { icon: Palette, title: "Temas", desc: "Aparência personalizada" },
  ];

  return (
    <div className="fixed inset-0 bg-wa-bg z-50 flex flex-col">
      <div className="bg-wa-panel px-3 py-2.5 flex items-center justify-between shrink-0 border-b border-wa-border">
        <button onClick={onClose} className="text-wa-secondary p-1">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-4 text-wa-secondary">
          <button className="p-1"><Search size={22} /></button>
          <button className="p-1"><QrCode size={22} /></button>
          <button className="p-1"><Pencil size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-wa-panel pb-6 pt-2">
          <div className="relative flex flex-col items-center">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-white text-wa-text text-xs px-3 py-1 rounded-full shadow-sm border border-wa-border z-10 whitespace-nowrap">
              Como está seu humor?
            </div>
            <button onClick={() => photoInputRef.current?.click()} className="w-28 h-28 rounded-full bg-wa-green overflow-hidden flex items-center justify-center text-white font-semibold text-4xl mt-6 mb-3 shadow-md" aria-label="Escolher foto de perfil">
              {profilePhoto ? <img src={profilePhoto} alt="Foto de perfil" className="w-full h-full object-cover" /> : nickname.charAt(0).toUpperCase()}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!file.type.startsWith("image/")) { alert("Escolha um arquivo de imagem."); return; }
              const reader = new FileReader();
              reader.onload = () => {
                const image = new Image();
                image.onload = () => {
                  const canvas = document.createElement("canvas");
                  const scale = Math.min(1, 512 / Math.max(image.width, image.height));
                  canvas.width = Math.max(1, Math.round(image.width * scale));
                  canvas.height = Math.max(1, Math.round(image.height * scale));
                  const context = canvas.getContext("2d");
                  if (!context) return;
                  context.drawImage(image, 0, 0, canvas.width, canvas.height);
                  onProfilePhotoChange(canvas.toDataURL("image/jpeg", 0.78));
                };
                image.src = String(reader.result);
              };
              reader.readAsDataURL(file);
              event.target.value = "";
            }} />
            <p className="text-xs text-wa-secondary -mt-1 mb-2">Toque na foto para alterar</p>
            <button className="flex items-center gap-1 text-wa-text text-xl font-medium">
              {nickname}
              <ChevronDown size={18} className="text-wa-secondary" />
            </button>
          </div>
        </div>

        <div className="bg-wa-panel mt-2">
          {items.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                if (item.title === "Assinaturas") { setShowSubscriptions(true); return; }
                if (item.title === "Conta") { setShowAccount(true); return; }
                if (item.title === "Privacidade") { setShowPrivacy(true); return; }
                if (item.title === "Aparência") { setShowAppearance(true); return; }
                if (item.title === "Temas") { setShowThemes(true); return; }
                if (item.title === "Bots") { alert("Bots — em breve"); }
              }}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left"
            >
              <item.icon size={22} className="text-wa-secondary shrink-0" />
              <div className="flex-1 min-w-0 border-b border-wa-border pb-3">
                <p className="text-[16px] text-wa-text">{item.title}</p>
                {item.desc ? <p className="text-[13px] text-wa-secondary mt-0.5">{item.desc}</p> : null}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-wa-panel mt-2 mb-8">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left text-wa-danger"
          >
            <LogOut size={22} className="shrink-0" />
            <span className="text-[16px]">Sair da conta</span>
          </button>
        </div>
      </div>
      {showAccount && (
        <div className="fixed inset-0 z-[65] bg-wa-bg flex flex-col">
          <div className="bg-wa-panel px-3 py-3 flex items-center gap-3 border-b border-wa-border shrink-0">
            <button onClick={() => setShowAccount(false)} className="text-wa-secondary p-1" aria-label="Voltar às configurações">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-wa-text">Conta</h2>
              <p className="text-xs text-wa-secondary">Configurações da sua conta</p>
            </div>
          </div>
          <div className="bg-wa-panel mt-2">
            <div className="w-full flex items-center gap-4 px-4 py-4 text-left">
              <KeyRound size={22} className="text-wa-secondary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[16px] text-wa-text">Gmail da conta</p>
                <p className="text-[13px] text-wa-secondary mt-0.5">E-mail vinculado à sua conta</p>
              </div>
            </div>
            <div className="mx-4 border-b border-wa-border" />
            <div className="w-full flex items-center gap-4 px-4 py-4 text-left">
              <Lock size={22} className="text-wa-secondary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[16px] text-wa-text">Senha</p>
                <p className="text-[13px] text-wa-secondary mt-0.5">Segurança e acesso à conta</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSubscriptions && (
        <div className="fixed inset-0 z-[70] bg-wa-bg flex flex-col">
          <div className="bg-wa-panel px-3 py-3 flex items-center gap-3 border-b border-wa-border shrink-0">
            <button onClick={() => setShowSubscriptions(false)} className="text-wa-secondary p-1" aria-label="Voltar às configurações">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-wa-text">Diários FF <span className="text-amber-500">PREMIUM</span></h2>
              <p className="text-xs text-wa-secondary">Desbloqueie mais possibilidades</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 pt-7 pb-6 text-center bg-gradient-to-b from-amber-500/15 to-transparent">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <Crown size={42} />
              </div>
              <h3 className="text-2xl font-bold text-wa-text mt-4">Seu diário, em outro nível</h3>
              <p className="text-sm text-wa-secondary mt-2 max-w-sm mx-auto">Mais personalização, ferramentas exclusivas e destaque para sua comunidade.</p>
            </div>

            <div className="px-4 pb-4 space-y-3">
              <button onClick={() => setSelectedPlan("mensal")} className={`w-full rounded-2xl border p-4 text-left transition ${selectedPlan === "mensal" ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500" : "border-wa-border bg-wa-panel"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="font-semibold text-wa-text">Premium Mensal</p><p className="text-xs text-wa-secondary mt-1">Cobrança mensal</p></div>
                  <div className="text-right"><p className="text-xl font-bold text-wa-text">R$ 9,90</p><p className="text-xs text-wa-secondary">/ mês</p></div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === "mensal" ? "border-amber-500 bg-amber-500 text-white" : "border-wa-muted"}`}>{selectedPlan === "mensal" && <Check size={13} />}</span>
                </div>
              </button>
              <button onClick={() => setSelectedPlan("anual")} className={`w-full rounded-2xl border p-4 text-left transition relative ${selectedPlan === "anual" ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500" : "border-wa-border bg-wa-panel"}`}>
                <span className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[10px] uppercase font-bold tracking-wide px-2.5 py-1 rounded-full">Melhor custo-benefício</span>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div><p className="font-semibold text-wa-text">Premium Anual</p><p className="text-xs text-wa-secondary mt-1">Um pagamento por ano</p><p className="text-xs text-emerald-600 mt-1">Equivale a R$ 6,66/mês</p></div>
                  <div className="text-right"><p className="text-xl font-bold text-wa-text">R$ 79,90</p><p className="text-xs text-wa-secondary">/ ano</p></div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === "anual" ? "border-amber-500 bg-amber-500 text-white" : "border-wa-muted"}`}>{selectedPlan === "anual" && <Check size={13} />}</span>
                </div>
              </button>
            </div>

            <div className="px-5 pb-7">
              <h3 className="font-semibold text-wa-text mb-3">O que vem no Premium</h3>
              <div className="space-y-3">
                {[
                  { icon: ShieldCheck, title: "Selo Premium", desc: "Destaque especial no seu perfil e no diário." },
                  { icon: Star, title: "Diário em destaque", desc: "Prioridade na lista de comunidades para dar mais visibilidade." },
                  { icon: Bot, title: "Acesso a todos os bots", desc: "Use os bots premium que forem adicionados à plataforma." },
                  { icon: Palette, title: "Personalização exclusiva", desc: "Molduras douradas, temas, balões e cores para o perfil e chat." },
                  { icon: TrendingUp, title: "Estatísticas avançadas", desc: "Mais informações sobre atividade e participação da comunidade." },
                  { icon: Sparkles, title: "Recursos exclusivos", desc: "Emblemas, títulos raros e acesso antecipado a novidades." },
                ].map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0"><benefit.icon size={21} /></div>
                    <div><p className="text-sm font-medium text-wa-text">{benefit.title}</p><p className="text-xs text-wa-secondary mt-0.5 leading-relaxed">{benefit.desc}</p></div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-wa-muted mt-5 leading-relaxed">O selo Premium identifica assinantes; ele não representa, por si só, verificação de identidade. A assinatura e os pagamentos ainda precisam ser conectados ao sistema de cobrança para serem ativados.</p>
              <button onClick={() => alert("A tela de planos já está pronta, mas o pagamento ainda precisa ser integrado para ativar a assinatura.")} className="w-full mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3.5 shadow-md shadow-amber-500/20">
                Assinar Premium · {selectedPlan === "mensal" ? "R$ 9,90/mês" : "R$ 79,90/ano"}
              </button>
              <p className="text-center text-[11px] text-wa-muted mt-3">Você poderá escolher outro plano antes de assinar.</p>
            </div>
          </div>
        </div>
      )}
      {showAppearance && (
        <div className="fixed inset-0 z-[66] bg-wa-bg flex flex-col">
          <div className="bg-wa-panel px-3 py-3 flex items-center gap-3 border-b border-wa-border shrink-0">
            <button onClick={() => setShowAppearance(false)} className="text-wa-secondary p-1" aria-label="Voltar às configurações"><ArrowLeft size={24} /></button>
            <div><h2 className="text-lg font-semibold text-wa-text">Aparência</h2><p className="text-xs text-wa-secondary">Escolha as cores do Diários FF</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <section>
              <h3 className="text-sm font-semibold text-wa-text mb-3">Cor principal</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "green", label: "Verde", color: "#20b873", light: "#ffffff", dark: "#07110c" },
                  { id: "pink", label: "Rosa", color: themeMode === "dark" ? "#a83268" : "#f4a6c8", light: "#ffffff", dark: "#080608" },
                  { id: "blue", label: "Azul", color: themeMode === "dark" ? "#2457a6" : "#8fc5ff", light: "#ffffff", dark: "#060a11" },
                  { id: "red", label: "Vermelho", color: themeMode === "dark" ? "#a92732" : "#f3a0a5", light: "#ffffff", dark: "#100607" },
                ].map((color) => (
                  <button key={color.id} onClick={() => { setThemeColor(color.id); setThemePreset("classic-green"); }} className={`rounded-xl border p-3 flex items-center gap-3 text-left ${themeColor === color.id ? "border-wa-green ring-2 ring-wa-green/30" : "border-wa-border"}`}>
                    <span className="w-9 h-9 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.color }} />
                    <span className="flex-1 text-sm font-medium text-wa-text">{color.label}</span>
                    {themeColor === color.id && <Check size={18} className="text-wa-green" />}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-wa-text mb-3">Modo de exibição</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setThemeMode("light")} className={`rounded-xl border p-4 text-left ${themeMode === "light" ? "border-wa-green ring-2 ring-wa-green/30" : "border-wa-border"}`}>
                  <span className="block w-full h-12 rounded-lg border border-gray-200 bg-white mb-3 p-2"><span className="block h-2 w-2/3 rounded bg-gray-200" /><span className="block h-2 w-1/2 rounded bg-gray-100 mt-2" /></span>
                  <span className="text-sm font-medium text-wa-text">Claro</span>
                  <span className="block text-xs text-wa-secondary mt-1">Fundo branco e cor suave</span>
                </button>
                <button onClick={() => setThemeMode("dark")} className={`rounded-xl border p-4 text-left ${themeMode === "dark" ? "border-wa-green ring-2 ring-wa-green/30" : "border-wa-border"}`}>
                  <span className="block w-full h-12 rounded-lg border border-gray-700 bg-black mb-3 p-2"><span className="block h-2 w-2/3 rounded bg-gray-700" /><span className="block h-2 w-1/2 rounded bg-gray-800 mt-2" /></span>
                  <span className="text-sm font-medium text-wa-text">Escuro</span>
                  <span className="block text-xs text-wa-secondary mt-1">Fundo preto e cor mais escura</span>
                </button>
              </div>
            </section>
            <p className="text-xs text-wa-secondary">Sua escolha fica salva neste aparelho. No modo claro, as cores combinam com branco; no escuro, com preto e tons mais profundos.</p>
          </div>
        </div>
      )}
      {showThemes && (
        <div className="fixed inset-0 z-[68] bg-wa-bg flex flex-col">
          <div className="bg-wa-panel px-3 py-3 flex items-center gap-3 border-b border-wa-border shrink-0">
            <button onClick={() => setShowThemes(false)} className="text-wa-secondary p-1" aria-label="Voltar às configurações"><ArrowLeft size={24} /></button>
            <div className="flex-1"><h2 className="text-lg font-semibold text-wa-text">Temas</h2><p className="text-xs text-wa-secondary">Personalize o Diários FF como no WhatsApp GB</p></div>
            <Palette size={22} className="text-wa-green" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-wa-text">Temas gratuitos</h3><span className="text-[11px] rounded-full bg-emerald-500/15 text-emerald-500 px-2.5 py-1">GRÁTIS</span></div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "classic-green", name: "Clássico Verde", desc: "O visual original", accent: "#20b873", bg: "#101a15", panel: "#17251e" },
                  { id: "pink-candy", name: "Rosa Candy", desc: "Rosa suave e branco", accent: "#f09bc2", bg: "#fff7fb", panel: "#ffffff" },
                  { id: "sky-blue", name: "Azul Céu", desc: "Azul leve e limpo", accent: "#80baff", bg: "#f4f9ff", panel: "#ffffff" },
                  { id: "ruby-red", name: "Ruby", desc: "Vermelho elegante", accent: "#ed858c", bg: "#fff6f6", panel: "#ffffff" },
                ].map((theme) => (
                  <button key={theme.id} onClick={() => { setThemePreset(theme.id); if (theme.id === "classic-green") { setThemeColor("green"); setThemeMode("dark"); } else if (theme.id === "pink-candy") { setThemeColor("pink"); setThemeMode("light"); } else if (theme.id === "sky-blue") { setThemeColor("blue"); setThemeMode("light"); } else { setThemeColor("red"); setThemeMode("light"); } }} className={`rounded-2xl border p-2.5 text-left transition ${themePreset === theme.id ? "border-wa-green ring-2 ring-wa-green/30" : "border-wa-border"}`}>
                    <div className="h-24 rounded-xl overflow-hidden border border-black/10 mb-2.5" style={{ backgroundColor: theme.bg }}>
                      <div className="h-5 flex items-center gap-1 px-2" style={{ backgroundColor: theme.panel }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} /><span className="w-10 h-1.5 rounded-full" style={{ backgroundColor: theme.accent, opacity: .65 }} /></div>
                      <div className="p-2 space-y-2"><div className="w-3/4 h-4 rounded-lg rounded-tl-none" style={{ backgroundColor: theme.panel }} /><div className="ml-auto w-2/3 h-4 rounded-lg rounded-tr-none" style={{ backgroundColor: theme.accent, opacity: .8 }} /><div className="w-1/2 h-3 rounded-lg" style={{ backgroundColor: theme.panel }} /></div>
                    </div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accent }} /><span className="text-sm font-semibold text-wa-text">{theme.name}</span>{themePreset === theme.id && <Check size={14} className="text-wa-green ml-auto" />}</div>
                    <p className="text-[11px] text-wa-secondary mt-1">{theme.desc}</p>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-wa-text">Temas Premium</h3><span className="text-[11px] rounded-full bg-amber-500/15 text-amber-500 px-2.5 py-1 flex items-center gap-1"><Crown size={12} /> EXCLUSIVOS</span></div>
              <p className="text-xs text-wa-secondary mb-3">Temas com cores intensas e visuais especiais para assinantes Premium.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "neon-cyber", name: "Neon Cyber", desc: "Ciano elétrico e preto", accent: "#00f5ff", bg: "#030b16", panel: "#0b1830" },
                  { id: "galaxy-purple", name: "Galaxy Roxo", desc: "Roxo cósmico", accent: "#b56bff", bg: "#10051d", panel: "#201035" },
                  { id: "royal-gold", name: "Ouro Real", desc: "Preto e dourado", accent: "#f4c453", bg: "#100d05", panel: "#211a0a" },
                  { id: "toxic-acid", name: "Toxic Acid", desc: "Verde ácido e carvão", accent: "#c4ff00", bg: "#080d03", panel: "#18200a" },
                  { id: "sunset-fire", name: "Sunset Fire", desc: "Laranja incandescente", accent: "#ff7043", bg: "#170805", panel: "#2b120b" },
                  { id: "midnight", name: "Midnight", desc: "Azul profundo e prata", accent: "#9bbcff", bg: "#050914", panel: "#101b31" },
                ].map((theme) => (
                  <button key={theme.id} onClick={() => alert("Este tema é exclusivo do Premium. A assinatura ainda precisa ser conectada ao sistema de pagamento para confirmar o acesso.")} className="rounded-2xl border border-amber-500/30 bg-wa-panel p-2.5 text-left relative overflow-hidden">
                    <div className="absolute top-3 right-3 z-10 rounded-full bg-black/70 text-amber-300 p-1.5"><Lock size={13} /></div>
                    <div className="h-24 rounded-xl overflow-hidden border border-white/10 mb-2.5" style={{ backgroundColor: theme.bg }}>
                      <div className="h-5 flex items-center gap-1 px-2" style={{ backgroundColor: theme.panel }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} /><span className="w-10 h-1.5 rounded-full" style={{ backgroundColor: theme.accent, opacity: .75, boxShadow: `0 0 8px ${theme.accent}` }} /></div>
                      <div className="p-2 space-y-2"><div className="w-3/4 h-4 rounded-lg rounded-tl-none" style={{ backgroundColor: theme.panel }} /><div className="ml-auto w-2/3 h-4 rounded-lg rounded-tr-none" style={{ backgroundColor: theme.accent, opacity: .85, boxShadow: `0 0 12px ${theme.accent}55` }} /><div className="w-1/2 h-3 rounded-lg" style={{ backgroundColor: theme.panel }} /></div>
                    </div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accent, boxShadow: `0 0 7px ${theme.accent}` }} /><span className="text-sm font-semibold text-wa-text">{theme.name}</span></div>
                    <p className="text-[11px] text-wa-secondary mt-1">{theme.desc}</p>
                    <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1"><Lock size={11} /> Exclusivo Premium</p>
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowThemes(false); setShowSubscriptions(true); }} className="w-full mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3"><Crown size={17} className="inline mr-2" />Conhecer o Premium</button>
              <p className="text-[10px] text-wa-muted text-center mt-2">O acesso Premium só poderá ser confirmado quando o sistema de assinatura estiver integrado.</p>
            </section>
            <p className="text-xs text-wa-secondary">Os temas gratuitos são aplicados imediatamente e ficam salvos neste aparelho. Os temas Premium aparecem bloqueados até a assinatura ser validada.</p>
          </div>
        </div>
      )}
      {showPrivacy && (
        <div className="fixed inset-0 z-[60] bg-wa-bg flex flex-col">
          <div className="bg-wa-panel px-3 py-3 flex items-center gap-3 border-b border-wa-border shrink-0">
            <button onClick={() => setShowPrivacy(false)} className="text-wa-secondary p-1" aria-label="Voltar às configurações"><ArrowLeft size={24} /></button>
            <div><h2 className="text-lg font-semibold text-wa-text">Privacidade</h2><p className="text-xs text-wa-secondary">Controle o que outras pessoas podem ver</p></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="bg-wa-panel mt-2 px-4 py-4">
              <p className="text-[16px] font-medium text-wa-text">Visto por último e online</p>
              <p className="text-[13px] text-wa-secondary mt-1 mb-3">Escolha quem pode ver quando você esteve online ou se está online agora.</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-wa-text"><input type="radio" name="lastSeen" checked={lastSeen === "todos"} onChange={() => setLastSeen("todos")} className="accent-emerald-600" /> Todos podem ver</label>
                <label className="flex items-center gap-3 text-sm text-wa-text"><input type="radio" name="lastSeen" checked={lastSeen === "ninguem"} onChange={() => setLastSeen("ninguem")} className="accent-emerald-600" /> Ninguém pode ver</label>
              </div>
            </div>
            <div className="bg-wa-panel mt-2 px-4 py-4">
              <p className="text-[16px] font-medium text-wa-text">Foto de perfil</p>
              <p className="text-[13px] text-wa-secondary mt-1 mb-3">Selecione os contatos que você não quer que vejam sua foto.</p>
              {contactNames.length === 0 ? <p className="text-sm text-wa-secondary">Nenhum contato encontrado por enquanto.</p> : (
                <div className="space-y-1">
                  {contactNames.map((contact) => (
                    <label key={contact} className="flex items-center gap-3 py-2 text-sm text-wa-text">
                      <input type="checkbox" checked={hiddenPhotoContacts.includes(contact)} onChange={(event) => setHiddenPhotoContacts((prev) => event.target.checked ? [...prev, contact] : prev.filter((name) => name !== contact))} className="accent-emerald-600" />
                      <span className="w-9 h-9 rounded-full bg-wa-green/15 text-wa-green flex items-center justify-center font-medium">{contact.charAt(0).toUpperCase()}</span>
                      <span>{contact}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-wa-muted mt-2">A lista usa nomes que já apareceram nas conversas deste aparelho.</p>
            </div>
            <div className="bg-wa-panel mt-2 px-4 py-4 mb-6">
              <p className="text-[16px] font-medium text-wa-text">Duração padrão</p>
              <p className="text-[13px] text-wa-secondary mt-1 mb-3">Escolha por quantos dias as conversas devem ficar.</p>
              <select value={durationDays} onChange={(event) => setDurationDays(event.target.value)} className="w-full rounded-lg border border-wa-border bg-wa-bg text-wa-text px-3 py-3 outline-none">
                <option value="1">1 dia</option><option value="7">7 dias</option><option value="30">30 dias</option><option value="90">90 dias</option>
              </select>
              <p className="text-[11px] text-wa-muted mt-2">A preferência fica salva neste aparelho; apagar conversas automaticamente ainda precisa ser implementado.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
