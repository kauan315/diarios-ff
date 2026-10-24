"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, MessageCircle, Users, Settings, Plus, ArrowLeft, MoreVertical,
  Send, Smile, Paperclip, Info, Shield, UserPlus, LogOut, X, Compass, Bot, Palette,
  Camera, MessageCirclePlus, Pin, Mic,
} from "lucide-react";
import ProfileScreen from "./ProfileScreen";
import GroupInfoScreen from "./GroupInfoScreen";

type Message = { id: number; sender: string; text: string; time: string; isMe: boolean; isAdmin?: boolean };
type Group = {
  id: number; name: string; description: string; members: number;
  lastMessage: string; time: string; unread: number;
  onlyAdminsCanSend: boolean; isJoined: boolean; createdByMe?: boolean;
};

const DEFAULT_GROUPS: Group[] = [
  { id: 1, name: "Diário Free Fire BR", description: "Comunidade principal de diários do Free Fire Brasil.", members: 1240, lastMessage: "Alguém upou o rank hoje?", time: "14:32", unread: 3, onlyAdminsCanSend: false, isJoined: false },
  { id: 2, name: "Clãs e Organizações", description: "Encontre e entre em clãs.", members: 890, lastMessage: "Procuro membros ativos", time: "13:15", unread: 0, onlyAdminsCanSend: false, isJoined: false },
  { id: 3, name: "Dicas e Estratégias", description: "Compartilhe dicas de gameplay.", members: 2100, lastMessage: "Melhor loadout da temporada", time: "11:48", unread: 0, onlyAdminsCanSend: false, isJoined: false },
  { id: 4, name: "Diário Ranked Elite", description: "Só jogadores Elite e acima.", members: 456, lastMessage: "Somente admins podem enviar mensagens", time: "10:02", unread: 0, onlyAdminsCanSend: true, isJoined: false },
  { id: 5, name: "Free Fire Latinoamérica", description: "Comunidad de Free Fire Latinoamérica", members: 3200, lastMessage: "¿Alguien para ranked?", time: "09:45", unread: 0, onlyAdminsCanSend: false, isJoined: false },
];

