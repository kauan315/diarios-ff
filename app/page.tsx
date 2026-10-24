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

  const myChats = groups.filter(
    (g) =>
      g.isJoined &&
      (g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    setScreen("conversas");
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
        g.id === selectedGroupId ? { ...g, onlyAdminsCanSend: !g.onlyAdminsCanSend } : g
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

  // ===== LOGIN =====
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-wa-green rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-wa-green/20">
              <MessageCircle size={44} className="text-white" />
            </div>
            <h1 className="text-3xl font-light text-wa-text tracking-wide">Diários FF</h1>
            <p className="text-wa-secondary mt-2 text-sm">Chat e comunidades de Free Fire</p>
          </div>

          <div className="bg-wa-panel rounded-xl p-6 space-y-5">
            <div>
              <label className="text-xs text-wa-secondary mb-1.5 block uppercase tracking-wider">Nickname</label>
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Seu nome no jogo"
                maxLength={20}
                className="w-full bg-wa-input rounded-lg px-4 py-3.5 text-wa-text outline-none placeholder-wa-muted focus:ring-1 focus:ring-wa-green transition"
                autoFocus
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={tempNickname.trim().length < 2}
              className="w-full bg-wa-green text-white font-medium py-3.5 rounded-lg hover:bg-wa-green-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== COMUNIDADES FF =====
  if (screen === "comunidades") {
    return (
      <div className="min-h-screen bg-wa-bg flex flex-col">
        <div className="bg-wa-header px-4 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-medium text-wa-text">Comunidades FF</h1>
            <p className="text-xs text-wa-secondary">Descubra e entre em diários</p>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-wa-green text-white px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-wa-green-dark transition"
          >
            <Plus size={16} />
            Cadastrar
          </button>
        </div>

        <div className="px-3 py-2 bg-wa-panel shrink-0">
          <div className="flex items-center bg-wa-input rounded-lg px-3 py-2 gap-3">
            <Search size={18} className="text-wa-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar diários..."
              className="bg-transparent outline-none text-sm w-full text-wa-text placeholder-wa-muted"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-24">
          {allCommunities.length === 0 ? (
            <div className="text-center py-20 text-wa-muted">
              <Compass size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum diário encontrado</p>
            </div>
          ) : (
            allCommunities.map((group) => (
              <div key={group.id} className="bg-wa-panel rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-lg shrink-0">
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-wa-text">{group.name}</h3>
                    <p className="text-sm text-wa-secondary mt-0.5 line-clamp-2">{group.description}</p>
                    <p className="text-xs text-wa-muted mt-1.5">
                      {group.members.toLocaleString("pt-BR")} membros
                      {group.onlyAdminsCanSend && " · Somente admins"}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  {group.isJoined ? (
                    <button
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setScreen("conversas");
                      }}
                      className="w-full bg-wa-header text-wa-text py-2 rounded-lg text-sm font-medium hover:bg-wa-hover transition"
                    >
                      Abrir conversa
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="w-full bg-wa-green text-white py-2 rounded-lg text-sm font-medium hover:bg-wa-green-dark transition"
                    >
                      Entrar no diário
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-wa-header border-t border-wa-border flex">
          <button
            onClick={() => {
              setScreen("conversas");
              setSelectedGroupId(null);
              setSearchQuery("");
            }}
            className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-wa-secondary hover:text-wa-text transition"
          >
            <MessageCircle size={22} />
            <span className="text-[11px]">Conversas</span>
          </button>
          <button className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-wa-green">
            <Users size={22} />
            <span className="text-[11px] font-medium">Comunidades</span>
          </button>
        </div>

        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-wa-panel w-full sm:max-w-md sm:rounded-xl overflow-hidden">
              <div className="bg-wa-header px-4 py-3 flex items-center justify-between">
                <h2 className="text-base font-medium text-wa-text">Cadastrar diário</h2>
                <button onClick={() => setShowCreateGroup(false)} className="text-wa-secondary hover:text-wa-text">
                  <X size={22} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-wa-secondary mb-1.5 block">Nome do diário</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Meu Clã Free Fire"
                    maxLength={40}
                    className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none placeholder-wa-muted focus:ring-1 focus:ring-wa-green"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-wa-secondary mb-1.5 block">Descrição</label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Sobre o que é esse diário..."
                    rows={3}
                    maxLength={200}
                    className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none placeholder-wa-muted focus:ring-1 focus:ring-wa-green resize-none"
                  />
                </div>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                  className="w-full bg-wa-green text-white font-medium py-3 rounded-lg hover:bg-wa-green-dark transition disabled:opacity-40"
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

  // ===== CONVERSAS (WhatsApp style) =====
  return (
    <div className="flex h-screen bg-wa-bg overflow-hidden">
      {/* Sidebar */}
      <div className={`${showChat ? "hidden md:flex" : "flex"} w-full md:w-[400px] flex-col bg-wa-panel border-r border-wa-border`}>
        <div className="bg-wa-header px-4 py-2.5 flex items-center justify-between shrink-0 h-[60px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-sm">
              {nickname.charAt(0).toUpperCase()}
            </div>
            <span className="text-wa-text font-medium">{nickname}</span>
          </div>
          <div className="flex items-center gap-5 text-wa-secondary">
            <button className="hover:text-wa-text transition" title="Configurações">
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="px-3 py-2 bg-wa-panel shrink-0">
          <div className="flex items-center bg-wa-input rounded-lg px-3 py-1.5 gap-3">
            <Search size={16} className="text-wa-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar"
              className="bg-transparent outline-none text-sm w-full text-wa-text placeholder-wa-muted py-1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {myChats.length === 0 ? (
            <div className="p-10 text-center text-wa-muted">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma conversa ainda</p>
              <button
                onClick={() => {
                  setScreen("comunidades");
                  setSearchQuery("");
                }}
                className="mt-3 text-wa-green text-sm hover:underline"
              >
                Explorar Comunidades FF
              </button>
            </div>
          ) : (
            myChats.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setShowGroupInfo(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-wa-hover transition text-left ${
                  selectedGroupId === group.id ? "bg-wa-hover" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  {group.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 border-b border-wa-border pb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-wa-text truncate text-[15px]">{group.name}</h3>
                    <span className={`text-[11px] shrink-0 ml-2 ${
                      group.unread > 0 ? "text-wa-green" : "text-wa-muted"
                    }`}>{group.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-[13px] text-wa-secondary truncate">{group.lastMessage}</p>
                    {group.unread > 0 && (
                      <span className="bg-wa-green text-white text-[11px] font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shrink-0 ml-2">
                        {group.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Bottom nav mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-wa-header border-t border-wa-border flex">
          <button className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-wa-green">
            <MessageCircle size={22} />
            <span className="text-[11px] font-medium">Conversas</span>
          </button>
          <button
            onClick={() => {
              setScreen("comunidades");
              setSelectedGroupId(null);
              setSearchQuery("");
            }}
            className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-wa-secondary hover:text-wa-text transition"
          >
            <Users size={22} />
            <span className="text-[11px]">Comunidades</span>
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className={`${showChat ? "flex" : "hidden md:flex"} flex-1 flex-col relative bg-wa-bg`}>
        {selectedGroup ? (
          <>
            <div className="bg-wa-header px-3 md:px-4 h-[60px] flex items-center gap-3 shrink-0">
              <button className="md:hidden text-wa-secondary hover:text-wa-text" onClick={() => setSelectedGroupId(null)}>
                <ArrowLeft size={24} />
              </button>
              <div
                className="w-10 h-10 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold cursor-pointer"
                onClick={() => setShowGroupInfo(true)}
              >
                {selectedGroup.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowGroupInfo(true)}>
                <h2 className="font-medium text-wa-text truncate text-[16px]">{selectedGroup.name}</h2>
                <p className="text-[12px] text-wa-secondary">
                  {selectedGroup.members.toLocaleString("pt-BR")} membros
                  {selectedGroup.onlyAdminsCanSend && " · Somente admins"}
                </p>
              </div>
              <button className="text-wa-secondary hover:text-wa-text" onClick={() => setShowGroupInfo(true)}>
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 chat-bg">
              {selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe && (
                <div className="text-center py-3">
                  <span className="bg-wa-header/80 text-wa-secondary text-xs px-3 py-1.5 rounded-lg">
                    🔒 Somente administradores podem enviar mensagens
                  </span>
                </div>
              )}

              {currentMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`relative rounded-lg px-2.5 py-1.5 max-w-[85%] md:max-w-[65%] shadow-sm ${
                      msg.isMe ? "bg-wa-bubble rounded-tr-none" : "bg-wa-incoming rounded-tl-none"
                    }`}
                  >
                    {!msg.isMe && (
                      <p className="text-[13px] text-wa-green font-medium mb-0.5">
                        {msg.sender}
                        {msg.isAdmin && <span className="text-wa-muted font-normal"> · Admin</span>}
                      </p>
                    )}
                    <p className="text-[14.2px] text-wa-text leading-snug whitespace-pre-wrap break-words">{msg.text}</p>
                    <p className={`text-[11px] text-right mt-0.5 ${msg.isMe ? "text-wa-secondary" : "text-wa-muted"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-wa-header px-2 md:px-3 py-2 flex items-center gap-2 shrink-0">
              <button className="text-wa-secondary hover:text-wa-text p-1.5">
                <Smile size={24} />
              </button>
              <button className="text-wa-secondary hover:text-wa-text p-1.5">
                <Paperclip size={22} />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe
                    ? "Somente admins podem enviar"
                    : "Mensagem"
                }
                disabled={selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe}
                className="flex-1 bg-wa-input rounded-lg px-4 py-2.5 text-[15px] outline-none text-wa-text placeholder-wa-muted disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || (selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe)}
                className="bg-wa-green text-white p-2.5 rounded-full hover:bg-wa-green-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>

            {/* Group info panel */}
            {showGroupInfo && (
              <div className="absolute inset-0 bg-wa-bg z-20 flex flex-col">
                <div className="bg-wa-header px-4 h-[60px] flex items-center gap-4 shrink-0">
                  <button onClick={() => setShowGroupInfo(false)} className="text-wa-secondary hover:text-wa-text">
                    <ArrowLeft size={24} />
                  </button>
                  <h2 className="text-base font-medium text-wa-text">Dados do grupo</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col items-center py-8 bg-wa-panel">
                    <div className="w-32 h-32 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-5xl mb-4">
                      {selectedGroup.name.charAt(0)}
                    </div>
                    <h3 className="text-xl text-wa-text">{selectedGroup.name}</h3>
                    <p className="text-sm text-wa-secondary mt-1">
                      Grupo · {selectedGroup.members.toLocaleString("pt-BR")} participantes
                    </p>
                  </div>

                  <div className="px-4 py-4 bg-wa-panel mt-2">
                    <p className="text-xs text-wa-green mb-1">Descrição do grupo</p>
                    <p className="text-sm text-wa-text">{selectedGroup.description}</p>
                  </div>

                  <div className="mt-2 bg-wa-panel">
                    <button onClick={toggleOnlyAdmins} className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover transition">
                      <Shield size={20} className="text-wa-secondary" />
                      <div className="flex-1 text-left">
                        <p className="text-[15px] text-wa-text">Somente admins podem enviar mensagens</p>
                        <p className="text-xs text-wa-secondary">{selectedGroup.onlyAdminsCanSend ? "Ativado" : "Desativado"}</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative transition ${selectedGroup.onlyAdminsCanSend ? "bg-wa-green" : "bg-wa-input"}`}>
                        <div
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow"
                          style={{ left: selectedGroup.onlyAdminsCanSend ? "18px" : "2px" }}
                        />
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover transition">
                      <UserPlus size={20} className="text-wa-secondary" />
                      <span className="text-[15px] text-wa-text">Adicionar participantes</span>
                    </button>
                    <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover transition">
                      <Info size={20} className="text-wa-secondary" />
                      <span className="text-[15px] text-wa-text">Ver participantes</span>
                    </button>
                  </div>

                  <div className="mt-2 bg-wa-panel">
                    <button
                      onClick={() => handleLeaveGroup(selectedGroup.id)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-wa-hover transition text-wa-danger"
                    >
                      <LogOut size={20} />
                      <span className="text-[15px]">Sair do grupo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-8">
              <div className="w-20 h-20 rounded-full bg-wa-header flex items-center justify-center mx-auto mb-5">
                <MessageCircle size={36} className="text-wa-muted" />
              </div>
              <p className="text-xl font-light text-wa-text">Diários FF</p>
              <p className="text-sm mt-2 text-wa-secondary max-w-xs">
                Envie e receba mensagens nos diários de Free Fire.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
