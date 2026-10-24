"use client";

import { useState } from "react";
import {
  ArrowLeft, MoreVertical, Search, Shield, Bell, Image as ImageIcon,
  Lock, MessageSquareLock, Heart, Contact, Upload, Trash2, LogOut, Flag,
  Eye, ChevronRight,
} from "lucide-react";

type Group = {
  id: number;
  name: string;
  description: string;
  members: number;
  onlyAdminsCanSend: boolean;
  createdByMe?: boolean;
  photo?: string;
};

type Props = {
  group: Group;
  nickname: string;
  onClose: () => void;
  onLeave: () => void;
  onToggleOnlyAdmins: () => void;
};

const FAKE_MEMBERS = [
  { name: "~ Adm", phone: "+55 75 8243-8509", isAdmin: true },
  { name: "~ adm amora", phone: "+55 75 8865-6784", isAdmin: true },
  { name: "~ Adm July", phone: "+55 75 8864-1215", isAdmin: true },
  { name: "~ Adm Kauany", phone: "+55 16 98123-3384", isAdmin: true },
  { name: "kauan lima", phone: "+55 75 8255-9544", isAdmin: true },
  { name: "Jogador123", phone: "", isAdmin: false },
  { name: "FF_Master", phone: "", isAdmin: false },
  { name: "ProPlayer", phone: "", isAdmin: false },
];