const DEFAULT_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, sender: "Admin", text: "Bem-vindos ao grupo! Leiam as regras.", time: "10:00", isMe: false, isAdmin: true },
    { id: 2, sender: "Jogador123", text: "Alguém quer duo ranked?", time: "14:30", isMe: false },
  ],
  2: [{ id: 1, sender: "LíderOrg", text: "Procuro membros ativos pro clã.", time: "13:10", isMe: false, isAdmin: true }],
  3: [{ id: 1, sender: "ProPlayer", text: "Melhor loadout: MP40 + Desert", time: "11:40", isMe: false }],
  4: [{ id: 1, sender: "Admin Elite", text: "Somente administradores podem enviar mensagens.", time: "09:00", isMe: false, isAdmin: true }],
  5: [{ id: 1, sender: "Admin", text: "Bienvenidos!", time: "09:00", isMe: false, isAdmin: true }],
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [hideProfilePhoto, setHideProfilePhoto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [screen, setScreen] = useState<"conversas" | "comunidades">("conversas");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>(DEFAULT_GROUPS);
  const [messages, setMessages] = useState<Record<number, Message[]>>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [createKind, setCreateKind] = useState<"grupo" | "comunidade">("grupo");
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedNick = loadFromStorage<string>("dff_nickname", "");
    const savedProfilePhoto = loadFromStorage<string>("dff_profile_photo", "");
    const savedHideProfilePhoto = loadFromStorage<boolean>("dff_hide_profile_photo", false);
    const savedGroups = loadFromStorage<Group[]>("dff_groups", DEFAULT_GROUPS);
    const savedMessages = loadFromStorage<Record<number, Message[]>>("dff_messages", DEFAULT_MESSAGES);
    if (savedNick) { setNickname(savedNick); setIsLoggedIn(true); }
    setProfilePhoto(savedProfilePhoto); setHideProfilePhoto(savedHideProfilePhoto);
    setGroups(savedGroups); setMessages(savedMessages); setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage("dff_nickname", nickname);
    saveToStorage("dff_profile_photo", profilePhoto);
    saveToStorage("dff_hide_profile_photo", hideProfilePhoto);
    saveToStorage("dff_groups", groups);
    saveToStorage("dff_messages", messages);
  }, [nickname, profilePhoto, hideProfilePhoto, groups, messages, hydrated]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;
  const currentMessages = selectedGroupId ? messages[selectedGroupId] || [] : [];
  const myChats = groups.filter((g) => g.isJoined).filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const allCommunities = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userMatches = Object.entries(messages)
    .flatMap(([groupId, list]) => list
      .filter((msg) => msg.sender && msg.sender !== nickname && msg.sender.toLowerCase().includes(userSearchQuery.trim().toLowerCase()))
      .map((msg) => ({
        sender: msg.sender,
        groupName: groups.find((g) => g.id === Number(groupId))?.name || "Grupo",
      })))
    .filter((user, index, users) => users.findIndex((item) => item.sender === user.sender) === index);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [currentMessages]);

  const handleLogin = () => {
    if (tempNickname.trim().length < 2) return;
    const nick = tempNickname.trim();
    setNickname(nick); setIsLoggedIn(true); saveToStorage("dff_nickname", nick);
  };

  const handleLogout = () => {
    if (!confirm("Sair da conta? Seus grupos e mensagens ficam salvos neste aparelho.")) return;
    setIsLoggedIn(false); setNickname(""); setSelectedGroupId(null); setShowSettings(false);
    localStorage.removeItem("dff_nickname");
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedGroupId || !selectedGroup) return;
    if (selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe) {
      alert("Somente administradores podem enviar mensagens neste grupo."); return;
    }
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const newMessage: Message = { id: Date.now(), sender: nickname, text: inputText.trim(), time, isMe: true };
    setMessages((prev) => ({ ...prev, [selectedGroupId]: [...(prev[selectedGroupId] || []), newMessage] }));
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, lastMessage: inputText.trim(), time, unread: 0, isJoined: true } : g));
    setInputText("");
  };

  const handleJoinGroup = (groupId: number) => {
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, isJoined: true, unread: 0 } : g));
    setSelectedGroupId(groupId); setScreen("conversas"); setSearchQuery("");
  };

  const handleLeaveGroup = (groupId: number) => {
    if (!confirm("Tem certeza que deseja sair deste grupo?\nEle sairá da sua lista de Conversas.")) return;
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, isJoined: false } : g));
    setSelectedGroupId(null); setShowGroupInfo(false);
  };

  const toggleOnlyAdmins = () => {
    if (!selectedGroupId) return;
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, onlyAdminsCanSend: !g.onlyAdminsCanSend } : g));
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newId = Date.now();
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const newGroup: Group = {
      id: newId, name: newGroupName.trim(), description: newGroupDesc.trim() || (createKind === "comunidade" ? "Comunidade criada no Diários FF" : "Grupo criado no Diários FF"),
      members: 1, lastMessage: "Diário criado", time, unread: 0, onlyAdminsCanSend: false, isJoined: true, createdByMe: true,
    };
    setGroups((prev) => [newGroup, ...prev]);
    setMessages((prev) => ({ ...prev, [newId]: [{ id: 1, sender: nickname, text: `${createKind === "comunidade" ? "Comunidade" : "Grupo"} "${newGroup.name}" criado por ${nickname}`, time, isMe: true, isAdmin: true }] }));
    setNewGroupName(""); setNewGroupDesc(""); setShowCreateGroup(false);
    setSelectedGroupId(newId); setScreen("conversas");
  };

  const showChat = selectedGroupId !== null && screen === "conversas";

  if (!hydrated) return <div className="min-h-screen bg-wa-bg flex items-center justify-center"><div className="text-wa-secondary text-sm">Carregando...</div></div>;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-wa-green rounded-full flex items-center justify-center mx-auto mb-5">
              <MessageCircle size={44} className="text-white" />
            </div>
            <h1 className="text-3xl font-light text-wa-text">Diários FF</h1>
            <p className="text-wa-secondary mt-2 text-sm">Chat e comunidades de Free Fire</p>
          </div>
          <div className="bg-wa-panel rounded-xl p-6 space-y-5 shadow-sm">
            <div>
              <label className="text-xs text-wa-secondary mb-1.5 block uppercase tracking-wider">Nickname</label>
              <input type="text" value={tempNickname} onChange={(e) => setTempNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Seu nome no jogo" maxLength={20}
                className="w-full bg-wa-input rounded-lg px-4 py-3.5 text-wa-text outline-none placeholder-wa-muted focus:ring-1 focus:ring-wa-green" autoFocus />
            </div>
            <button onClick={handleLogin} disabled={tempNickname.trim().length < 2}
              className="w-full bg-wa-green text-white font-medium py-3.5 rounded-lg hover:bg-wa-green-dark transition disabled:opacity-40">Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "comunidades") {
    return (
      <div className="min-h-screen bg-wa-bg flex flex-col">
        <div className="bg-wa-header px-4 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-medium text-wa-text">Comunidades FF</h1>
            <p className="text-xs text-wa-secondary">Descubra e entre em diários</p>
          </div>
          <button onClick={() => { setCreateKind("comunidade"); setShowCreateGroup(true); }}
            className="bg-wa-green text-white px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-wa-green-dark">
            <Plus size={16} /> Cadastrar
          </button>
        </div>
        <div className="px-3 py-2 bg-wa-panel shrink-0">
          <div className="flex items-center bg-wa-input rounded-lg px-3 py-2 gap-3">
            <Search size={18} className="text-wa-secondary" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar diários..." className="bg-transparent outline-none text-sm w-full text-wa-text placeholder-wa-muted" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-24">
          {allCommunities.map((group) => (
            <div key={group.id} className="bg-wa-panel rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-lg shrink-0">{group.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-wa-text">{group.name}</h3>
                  <p className="text-sm text-wa-secondary mt-0.5 line-clamp-2">{group.description}</p>
                  <p className="text-xs text-wa-muted mt-1.5">
                    {group.members.toLocaleString("pt-BR")} membros
                    {group.isJoined && <span className="text-wa-green-dark"> · Você está neste grupo</span>}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                {group.isJoined ? (
                  <button onClick={() => { setSelectedGroupId(group.id); setScreen("conversas"); setSearchQuery(""); }}
                    className="w-full bg-wa-header text-wa-text py-2 rounded-lg text-sm font-medium hover:bg-wa-hover">Abrir conversa</button>
                ) : (
                  <button onClick={() => handleJoinGroup(group.id)}
                    className="w-full bg-wa-green text-white py-2 rounded-lg text-sm font-medium hover:bg-wa-green-dark">Entrar no diário</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-wa-panel border-t border-wa-border flex">
          <button onClick={() => { setScreen("conversas"); setSelectedGroupId(null); setSearchQuery(""); }}
            className="flex-1 py-2 flex flex-col items-center gap-0.5 text-wa-secondary">
            <MessageCircle size={24} /><span className="text-[11px]">Conversas</span>
          </button>
          <button className="flex-1 py-2 flex flex-col items-center gap-0.5 text-wa-green">
            <Users size={24} /><span className="text-[11px] font-medium">Comunidades</span>
          </button>
        </div>
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-wa-panel w-full sm:max-w-md sm:rounded-xl overflow-hidden">
              <div className="bg-wa-header px-4 py-3 flex items-center justify-between">
                <h2 className="text-base font-medium text-wa-text">{createKind === "comunidade" ? "Criar nova comunidade" : "Criar novo grupo"}</h2>
                <button onClick={() => setShowCreateGroup(false)} className="text-wa-secondary"><X size={22} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-wa-secondary mb-1.5 block">Nome do diário</label>
                  <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={createKind === "comunidade" ? "Ex: Comunidade Free Fire" : "Ex: Grupo de ranked"} maxLength={40}
                    className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none placeholder-wa-muted" autoFocus />
                </div>
                <div>
                  <label className="text-xs text-wa-secondary mb-1.5 block">Descrição</label>
                  <textarea value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder={createKind === "comunidade" ? "Sobre o que é essa comunidade..." : "Sobre o que é esse grupo..."} rows={3} maxLength={200}
                    className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none placeholder-wa-muted resize-none" />
                </div>
                <button onClick={handleCreateGroup} disabled={!newGroupName.trim()}
                  className="w-full bg-wa-green text-white font-medium py-3 rounded-lg disabled:opacity-40">{createKind === "comunidade" ? "Criar comunidade" : "Criar grupo"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-wa-bg overflow-hidden">
      <div className={`${showChat ? "hidden md:flex" : "flex"} w-full md:w-[400px] flex-col bg-wa-panel border-r border-wa-border`}>
        <div className="bg-wa-panel px-4 pt-3 pb-1 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[22px] font-semibold text-wa-green">Diários FF</h1>
            <div className="flex items-center gap-5 text-wa-secondary">
              <div className="relative">
                <button
                  onClick={() => setShowQuickMenu((open) => !open)}
                  className="hover:text-wa-text"
                  title="Mais opções"
                  aria-label="Abrir menu"
                  aria-expanded={showQuickMenu}
                >
                  <MoreVertical size={22} />
                </button>
                {showQuickMenu && (
                  <>
                    <button
                      aria-label="Fechar menu"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowQuickMenu(false)}
                    />
                    <div className="absolute right-0 top-8 z-50 w-56 rounded-lg border border-wa-border bg-wa-panel py-1 shadow-xl">
                      <button
                        onClick={() => { setShowQuickMenu(false); setShowSettings(true); }}
                        className="w-full px-4 py-3 text-left text-sm text-wa-text hover:bg-wa-hover"
                      >
                        Perfil e configurações
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center bg-wa-input rounded-full px-4 py-2.5 gap-3 mb-1">
            <Search size={18} className="text-wa-secondary" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar diários e conversas" className="bg-transparent outline-none text-[15px] w-full text-wa-text placeholder-wa-muted" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {myChats.length === 0 ? (
            <div className="p-10 text-center text-wa-muted">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma conversa ainda</p>
              <p className="text-xs mt-1">Entre em um diário nas Comunidades</p>
              <button onClick={() => { setScreen("comunidades"); setSearchQuery(""); }} className="mt-3 text-wa-green text-sm hover:underline">Ir para Comunidades FF</button>
            </div>
          ) : myChats.map((group) => (
            <button key={group.id} onClick={() => { setSelectedGroupId(group.id); setShowGroupInfo(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-wa-hover text-left ${selectedGroupId === group.id ? "bg-wa-hover" : ""}`}>
              <div className="w-[52px] h-[52px] rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-xl shrink-0">
                {group.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 py-1 border-b border-wa-border">
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-medium text-wa-text truncate text-[16px]">{group.name}</h3>
                  <span className={`text-[12px] shrink-0 ${group.unread > 0 ? "text-wa-green font-medium" : "text-wa-muted"}`}>
                    {group.time}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-0.5 gap-2">
                  <p className="text-[14px] text-wa-secondary truncate">{group.lastMessage}</p>
                  {group.unread > 0 && (
                    <span className="bg-wa-green text-white text-[12px] font-semibold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                      {group.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-wa-panel border-t border-wa-border flex">
          <button className="flex-1 py-2 flex flex-col items-center gap-0.5 text-wa-green">
            <div className="relative">
              <MessageCircle size={24} />
              {myChats.some(g => g.unread > 0) && (
                <span className="absolute -top-1 -right-2 bg-wa-green text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {myChats.reduce((a, g) => a + g.unread, 0)}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium">Conversas</span>
          </button>
          <button onClick={() => { setScreen("comunidades"); setSelectedGroupId(null); setSearchQuery(""); }}
            className="flex-1 py-2 flex flex-col items-center gap-0.5 text-wa-secondary">
            <Users size={24} /><span className="text-[11px]">Comunidades</span>
          </button>
        </div>

        <div className="md:hidden fixed bottom-20 right-4 z-20 flex flex-col items-end gap-2">
          {showFabMenu && (
            <div className="mb-1 w-56 rounded-xl border border-wa-border bg-wa-panel py-2 shadow-xl">
              <button onClick={() => { setCreateKind("grupo"); setScreen("comunidades"); setSelectedGroupId(null); setShowCreateGroup(true); setShowFabMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-wa-text hover:bg-wa-hover">
                <MessageCirclePlus size={19} className="text-wa-green" /> Criar novo grupo
              </button>
              <button onClick={() => { setCreateKind("comunidade"); setScreen("comunidades"); setSelectedGroupId(null); setShowCreateGroup(true); setShowFabMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-wa-text hover:bg-wa-hover">
                <Users size={19} className="text-wa-green" /> Criar nova comunidade
              </button>
              <button onClick={() => { setShowUserSearch(true); setUserSearchQuery(""); setShowFabMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-wa-text hover:bg-wa-hover">
                <Search size={19} className="text-wa-green" /> Buscar usuários
              </button>
            </div>
          )}
          <button
            onClick={() => setShowFabMenu((open) => !open)}
            aria-label="Criar grupo, comunidade ou buscar usuários"
            aria-expanded={showFabMenu}
            className="w-14 h-14 bg-wa-green rounded-2xl shadow-lg flex items-center justify-center text-white"
          >
            {showFabMenu ? <X size={26} /> : <Plus size={28} />}
          </button>
        </div>
      </div>

      <div className={`${showChat ? "flex" : "hidden md:flex"} flex-1 flex-col relative bg-wa-bg`}>
        {selectedGroup ? (
          <>
            <div className="bg-wa-panel px-2 md:px-3 h-[60px] flex items-center gap-2 shrink-0 border-b border-wa-border">
              <button className="md:hidden text-wa-secondary p-1" onClick={() => setSelectedGroupId(null)}>
                <ArrowLeft size={24} />
              </button>
              <div
                className="w-10 h-10 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold cursor-pointer shrink-0"
                onClick={() => setShowGroupInfo(true)}
              >
                {selectedGroup.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowGroupInfo(true)}>
                <h2 className="font-medium text-wa-text truncate text-[16px]">{selectedGroup.name}</h2>
                <p className="text-[12px] text-wa-secondary truncate">
                  {selectedGroup.members.toLocaleString("pt-BR")} membros
                  {selectedGroup.onlyAdminsCanSend && " · Somente admins"}
                </p>
              </div>
              <button className="text-wa-secondary p-2" onClick={() => setShowGroupInfo(true)}><MoreVertical size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 chat-bg">
              <div className="flex justify-center py-1">
                <span className="bg-white/90 text-wa-secondary text-[12px] px-3 py-1 rounded-lg shadow-sm">
                  {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-center px-2">
                <div className="bg-[#fff3c9] text-[#54656f] text-[12.5px] px-3 py-2 rounded-lg max-w-[90%] text-center leading-snug shadow-sm">
                  🔒 As mensagens são protegidas com a criptografia de ponta a ponta. Somente as pessoas que fazem parte da conversa podem ler e compartilhar esse conteúdo.{" "}
                  <span className="text-[#027eb5] font-medium">Saiba mais</span>
                </div>
              </div>
              {selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe && (
                <div className="flex justify-center px-2">
                  <div className="bg-white/90 text-wa-secondary text-[12.5px] px-3 py-2 rounded-lg max-w-[90%] text-center shadow-sm">
                    🔒 Somente administradores podem enviar mensagens neste grupo.
                  </div>
                </div>
              )}
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-lg px-2.5 py-1.5 max-w-[85%] md:max-w-[65%] shadow-sm ${msg.isMe ? "bg-wa-bubble rounded-tr-none" : "bg-wa-incoming rounded-tl-none"}`}>
                    {!msg.isMe && (
                      <p className="text-[13px] text-wa-green-dark font-medium mb-0.5">
                        {msg.sender}{msg.isAdmin && <span className="text-wa-muted font-normal"> · Admin</span>}
                      </p>
                    )}
                    <p className="text-[14.2px] text-wa-text leading-snug whitespace-pre-wrap break-words">{msg.text}</p>
                    <p className={`text-[11px] text-right mt-0.5 ${msg.isMe ? "text-wa-secondary" : "text-wa-muted"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-[#f0f2f5] px-2 py-1.5 flex items-end gap-1.5 shrink-0">
              <div className="flex-1 flex items-center bg-white rounded-full px-2 py-1 min-h-[42px] shadow-sm">
                <button className="text-wa-secondary p-1.5 shrink-0"><Smile size={24} /></button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe ? "Somente admins podem enviar" : "Mensagem"}
                  disabled={selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe}
                  className="flex-1 bg-transparent px-2 py-2 text-[15px] outline-none text-wa-text placeholder-wa-muted disabled:opacity-50"
                />
                <button className="text-wa-secondary p-1.5 shrink-0"><Paperclip size={22} /></button>
                {!inputText.trim() && (
                  <button className="text-wa-secondary p-1.5 shrink-0"><Camera size={22} /></button>
                )}
              </div>
              {inputText.trim() && !(selectedGroup.onlyAdminsCanSend && !selectedGroup.createdByMe) ? (
                <button onClick={handleSendMessage} className="bg-wa-green text-white p-2.5 rounded-full shrink-0 shadow-sm">
                  <Send size={20} />
                </button>
              ) : (
                <button className="bg-wa-green text-white p-2.5 rounded-full shrink-0 shadow-sm">
                  <Mic size={20} />
                </button>
              )}
            </div>

            {showGroupInfo && (
              <GroupInfoScreen
                group={selectedGroup}
                nickname={nickname}
                onClose={() => setShowGroupInfo(false)}
                onLeave={() => handleLeaveGroup(selectedGroup.id)}
                onToggleOnlyAdmins={toggleOnlyAdmins}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-8">
              <div className="w-20 h-20 rounded-full bg-wa-header flex items-center justify-center mx-auto mb-5">
                <MessageCircle size={36} className="text-wa-muted" />
              </div>
              <p className="text-xl font-light text-wa-text">Diários FF</p>
              <p className="text-sm mt-2 text-wa-secondary max-w-xs">Selecione uma conversa ou vá em Comunidades para entrar em diários.</p>
            </div>
          </div>
        )}
      </div>

      {showUserSearch && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-wa-panel w-full max-w-md rounded-xl overflow-hidden shadow-xl">
            <div className="bg-wa-header px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-medium text-wa-text">Buscar usuários</h2>
              <button onClick={() => setShowUserSearch(false)} className="text-wa-secondary"><X size={22} /></button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 bg-wa-input rounded-lg px-3 py-2.5">
                <Search size={18} className="text-wa-secondary" />
                <input value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Digite o nickname..." className="bg-transparent outline-none text-sm w-full text-wa-text placeholder-wa-muted" autoFocus />
              </div>
              <div className="mt-3 max-h-64 overflow-y-auto">
                {userMatches.map((user) => (
                  <div key={user.sender} className="flex items-center gap-3 py-3 border-b border-wa-border last:border-0">
                    <div className="w-10 h-10 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold">{user.sender.charAt(0).toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-wa-text">{user.sender}</p>
                      <p className="text-xs text-wa-secondary">Encontrado em {user.groupName}</p>
                    </div>
                  </div>
                ))}
                {userSearchQuery.trim() && userMatches.length === 0 && (
                  <p className="text-sm text-wa-secondary text-center py-6">Nenhum usuário encontrado.</p>
                )}
                {!userSearchQuery.trim() && <p className="text-xs text-wa-secondary text-center py-4">Pesquise pelo nickname de alguém que já apareceu nas conversas.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      {showSettings && (
        <ProfileScreen
          nickname={nickname}
          profilePhoto={profilePhoto}
          hideProfilePhoto={hideProfilePhoto}
          onProfilePhotoChange={setProfilePhoto}
          onToggleHideProfilePhoto={() => setHideProfilePhoto((value) => !value)}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
