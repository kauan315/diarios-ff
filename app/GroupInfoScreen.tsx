"use client";

import { useState } from "react";
import {
  ArrowLeft, MoreVertical, Search, Shield, Image as ImageIcon,
  Heart, Trash2, LogOut, Flag,
  ChevronRight,
} from "lucide-react";

type Group = {
  id: number;
  name: string;
  description: string;
  members: number;
  onlyAdminsCanSend: boolean;
  createdByMe?: boolean;
  photo?: string;
  isFavorite?: boolean;
};

type Props = {
  group: Group;
  nickname: string;
  onClose: () => void;
  onLeave: () => void;
  onClearConversation: () => void;
  onToggleOnlyAdmins: () => void;
  onToggleFavorite: () => void;
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
  onClearConversation,
  onToggleOnlyAdmins,
  onToggleFavorite,
}: Props) {
  const [tab, setTab] = useState<"membros" | "midias" | "config">("membros");
  const [descExpanded, setDescExpanded] = useState(false);
  const [mediaVisibilityOpen, setMediaVisibilityOpen] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState<"Sim" | "Não" | "Padrão">("Padrão");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportSent, setReportSent] = useState(false);

  return (
    <div className="absolute inset-0 bg-wa-bg z-20 flex flex-col">
      {reportOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-5">
          <div className="w-full max-w-sm rounded-2xl bg-wa-panel p-5 shadow-xl">
            {reportSent ? (
              <>
                <h3 className="text-lg font-medium text-wa-text mb-2">Denúncia registrada</h3>
                <p className="text-sm text-wa-secondary">Sua denúncia deste grupo foi registrada nesta demonstração.</p>
                <button onClick={() => setReportOpen(false)} className="mt-5 w-full rounded-lg bg-wa-green py-2.5 text-sm font-medium text-white">Concluir</button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-wa-text mb-2">Denunciar grupo</h3>
                <p className="text-sm text-wa-secondary mb-4">Por que você deseja denunciar “{group.name}”?</p>
                <div className="space-y-1">
                  {["Spam", "Golpe ou fraude", "Conteúdo impróprio", "Assédio ou ameaças", "Outro motivo"].map((reason) => (
                    <label key={reason} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-wa-hover cursor-pointer">
                      <input type="radio" name="report-reason" checked={reportReason === reason} onChange={() => setReportReason(reason)} className="accent-[#00a884]" />
                      <span className="text-sm text-wa-text">{reason}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setReportOpen(false)} className="flex-1 rounded-lg py-2.5 text-sm text-wa-secondary hover:bg-wa-hover">Cancelar</button>
                  <button onClick={() => setReportSent(true)} className="flex-1 rounded-lg bg-wa-danger py-2.5 text-sm font-medium text-white">Enviar denúncia</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {mediaVisibilityOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-5">
          <div className="w-full max-w-sm rounded-2xl bg-wa-panel p-5 shadow-xl">
            <h3 className="text-lg font-medium text-wa-text mb-3">Visibilidade de mídia</h3>
            <p className="text-sm text-wa-text mb-4">Você deseja que fotos e vídeos sejam salvos na galeria do seu dispositivo?</p>
            <div className="space-y-1">
              {(["Sim", "Não", "Padrão"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => { setMediaVisibility(option); setMediaVisibilityOpen(false); }}
                  className="w-full flex items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-wa-hover"
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${mediaVisibility === option ? "border-wa-green" : "border-wa-secondary"}`}>
                    {mediaVisibility === option && <span className="h-2.5 w-2.5 rounded-full bg-wa-green" />}
                  </span>
                  <span className="text-[15px] text-wa-text">{option}</span>
                  {option === "Padrão" && <span className="ml-auto text-xs text-wa-secondary">Padrão</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setMediaVisibilityOpen(false)} className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-wa-green">Cancelar</button>
          </div>
        </div>
      )}
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
            
            <button
              onClick={() => setMediaVisibilityOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left"
            >
              <ImageIcon size={22} className="text-wa-secondary" />
              <div>
                <p className="text-[15px] text-wa-text">Visibilidade de mídia</p>
                <p className="text-xs text-wa-secondary">Padrão</p>
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

            
            <button onClick={onToggleFavorite} className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left">
              <Heart size={22} className={group.isFavorite ? "text-wa-green fill-wa-green" : "text-wa-secondary"} />
              <p className="text-[15px] text-wa-text">{group.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
              {group.isFavorite && <span className="ml-auto text-xs text-wa-green">Favorito</span>}
            </button>
            
            
            <button onClick={onClearConversation} className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left text-wa-danger">
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
            <button onClick={() => { setReportOpen(true); setReportSent(false); }} className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover text-left text-wa-danger">
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
