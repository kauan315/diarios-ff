"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  MessageCircle,
  Users,
  Settings,
  Plus,
  ArrowLeft,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  Info,
  Shield,
  UserPlus,
  LogOut,
} from "lucide-react";

type Message = {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  isAdmin?: boolean;
};

type Group = {
  id: number;
  name: string;
  description: string;
  members: number;
  lastMessage: string;
  time: string;
  unread: number;
  onlyAdminsCanSend: boolean;
  isJoined: boolean;
};

const initialGroups: Group[] = [
  {
    id: 1,
    name: "Diário Free Fire BR",
    description: "Comunidade principal de diários do Free Fire Brasil. Respeitem as regras!",
    members: 1240,
    lastMessage: "Alguém upou o rank hoje?",
    time: "14:32",
    unread: 3,
    onlyAdminsCanSend: false,
    isJoined: true,
  },
  {
    id: 2,
    name: "Clãs e Organizações",
    description: "Encontre e entre em clãs. Divulgue sua organização aqui.",
    members: 890,
    lastMessage: "Procuro membros ativos",
    time: "13:15",
    unread: 0,
    onlyAdminsCanSend: false,
    isJoined: true,
  },
  {
    id: 3,
    name: "Dicas e Estratégias",
    description: "Compartilhe dicas de gameplay, loadouts e estratégias.",
    members: 2100,
    lastMessage: "Melhor loadout da temporada",
    time: "11:48",
    unread: 12,
    onlyAdminsCanSend: false,
    isJoined: false,
  },
  {
    id: 4,
    name: "Diário Ranked Elite",
    description: "Só jogadores Elite e acima. Ambiente sério.",
    members: 456,
    lastMessage: "Admin: somente admins podem enviar mensagens",
    time: "10:02",
    unread: 0,
    onlyAdminsCanSend: true,
    isJoined: true,
  },
];

