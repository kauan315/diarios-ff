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
  X,
  Compass,
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
  createdByMe?: boolean;
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
  {
    id: 5,
    name: "Free Fire Latinoamérica",
    description: "Comunidad de Free Fire para jugadores de Latinoamérica",
    members: 3200,
    lastMessage: "¿Alguien para ranked?",
    time: "09:45",
    unread: 0,
    onlyAdminsCanSend: false,
    isJoined: false,
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
  5: [
    { id: 1, sender: "Admin", text: "Bienvenidos a la comunidad!", time: "09:00", isMe: false, isAdmin: true },
  ],
};

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tempNickname, setTempNickname] = useState("");

  // "conversas" ou "comunidades" — telas totalmente separadas
  const [screen, setScreen] = useState<"conversas" | "comunidades">("conversas");

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [messages, setMessages] = useState<Record<number, Message[]>>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;
  const currentMessages = selectedGroupId ? messages[selectedGroupId] || [] : [];

  // Grupos que o usuário já entrou (aparecem em Conversas)
  const myChats = groups.filter(
    (g) =>
      g.isJoined &&
      (g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Todos os grupos (aparecem em Comunidades)
  const allCommunities = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleLogin = () => {
    if (tempNickname.trim().length < 2) return;
    setNickname(tempNickname.trim());
    setIsLoggedIn(true);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedGroupId || !selectedGroup) return;

    if (selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe) {
      alert("Somente administradores podem enviar mensagens neste grupo.");
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      sender: nickname,
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
    setScreen("conversas"); // Volta para a tela de conversas
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

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    const newId = Date.now();
    const newGroup: Group = {
      id: newId,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || "Diário criado no Diários FF",
      members: 1,
      lastMessage: "Diário criado",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      unread: 0,
      onlyAdminsCanSend: false,
      isJoined: true,
      createdByMe: true,
    };

    setGroups((prev) => [newGroup, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newId]: [
        {
          id: 1,
          sender: nickname,
          text: `Diário "${newGroup.name}" criado por ${nickname}`,
          time: newGroup.time,
          isMe: true,
          isAdmin: true,
        },
      ],
    }));

    setNewGroupName("");
    setNewGroupDesc("");
    setShowCreateGroup(false);
    setSelectedGroupId(newId);
    setScreen("conversas");
  };

  const showChat = selectedGroupId !== null && screen === "conversas";

  // ========== TELA DE LOGIN ==========
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-whatsapp-darker flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-whatsapp-green rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Diários FF</h1>
            <p className="text-gray-400 mt-2 text-sm">
              Chat e comunidades de Free Fire
            </p>
          </div>

          <div className="bg-whatsapp-dark rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Seu nickname</label>
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Ex: ProPlayerBR"
                maxLength={20}
                className="w-full bg-whatsapp-light rounded-lg px-4 py-3 text-white outline-none placeholder-gray-500 focus:ring-2 focus:ring-whatsapp-green"
                autoFocus
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={tempNickname.trim().length < 2}
              className="w-full bg-whatsapp-green text-white font-medium py-3 rounded-lg hover:bg-[#00c49a] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Entrar
            </button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            Ao entrar você concorda em respeitar as comunidades
          </p>
        </div>
      </div>
    );
  }

  // ========== TELA DE COMUNIDADES FF (totalmente separada) ==========
  if (screen === "comunidades") {
    return (
      <div className="min-h-screen bg-whatsapp-darker flex flex-col">
        {/* Header */}
        <div className="bg-whatsapp-light px-4 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-white">Comunidades FF</h1>
            <p className="text-xs text-gray-400">Descubra e entre em diários</p>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-whatsapp-green text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-[#00c49a] transition"
          >
            <Plus size={16} />
            Cadastrar diário
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-whatsapp-dark shrink-0">
          <div className="flex items-center bg-whatsapp-light rounded-lg px-3 py-2.5 gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar diários e comunidades..."
              className="bg-transparent outline-none text-sm w-full text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Lista de comunidades em cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
          {allCommunities.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Compass size={48} className="mx-auto mb-3 opacity-40" />
              <p>Nenhum diário encontrado</p>
            </div>
          ) : (
            allCommunities.map((group) => (
              <div
                key={group.id}
                className="bg-whatsapp-dark rounded-xl p-4 border border-whatsapp-light/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base">{group.name}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{group.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {group.members.toLocaleString("pt-BR")} membros
                      {group.onlyAdminsCanSend && " • Somente admins"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {group.isJoined ? (
                    <button
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setScreen("conversas");
                      }}
                      className="flex-1 bg-whatsapp-light text-white py-2 rounded-lg text-sm font-medium hover:bg-[#2a3942] transition"
                    >
                      Abrir conversa
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="flex-1 bg-whatsapp-green text-white py-2 rounded-lg text-sm font-medium hover:bg-[#00c49a] transition"
                    >
                      Entrar no diário
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-whatsapp-light border-t border-whatsapp-dark flex shrink-0">
          <button
            onClick={() => {
              setScreen("conversas");
              setSelectedGroupId(null);
              setSearchQuery("");
            }}
            className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
          >
            <MessageCircle size={22} />
            <span className="text-xs">Conversas</span>
          </button>
          <button
            className="flex-1 py-3 flex flex-col items-center gap-1 text-whatsapp-green"
          >
            <Users size={22} />
            <span className="text-xs font-medium">Comunidades FF</span>
          </button>
        </div>

        {/* Modal Criar Diário */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-whatsapp-dark rounded-2xl w-full max-w-md overflow-hidden">
              <div className="bg-whatsapp-light px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Cadastrar diário</h2>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Nome do diário</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Meu Clã Free Fire"
                    maxLength={40}
                    className="w-full bg-whatsapp-light rounded-lg px-4 py-3 text-white outline-none placeholder-gray-500 focus:ring-2 focus:ring-whatsapp-green"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Descrição</label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Sobre o que é esse diário..."
                    rows={3}
                    maxLength={200}
                    className="w-full bg-whatsapp-light rounded-lg px-4 py-3 text-white outline-none placeholder-gray-500 focus:ring-2 focus:ring-whatsapp-green resize-none"
                  />
                </div>

                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                  className="w-full bg-whatsapp-green text-white font-medium py-3 rounded-lg hover:bg-[#00c49a] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cadastrar diário
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== TELA DE CONVERSAS (estilo WhatsApp) ==========
  return (
    <div className="flex h-screen bg-whatsapp-darker overflow-hidden">
      {/* Sidebar de conversas */}
      <div
        className={`${
          showChat ? "hidden md:flex" : "flex"
        } w-full md:w-[400px] flex-col border-r border-whatsapp-light`}
      >
        <div className="bg-whatsapp-light px-4 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-white">Conversas</h1>
            <p className="text-xs text-gray-400">Olá, {nickname}</p>
          </div>
          <button className="text-gray-400 hover:text-white transition" title="Configurações">
            <Settings size={22} />
          </button>
        </div>

        <div className="p-3 bg-whatsapp-dark shrink-0">
          <div className="flex items-center bg-whatsapp-light rounded-lg px-3 py-2 gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar conversas..."
              className="bg-transparent outline-none text-sm w-full text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {myChats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Você ainda não tem conversas.</p>
              <button
                onClick={() => {
                  setScreen("comunidades");
                  setSearchQuery("");
                }}
                className="mt-3 text-whatsapp-green text-sm hover:underline"
              >
                Explorar Comunidades FF
              </button>
            </div>
          ) : (
            myChats.map((group) => (
              <div
                key={group.id}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-whatsapp-light transition cursor-pointer ${
                  selectedGroupId === group.id ? "bg-whatsapp-light" : ""
                }`}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setShowGroupInfo(false);
                }}
              >
                <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {group.name.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white truncate">
                      {group.name}
                      {group.createdByMe && (
                        <span className="ml-1 text-[10px] text-whatsapp-green">• você</span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{group.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-sm text-gray-400 truncate">{group.lastMessage}</p>
                    {group.unread > 0 && (
                      <span className="bg-whatsapp-green text-white text-xs rounded-full px-1.5 min-w-[20px] text-center shrink-0 ml-2">
                        {group.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom navigation (mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-whatsapp-light border-t border-whatsapp-dark flex">
          <button className="flex-1 py-3 flex flex-col items-center gap-1 text-whatsapp-green">
            <MessageCircle size={22} />
            <span className="text-xs font-medium">Conversas</span>
          </button>
          <button
            onClick={() => {
              setScreen("comunidades");
              setSelectedGroupId(null);
              setSearchQuery("");
            }}
            className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
          >
            <Users size={22} />
            <span className="text-xs">Comunidades FF</span>
          </button>
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
              {selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe && (
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
                  selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe
                    ? "Somente admins podem enviar..."
                    : "Digite uma mensagem"
                }
                disabled={selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe}
                className="flex-1 bg-whatsapp-dark rounded-lg px-4 py-2.5 text-sm outline-none text-white placeholder-gray-400 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={
                  !inputText.trim() ||
                  (selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe)
                }
                className="bg-whatsapp-green text-white p-2.5 rounded-full hover:bg-[#00c49a] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Painel info do grupo */}
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
                Olá, {nickname}! Selecione uma conversa ou vá em Comunidades FF
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
