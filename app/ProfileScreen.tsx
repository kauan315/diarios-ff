"use client";

import {
  ArrowLeft, Search, QrCode, Pencil, ChevronDown, Diamond,
  KeyRound, Lock, MessageSquare, Paintbrush, Bot, Palette, LogOut,
} from "lucide-react";

type Props = {
  nickname: string;
  onClose: () => void;
  onLogout: () => void;
};

export default function ProfileScreen({ nickname, onClose, onLogout }: Props) {
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
            <div className="w-28 h-28 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-4xl mt-6 mb-3 shadow-md">
              {nickname.charAt(0).toUpperCase()}
            </div>
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
    </div>
  );
}