export default function GroupInfoScreen({
  group,
  nickname,
  onClose,
  onLeave,
  onToggleOnlyAdmins,
}: Props) {
  const [tab, setTab] = useState<"membros" | "midias" | "config">("membros");
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <div className="absolute inset-0 bg-wa-bg z-20 flex flex-col">
      <div className="bg-wa-panel px-3 py-2.5 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="text-wa-secondary p-1">
          <ArrowLeft size={24} />
        </button>
        <button className="text-wa-secondary p-1">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-wa-panel flex flex-col items-center pt-2 pb-5 px-4">
          <div className="w-28 h-28 rounded-full bg-wa-green flex items-center justify-center text-white font-bold text-5xl shadow-md mb-4 overflow-hidden">
            {group.photo ? <img src={group.photo} alt={`Foto de ${group.name}`} className="w-full h-full object-cover" /> : group.name.charAt(0)}
          </div>
          <h2 className="text-[22px] font-medium text-wa-text text-center leading-tight">
            {group.name}
          </h2>
          <p className="text-sm text-wa-secondary mt-1">
            Grupo · {group.members.toLocaleString("pt-BR")} membros
          </p>

          <div className="mt-4 text-center max-w-sm">
            <p className={`text-[14px] text-wa-text ${descExpanded ? "" : "line-clamp-2"}`}>
              {group.description}
            </p>
            {group.description.length > 60 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-wa-green text-sm mt-1"
              >
                {descExpanded ? "Ver menos" : "👆 ... Ler mais"}
              </button>
            )}
          </div>

        </div>

        <div className="bg-wa-panel mt-2 flex border-b border-wa-border sticky top-0 z-10">
          {(
            [
              { id: "membros" as const, label: "Membros" },
              { id: "midias" as const, label: "Mídias" },
              { id: "config" as const, label: "Configurações" },
            ]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-medium relative ${
                tab === t.id ? "text-wa-green" : "text-wa-secondary"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-wa-green rounded-full" />
              )}
            </button>
          ))}
        </div>

        {tab === "membros" && (
          <div className="bg-wa-panel">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-wa-secondary">
                {group.members.toLocaleString("pt-BR")} membros
              </span>
              <Search size={18} className="text-wa-secondary" />
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold">
                {nickname.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] text-wa-text">Você</p>
                <p className="text-sm text-wa-green">Adicionar etiqueta de membro</p>
              </div>
            </div>

            {FAKE_MEMBERS.map((m) => (
              <div key={m.name} className="flex items-center gap-3 px-4 py-3">
                <div className="w-12 h-12 rounded-full bg-wa-input flex items-center justify-center text-wa-secondary font-semibold text-lg">
                  {m.name.replace("~ ", "").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] text-wa-text truncate">{m.name}</p>
                  {m.phone && (
                    <p className="text-sm text-wa-secondary">{m.phone}</p>
                  )}
                </div>
                {m.isAdmin && (
                  <span className="text-[11px] text-wa-green bg-wa-green/10 px-2 py-0.5 rounded-md shrink-0">
                    Admin do grupo
                  </span>
                )}
              </div>
            ))}

            <button className="w-full text-left px-4 py-3 text-wa-green text-[15px]">
              Ver todos (mais {Math.max(0, group.members - 9)})
            </button>
            <button className="w-full text-left px-4 py-3 text-wa-green text-[15px] pb-5">
              Mostrar mudanças de membros
            </button>
          </div>
        )}

        {tab === "midias" && (
          <div className="bg-wa-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-wa-secondary">Mídia, links e docs</span>
              <span className="text-sm text-wa-secondary flex items-center gap-1">
                0 <ChevronRight size={16} />
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-24 h-24 rounded-lg bg-wa-input shrink-0 flex items-center justify-center text-wa-muted"
                >
                  <ImageIcon size={28} />
                </div>
              ))}
            </div>
            <button className="w-full flex items-center gap-4 py-4 mt-2">
              <ImageIcon size={22} className="text-wa-secondary" />
              <div className="text-left">
                <p className="text-[15px] text-wa-text">Gerenciar armazenamento</p>
                <p className="text-xs text-wa-secondary">0 kB</p>
              </div>
            </button>
          </div>
        )}

        {tab === "config" && (
          <div className="bg-wa-panel">
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <Bell size={22} className="text-wa-secondary" />
              <div>
                <p className="text-[15px] text-wa-text">Notificações</p>
                <p className="text-xs text-wa-secondary">Destaques</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <ImageIcon size={22} className="text-wa-secondary" />
              <p className="text-[15px] text-wa-text">Visibilidade de mídia</p>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <Lock size={22} className="text-wa-secondary" />
              <div>
                <p className="text-[15px] text-wa-text">Criptografia</p>
                <p className="text-xs text-wa-secondary">
                  As mensagens são protegidas com criptografia de ponta a ponta.
                </p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <MessageSquareLock size={22} className="text-wa-secondary" />
              <div className="flex-1">
                <p className="text-[15px] text-wa-text">Conversas trancadas</p>
                <p className="text-xs text-wa-secondary">
                  Tranca e oculta a conversa neste dispositivo.
                </p>
              </div>
              <div className="w-10 h-6 rounded-full bg-wa-input relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow" />
              </div>
            </button>

            <button
              onClick={onToggleOnlyAdmins}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left"
            >
              <Shield size={22} className="text-wa-secondary" />
              <div className="flex-1">
                <p className="text-[15px] text-wa-text">Somente admins podem enviar</p>
                <p className="text-xs text-wa-secondary">
                  {group.onlyAdminsCanSend ? "Ativado" : "Desativado"}
                </p>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative ${
                  group.onlyAdminsCanSend ? "bg-wa-green" : "bg-wa-input"
                }`}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow"
                  style={{ left: group.onlyAdminsCanSend ? "18px" : "2px" }}
                />
              </div>
            </button>

            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <Eye size={22} className="text-wa-secondary" />
              <div>
                <p className="text-[15px] text-wa-text">Privacidade avançada da conversa</p>
                <p className="text-xs text-wa-secondary">Desativado</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <Heart size={22} className="text-wa-secondary" />
              <p className="text-[15px] text-wa-text">Adicionar aos favoritos</p>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <Contact size={22} className="text-wa-secondary" />
              <p className="text-[15px] text-wa-text">Adicionar à lista</p>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <Upload size={22} className="text-wa-secondary" />
              <p className="text-[15px] text-wa-text">Exportar conversa</p>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left text-wa-danger">
              <Trash2 size={22} />
              <p className="text-[15px]">Limpar conversa</p>
            </button>
            <button
              onClick={onLeave}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left text-wa-danger"
            >
              <LogOut size={22} />
              <p className="text-[15px]">Sair do grupo</p>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left text-wa-danger">
              <Flag size={22} />
              <p className="text-[15px]">Denunciar grupo</p>
            </button>
            <p className="px-4 py-4 text-xs text-wa-muted">Criado em 10/08/2026</p>
          </div>
        )}
      </div>
    </div>
  );
}