const initialMessages: Record<number, Message[]> = {
  1: [
    { id: 1, sender: "Admin", text: "Bem-vindos ao grupo! Leiam as regras na descrição.", time: "10:00", isMe: false, isAdmin: true },
    { id: 2, sender: "Jogador123", text: "Alguém quer duo ranked?", time: "14:30", isMe: false },
    { id: 3, sender: "Você", text: "Eu topo! Manda o ID", time: "14:32", isMe: true },
  ],
  2: [
    { id: 1, sender: "LíderOrg", text: "Procuro membros ativos pro clã. Rank Heroico+", time: "13:10", isMe: false, isAdmin: true },
    { id: 2, sender: "FF_Master", text: "Ainda tem vaga?", time: "13:15", isMe: false },
  ],
  3: [
    { id: 1, sender: "ProPlayer", text: "Melhor loadout da temporada: MP40 + Desert", time: "11:40", isMe: false },
  ],
  4: [
    { id: 1, sender: "Admin Elite", text: "Atenção: somente administradores podem enviar mensagens neste grupo.", time: "09:00", isMe: false, isAdmin: true },
    { id: 2, sender: "Admin Elite", text: "Quem quiser entrar no ranked, chame no privado.", time: "10:02", isMe: false, isAdmin: true },
  ],
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chats" | "comunidades">("comunidades");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [messages, setMessages] = useState<Record<number, Message[]>>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;
  const currentMessages = selectedGroupId ? messages[selectedGroupId] || [] : [];

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "chats") {
      return g.isJoined && matchesSearch;
    }
    return matchesSearch;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedGroupId || !selectedGroup) return;

    if (selectedGroup.onlyAdminsCanSend) {
      alert("Somente administradores podem enviar mensagens neste grupo.");
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      sender: "Você",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedGroupId]: [...(prev[selectedGroupId] || []), newMessage],
    }));

    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroupId
          ? { ...g, lastMessage: inputText.trim(), time: newMessage.time, unread: 0 }
          : g
      )
    );

    setInputText("");
  };

  const handleJoinGroup = (groupId: number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isJoined: true, unread: 0 } : g))
    );
    setSelectedGroupId(groupId);
    setActiveTab("chats");
  };

  const handleLeaveGroup = (groupId: number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isJoined: false } : g))
    );
    setSelectedGroupId(null);
    setShowGroupInfo(false);
  };

  const toggleOnlyAdmins = () => {
    if (!selectedGroupId) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroupId
          ? { ...g, onlyAdminsCanSend: !g.onlyAdminsCanSend }
          : g
      )
    );
  };

  const showChat = selectedGroupId !== null;

  return (
    <div className="flex h-screen bg-whatsapp-darker overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showChat ? "hidden md:flex" : "flex"
        } w-full md:w-[400px] flex-col border-r border-whatsapp-light`}
      >
        <div className="bg-whatsapp-light px-4 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-semibold text-white">Diários FF</h1>
          <div className="flex gap-4 text-gray-400">
            <button className="hover:text-white transition" title="Novo grupo">
              <Plus size={22} />
            </button>
            <button className="hover:text-white transition" title="Configurações">
              <Settings size={22} />
            </button>
          </div>
        </div>

        <div className="flex bg-whatsapp-dark border-b border-whatsapp-light shrink-0">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === "chats"
                ? "text-whatsapp-green border-b-2 border-whatsapp-green"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <MessageCircle size={18} />
            Conversas
          </button>
          <button
            onClick={() => setActiveTab("comunidades")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === "comunidades"
                ? "text-whatsapp-green border-b-2 border-whatsapp-green"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Users size={18} />
            Comunidades FF
          </button>
        </div>

        <div className="p-3 bg-whatsapp-dark shrink-0">
          <div className="flex items-center bg-whatsapp-light rounded-lg px-3 py-2 gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "chats"
                  ? "Pesquisar conversas..."
                  : "Pesquisar grupos ou comunidades..."
              }
              className="bg-transparent outline-none text-sm w-full text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {activeTab === "chats"
                  ? "Você ainda não entrou em nenhum grupo."
                  : "Nenhum grupo encontrado."}
              </p>
              {activeTab === "chats" && (
                <button
                  onClick={() => setActiveTab("comunidades")}
                  className="mt-3 text-whatsapp-green text-sm hover:underline"
                >
                  Explorar Comunidades FF
                </button>
              )}
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-whatsapp-light transition cursor-pointer ${
                  selectedGroupId === group.id ? "bg-whatsapp-light" : ""
                }`}
                onClick={() => {
                  if (group.isJoined) {
                    setSelectedGroupId(group.id);
                    setShowGroupInfo(false);
                  }
                }}
              >
                <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {group.name.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white truncate">{group.name}</h3>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{group.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-sm text-gray-400 truncate">{group.lastMessage}</p>
                    {group.unread > 0 && group.isJoined && (
                      <span className="bg-whatsapp-green text-white text-xs rounded-full px-1.5 min-w-[20px] text-center shrink-0 ml-2">
                        {group.unread}
                      </span>
                    )}
                  </div>
                  {!group.isJoined && activeTab === "comunidades" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id);
                      }}
                      className="mt-2 text-xs bg-whatsapp-green text-white px-3 py-1 rounded-full hover:bg-[#00c49a] transition"
                    >
                      Entrar no grupo
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área do chat */}
      <div
        className={`${
          showChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col relative`}
      >
        {selectedGroup ? (
          <>
            <div className="bg-whatsapp-light px-3 md:px-4 py-3 flex items-center gap-3 border-b border-whatsapp-dark shrink-0">
              <button
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setSelectedGroupId(null)}
              >
                <ArrowLeft size={24} />
              </button>
              <div
                className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold cursor-pointer"
                onClick={() => setShowGroupInfo(true)}
              >
                {selectedGroup.name.charAt(0)}
              </div>
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => setShowGroupInfo(true)}
              >
                <h2 className="font-medium text-white truncate">{selectedGroup.name}</h2>
                <p className="text-xs text-gray-400">
                  {selectedGroup.members.toLocaleString("pt-BR")} membros
                  {selectedGroup.onlyAdminsCanSend && " • Somente admins"}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowGroupInfo(true)}
              >
                <MoreVertical size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 bg-[#0b141a]">
              {selectedGroup.onlyAdminsCanSend && (
                <div className="text-center py-2">
                  <span className="bg-whatsapp-light text-gray-300 text-xs px-3 py-1 rounded-full">
                    🔒 Somente administradores podem enviar mensagens
                  </span>
                </div>
              )}

              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg px-3 py-1.5 max-w-[80%] md:max-w-[65%] ${
                      msg.isMe ? "bg-whatsapp-bubble" : "bg-whatsapp-incoming"
                    }`}
                  >
                    {!msg.isMe && (
                      <p className="text-xs text-whatsapp-green font-medium mb-0.5">
                        {msg.sender}
                        {msg.isAdmin && " • Admin"}
                      </p>
                    )}
                    <p className="text-sm text-white whitespace-pre-wrap break-words">{msg.text}</p>
                    <p
                      className={`text-[10px] text-right mt-0.5 ${
                        msg.isMe ? "text-gray-300" : "text-gray-400"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-whatsapp-light px-3 md:px-4 py-2.5 flex items-center gap-2 shrink-0">
              <button className="text-gray-400 hover:text-white p-1">
                <Smile size={24} />
              </button>
              <button className="text-gray-400 hover:text-white p-1">
                <Paperclip size={22} />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  selectedGroup.onlyAdminsCanSend
                    ? "Somente admins podem enviar..."
                    : "Digite uma mensagem"
                }
                disabled={selectedGroup.onlyAdminsCanSend}
                className="flex-1 bg-whatsapp-dark rounded-lg px-4 py-2.5 text-sm outline-none text-white placeholder-gray-400 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || selectedGroup.onlyAdminsCanSend}
                className="bg-whatsapp-green text-white p-2.5 rounded-full hover:bg-[#00c49a] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>

            {showGroupInfo && (
              <div className="absolute inset-0 bg-whatsapp-darker z-20 flex flex-col">
                <div className="bg-whatsapp-light px-4 py-3 flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setShowGroupInfo(false)}
                    className="text-gray-300 hover:text-white"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <h2 className="text-lg font-medium text-white">Dados do grupo</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col items-center py-8 bg-whatsapp-dark">
                    <div className="w-28 h-28 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold text-4xl mb-4">
                      {selectedGroup.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-medium text-white">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Grupo • {selectedGroup.members.toLocaleString("pt-BR")} participantes
                    </p>
                  </div>

                  <div className="px-4 py-4 bg-whatsapp-dark mt-2">
                    <p className="text-xs text-whatsapp-green mb-1">Descrição</p>
                    <p className="text-sm text-gray-200">{selectedGroup.description}</p>
                  </div>

                  <div className="mt-2 bg-whatsapp-dark">
                    <button
                      onClick={toggleOnlyAdmins}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-whatsapp-light transition"
                    >
                      <Shield size={22} className="text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="text-sm text-white">Somente admins podem enviar mensagens</p>
                        <p className="text-xs text-gray-400">
                          {selectedGroup.onlyAdminsCanSend ? "Ativado" : "Desativado"}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-6 rounded-full transition relative ${
                          selectedGroup.onlyAdminsCanSend ? "bg-whatsapp-green" : "bg-gray-600"
                        }`}
                      >
                        <div
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
                          style={{
                            left: selectedGroup.onlyAdminsCanSend ? "18px" : "2px",
                          }}
                        />
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-whatsapp-light transition">
                      <UserPlus size={22} className="text-gray-400" />
                      <span className="text-sm text-white">Adicionar participantes</span>
                    </button>

                    <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-whatsapp-light transition">
                      <Info size={22} className="text-gray-400" />
                      <span className="text-sm text-white">Ver participantes</span>
                    </button>
                  </div>

                  <div className="mt-2 bg-whatsapp-dark">
                    <button
                      onClick={() => handleLeaveGroup(selectedGroup.id)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-whatsapp-light transition text-red-400"
                    >
                      <LogOut size={22} />
                      <span className="text-sm">Sair do grupo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center px-6">
              <MessageCircle size={72} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-light text-gray-400">Diários FF</p>
              <p className="text-sm mt-2 text-gray-500 max-w-sm">
                Selecione um grupo para começar a conversar ou explore as Comunidades FF
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
