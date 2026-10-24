"use client";

import { useState } from "react";
import { Search, MessageCircle, Users, Settings, Plus } from "lucide-react";

// Dados mockados para começar
const mockGroups = [
  {
    id: 1,
    name: "Diário Free Fire BR",
    description: "Comunidade principal de diários do Free Fire Brasil",
    members: 1240,
    lastMessage: "Alguém upou o rank hoje?",
    time: "14:32",
    unread: 3,
  },
  {
    id: 2,
    name: "Clãs e Organizações",
    description: "Encontre e entre em clãs",
    members: 890,
    lastMessage: "Procuro membros ativos",
    time: "13:15",
    unread: 0,
  },
  {
    id: 3,
    name: "Dicas e Estratégias",
    description: "Compartilhe dicas de gameplay",
    members: 2100,
    lastMessage: "Melhor loadout da temporada",
    time: "11:48",
    unread: 12,
  },
  {
    id: 4,
    name: "Diário Ranked Elite",
    description: "Só jogadores Elite e acima",
    members: 456,
    lastMessage: "Admin: somente admins podem enviar mensagens",
    time: "10:02",
    unread: 0,
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chats" | "comunidades">("comunidades");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  return (
    <div className="flex h-screen bg-whatsapp-darker">
      {/* Sidebar */}
      <div className="w-full md:w-[400px] flex flex-col border-r border-whatsapp-light">
        {/* Header */}
        <div className="bg-whatsapp-light px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Diários FF</h1>
          <div className="flex gap-4 text-gray-400">
            <button className="hover:text-white">
              <Plus size={22} />
            </button>
            <button className="hover:text-white">
              <Settings size={22} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-whatsapp-dark border-b border-whatsapp-light">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "chats"
                ? "text-whatsapp-green border-b-2 border-whatsapp-green"
                : "text-gray-400"
            }`}
          >
            <MessageCircle size={18} />
            Conversas
          </button>
          <button
            onClick={() => setActiveTab("comunidades")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "comunidades"
                ? "text-whatsapp-green border-b-2 border-whatsapp-green"
                : "text-gray-400"
            }`}
          >
            <Users size={18} />
            Comunidades FF
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-whatsapp-dark">
          <div className="flex items-center bg-whatsapp-light rounded-lg px-3 py-2 gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar grupos ou comunidades..."
              className="bg-transparent outline-none text-sm w-full text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Lista de grupos */}
        <div className="flex-1 overflow-y-auto">
          {mockGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-whatsapp-light transition ${
                selectedGroup === group.id ? "bg-whatsapp-light" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold text-lg">
                {group.name.charAt(0)}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-white truncate">{group.name}</h3>
                  <span className="text-xs text-gray-400">{group.time}</span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <p className="text-sm text-gray-400 truncate">{group.lastMessage}</p>
                  {group.unread > 0 && (
                    <span className="bg-whatsapp-green text-white text-xs rounded-full px-1.5 min-w-[20px] text-center">
                      {group.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área do chat (desktop) */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedGroup ? (
          <>
            {/* Header do chat */}
            <div className="bg-whatsapp-light px-4 py-3 flex items-center gap-3 border-b border-whatsapp-dark">
              <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold">
                {mockGroups.find((g) => g.id === selectedGroup)?.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-medium text-white">
                  {mockGroups.find((g) => g.id === selectedGroup)?.name}
                </h2>
                <p className="text-xs text-gray-400">
                  {mockGroups.find((g) => g.id === selectedGroup)?.members} membros
                </p>
              </div>
            </div>

            {/* Mensagens (mock) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]">
              <div className="flex justify-start">
                <div className="bg-whatsapp-incoming rounded-lg px-3 py-2 max-w-[70%]">
                  <p className="text-xs text-whatsapp-green font-medium mb-1">Admin</p>
                  <p className="text-sm">Bem-vindos ao grupo! Leiam as regras.</p>
                  <p className="text-[10px] text-gray-400 text-right mt-1">10:00</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-whatsapp-incoming rounded-lg px-3 py-2 max-w-[70%]">
                  <p className="text-xs text-whatsapp-green font-medium mb-1">Jogador123</p>
                  <p className="text-sm">Alguém quer duo ranked?</p>
                  <p className="text-[10px] text-gray-400 text-right mt-1">14:30</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-whatsapp-bubble rounded-lg px-3 py-2 max-w-[70%]">
                  <p className="text-sm">Eu topo! Manda o ID</p>
                  <p className="text-[10px] text-gray-300 text-right mt-1">14:32</p>
                </div>
              </div>
            </div>

            {/* Input de mensagem */}
            <div className="bg-whatsapp-light px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                placeholder="Digite uma mensagem"
                className="flex-1 bg-whatsapp-dark rounded-lg px-4 py-2 text-sm outline-none text-white placeholder-gray-400"
              />
              <button className="bg-whatsapp-green text-white p-2 rounded-full hover:bg-[#00c49a] transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Selecione um grupo para começar a conversar</p>
              <p className="text-sm mt-2">Ou explore as Comunidades FF</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
