"use client";

import {
  ArrowLeft, Pencil, ChevronDown, Diamond,
  KeyRound, Lock, MessageSquare, Bot, Palette, LogOut, X, EyeOff,
  Check, Crown, Sparkles, ShieldCheck, TrendingUp, Users, Zap, Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type Props = {
  nickname: string;
  publicUserId?: string;
  onClose: () => void;
  onLogout: () => void;
  profilePhoto: string;
  hideProfilePhoto: boolean;
  onProfilePhotoChange: (photo: string) => void;
  onNicknameChange: (nickname: string) => void;
  onToggleHideProfilePhoto: () => void;
  contactNames?: string[];
};

export default function ProfileScreen({ nickname, publicUserId = "", onClose, onLogout, profilePhoto, hideProfilePhoto, onProfilePhotoChange, onNicknameChange, onToggleHideProfilePhoto, contactNames = [] }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [themePreset, setThemePreset] = useState("sky-blue");
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [themeColor, setThemeColor] = useState("blue");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [showAccount, setShowAccount] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [lastSeen, setLastSeen] = useState<"todos" | "ninguem">("todos");
  const [hiddenPhotoContacts, setHiddenPhotoContacts] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState("7");
  const [accountEmail, setAccountEmail] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

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
      // Migrate the old default green theme to the new sky-blue-and-white default.
      if (savedPreset === "classic-green" || (!savedPreset && savedColor === "green")) {
        setThemePreset("sky-blue");
        setThemeColor("blue");
      } else {
        if (savedPreset && ["classic-green", "pink-candy", "sky-blue", "ruby-red", "neon-cyber", "galaxy-purple", "royal-gold", "toxic-acid", "sunset-fire", "midnight"].includes(savedPreset)) setThemePreset(savedPreset);
        if (savedColor && ["green", "pink", "blue", "red"].includes(savedColor)) setThemeColor(savedColor);
      }
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
    { icon: Bot, title: "Bots", desc: "Configurações de bots" },
    { icon: Palette, title: "Temas", desc: "Bolhas, fundos e estilos de conversa" },
  ];

  return (
    <div className="fixed inset-0 bg-wa-bg z-50 flex flex-col">
      <div className="bg-wa-panel px-3 py-2.5 flex items-center justify-between shrink-0 border-b border-wa-border">
        <button onClick={onClose} className="text-wa-secondary p-1">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-4 text-wa-secondary">
          <button onClick={() => { setDraftNickname(nickname); setShowEditProfile(true); }} className="p-1" aria-label="Editar perfil"><Pencil size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-wa-panel pb-6 pt-2">
          <div className="relative flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-wa-green overflow-hidden flex items-center justify-center text-white font-semibold text-4xl mt-4 mb-3 shadow-md">
              {profilePhoto ? <img src={profilePhoto} alt="Foto de perfil" className="w-full h-full object-cover" /> : nickname.charAt(0).toUpperCase()}
            </div>
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
            <button className="flex items-center gap-1 text-wa-text text-xl font-medium">
              {nickname}
              <ChevronDown size={18} className="text-wa-secondary" />
            </button>
            {publicUserId && <button onClick={() => { navigator.clipboard?.writeText(publicUserId).then(() => alert("ID copiado!")).catch(() => alert("Seu ID: " + publicUserId)); }} className="mt-1 text-xs text-wa-secondary">Meu ID: {publicUserId} · tocar para copiar</button>}
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
      {showEditProfile && (
        <div className="fixed inset-0 z-[85] bg-wa-bg flex flex-col">
          <div className="bg-wa-panel px-3 py-3 flex items-center gap-3 border-b border-wa-border shrink-0">
            <button onClick={() => setShowEditProfile(false)} className="text-wa-secondary p-1" aria-label="Voltar ao perfil">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-wa-text">Editar perfil</h2>
              <p className="text-xs text-wa-secondary">Altere sua foto e seu nome</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex flex-col items-center py-5">
              <div className="w-28 h-28 rounded-full bg-wa-green overflow-hidden flex items-center justify-center text-white font-semibold text-4xl">
                {profilePhoto ? <img src={profilePhoto} alt="Foto de perfil" className="w-full h-full object-cover" /> : nickname.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => photoInputRef.current?.click()} className="mt-3 rounded-full px-4 py-2 text-sm font-medium text-wa-green border border-wa-green/40">
                Alterar foto
              </button>
            </div>
            <label className="block text-sm text-wa-secondary mb-2" htmlFor="edit-profile-nickname">Nome do perfil</label>
            <input id="edit-profile-nickname" value={draftNickname} onChange={(event) => setDraftNickname(event.target.value)} maxLength={30} placeholder="Digite seu nome" className="w-full rounded-xl border border-wa-border bg-wa-panel text-wa-text px-4 py-3 outline-none focus:border-wa-green" />
            <p className="text-xs text-wa-secondary mt-2">Máximo de 30 caracteres.</p>
            <button onClick={() => {
              const cleaned = draftNickname.trim();
              if (!cleaned) { alert("Digite um nome para o perfil."); return; }
              onNicknameChange(cleaned);
              setShowEditProfile(false);
            }} className="w-full mt-6 rounded-xl bg-wa-green text-white font-semibold py-3.5">
              Salvar alterações
            </button>
          </div>
        </div>
      )}
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
                <p className="text-[13px] text-wa-secondary mt-0.5 break-all">{accountEmail || (isSupabaseConfigured ? "Carregando e-mail da conta..." : "Conta de demonstração — nenhum e-mail vinculado")}</p>
              </div>
            </div>
            <div className="mx-4 border-b border-wa-border" />
            <button onClick={async () => {
              setPasswordNotice("");
              if (!isSupabaseConfigured || !supabase || !accountEmail) { setPasswordNotice("A redefinição de senha exige uma conta com e-mail vinculada."); return; }
              setResetBusy(true);
              const { error } = await supabase.auth.resetPasswordForEmail(accountEmail, { redirectTo: window.location.origin });
              setResetBusy(false);
              setPasswordNotice(error ? "Não foi possível enviar o e-mail. Tente novamente." : "Enviamos um link para redefinir sua senha. Confira também a pasta de spam.");
            }} disabled={resetBusy} className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-wa-hover disabled:opacity-60">
              <Lock size={22} className="text-wa-secondary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[16px] text-wa-text">Senha</p>
                <p className="text-[13px] text-wa-secondary mt-0.5">{resetBusy ? "Enviando link..." : "A senha não pode ser exibida por segurança. Toque para receber um link de redefinição."}</p>
                {passwordNotice && <p role="status" className="text-[13px] text-wa-green-dark mt-2">{passwordNotice}</p>}
              </div>
            </button>
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
      {showThemes && (
        <div className="fixed inset-0 z-[80] bg-wa-bg flex flex-col">
          <div className="bg-wa-panel px-3 py-3 flex items-center gap-3 border-b border-wa-border shrink-0">
            <button onClick={() => setShowThemes(false)} className="text-wa-secondary p-1" aria-label="Voltar às configurações">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-wa-text">Temas</h2>
              <p className="text-xs text-wa-secondary">Personalize suas conversas</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <h3 className="font-semibold text-wa-text mb-2">Modo de aparência</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setThemeMode("light")}
                className={`rounded-xl border px-3 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition ${themeMode === "light" ? "border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500/20" : "border-wa-border bg-wa-panel text-wa-secondary"}`}
              >
                <span className="w-4 h-4 rounded-full border border-slate-300 bg-white" /> Claro
              </button>
              <button
                onClick={() => setThemeMode("dark")}
                className={`rounded-xl border px-3 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition ${themeMode === "dark" ? "border-sky-500 bg-slate-800 text-white ring-2 ring-sky-500/20" : "border-wa-border bg-wa-panel text-wa-secondary"}`}
              >
                <span className="w-4 h-4 rounded-full border border-slate-500 bg-slate-900" /> Escuro
              </button>
            </div>
            <h3 className="font-semibold text-wa-text mb-1">Temas grátis</h3>
            <p className="text-xs text-wa-secondary mb-3">Mude a cor das bolhas sem alterar o visual normal do chat.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "classic-green", name: "Clássico Verde", color: "#d9fdd3", accent: "green" },
                { id: "pink-candy", name: "Rosa Candy", color: "#f8c7dd", accent: "pink" },
                { id: "sky-blue", name: "Azul Céu", color: "#c9e3ff", accent: "blue" },
                { id: "ruby-red", name: "Ruby", color: "#ffd0d2", accent: "red" },
              ].map((theme) => (
                <button key={theme.id} onClick={() => { setThemePreset(theme.id); setThemeColor(theme.accent); }} className={`rounded-2xl border p-3 text-left transition ${themePreset === theme.id ? "border-wa-green ring-2 ring-wa-green/30" : "border-wa-border"} bg-wa-panel`}>
                  <div className={`rounded-xl p-2.5 space-y-2 mb-2 ${themeMode === "dark" ? "bg-[#101820]" : "bg-[#f3f9ff] border border-slate-200"}`}>
                    <div className={`h-5 w-3/4 rounded-xl ${themeMode === "dark" ? "bg-[#263746]" : "bg-white border border-slate-200"}`} />
                    <div className="ml-auto h-6 w-4/5 rounded-xl" style={{ backgroundColor: themeMode === "dark" ? (theme.accent === "blue" ? "#174a78" : theme.accent === "pink" ? "#6b2947" : theme.accent === "red" ? "#70272c" : "#24513c") : theme.color }} />
                    <div className={`h-5 w-1/2 rounded-xl ${themeMode === "dark" ? "bg-[#263746]" : "bg-white border border-slate-200"}`} />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium text-wa-text">{theme.name}</span>
                    {themePreset === theme.id && <Check size={16} className="text-wa-green" />}
                  </div>
                  <span className="text-[11px] text-wa-secondary">Grátis</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-7 mb-1">
              <h3 className="font-semibold text-wa-text">Temas Premium</h3>
              <span className="text-[10px] font-bold text-amber-500 border border-amber-500/40 rounded-full px-2 py-1">PREMIUM</span>
            </div>
            <p className="text-xs text-wa-secondary mb-3">Estilos especiais com fundos, formatos de bolhas e animações.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "neon-cyber", name: "Neon Cyber", color: "#00e5ff", bg: "linear-gradient(135deg,#071b35,#123e57)" },
                { id: "galaxy-purple", name: "Galaxy Roxo", color: "#c084fc", bg: "linear-gradient(135deg,#160b2b,#49217b)" },
                { id: "royal-gold", name: "Ouro Real", color: "#f5c451", bg: "linear-gradient(135deg,#20190b,#5b4314)" },
                { id: "toxic-acid", name: "Toxic Acid", color: "#b7ff00", bg: "linear-gradient(135deg,#10200b,#294719)" },
                { id: "sunset-fire", name: "Sunset Fire", color: "#ff7849", bg: "linear-gradient(135deg,#351018,#822e25)" },
                { id: "midnight", name: "Midnight", color: "#8ab4f8", bg: "linear-gradient(135deg,#101827,#283b55)" },
              ].map((theme) => (
                <button key={theme.id} onClick={() => alert("Este tema é exclusivo do Premium. A integração de pagamento ainda precisa ser feita para desbloqueá-lo.")} className="rounded-2xl border border-wa-border bg-wa-panel p-3 text-left">
                  <div className="rounded-xl p-2.5 space-y-2 mb-2" style={{ background: theme.bg }}>
                    <div className="h-5 w-3/4 rounded-lg bg-white/20 border border-white/10" />
                    <div className="ml-auto h-6 w-4/5 rounded-[10px] border" style={{ background: theme.color, borderColor: theme.color, boxShadow: `0 0 10px ${theme.color}55` }} />
                    <div className="h-5 w-1/2 rounded-lg bg-white/20 border border-white/10" />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium text-wa-text">{theme.name}</span>
                    <Lock size={14} className="text-amber-500 shrink-0" />
                  </div>
                  <span className="text-[11px] text-amber-500">Exclusivo Premium</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setShowThemes(false); setShowSubscriptions(true); }} className="w-full mt-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3.5">
              <Crown size={17} className="inline mr-2" />Conhecer o Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
