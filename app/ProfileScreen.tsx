"use client";

import {
  ArrowLeft, Search, QrCode, Pencil, ChevronDown, Diamond,
  KeyRound, Lock, MessageSquare, Paintbrush, Bot, Palette, LogOut, X, EyeOff,
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
  const [showPrivacy, setShowPrivacy] = useState(false);
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
                if (item.title === "Privacidade") { setShowPrivacy(true); return; }
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
