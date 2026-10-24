"use client";

import {
  ArrowLeft, Search, QrCode, Pencil, ChevronDown, Diamond,
  KeyRound, Lock, MessageSquare, Paintbrush, Bot, Palette, LogOut, X, EyeOff,
  Check, Crown, Sparkles, ShieldCheck, TrendingUp, Users, Zap, Star,
} from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  nickname: string;
  onClose: () => void;
  onLogout: () => void;
  profilePhoto: string;
  hideProfilePhoto: boolean;
  onProfilePhotoChange: (photo: string) => void;
  onToggleHideProfilePhoto: () => void;
};

export default function ProfileScreen({ nickname, onClose, onLogout, profilePhoto, hideProfilePhoto, onProfilePhotoChange, onToggleHideProfilePhoto }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);\n  const [showSubscriptions, setShowSubscriptions] = useState(false);\n  const [selectedPlan, setSelectedPlan] = useState<"mensal" | "anual">("anual");
  const items = [
    { icon: Diamond, title: "Assinaturas", desc: "Conheça os benefícios premium" },
    { icon: KeyRound, title: "Conta", desc: "Notificações de segurança, mudança de nickname" },
    { icon: Lock, title: "Privacidade", desc: "Contas bloqueadas, mensagens temporárias" },
    { icon: MessageSquare, title: "Conversas", desc: "Histórico de conversas, backup" },
    { icon: Paintbrush, title: "Aparência", desc: "Tema da conversa, ícone do app, tema do app" },
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
                if (item.title === "Assinaturas") { setShowSubscriptions(true); return; }\n                if (item.title === "Privacidade") { setShowPrivacy(true); return; }
                if (item.title === "Bots" || item.title === "Temas") {
                  alert(`${item.title} — em breve você me fala como funciona`);
                }
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
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setShowPrivacy(false)}>
          <div className="w-full max-w-md bg-wa-panel rounded-t-2xl sm:rounded-2xl p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-wa-text">Privacidade</h2>
              <button onClick={() => setShowPrivacy(false)} className="p-1 text-wa-secondary" aria-label="Fechar"><X size={20} /></button>
            </div>
            <div className="flex items-start gap-3 py-3">
              <EyeOff size={22} className="text-wa-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[15px] text-wa-text">Ocultar minha foto de perfil</p>
                <p className="text-[13px] text-wa-secondary mt-1">Quando ativada, sua foto não deve aparecer para outras pessoas.</p>
              </div>
              <button onClick={onToggleHideProfilePhoto} role="switch" aria-checked={hideProfilePhoto} className={`w-11 h-6 rounded-full p-0.5 transition ${hideProfilePhoto ? "bg-wa-green" : "bg-wa-muted"}`}>
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${hideProfilePhoto ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <button onClick={() => setShowPrivacy(false)} className="mt-3 w-full rounded-lg bg-wa-green text-white py-2.5 font-medium">Concluir</button>
          </div>
        </div>
      )}
    </div>
  );
}
