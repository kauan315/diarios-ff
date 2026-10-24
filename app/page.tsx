"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, MessageCircle, Users, Settings, Plus, ArrowLeft, MoreVertical,
  Send, Smile, Paperclip, Info, Shield, UserPlus, LogOut, X, Compass, Bot, Palette,
  MessageCirclePlus, Pin, Mic, ImagePlus, Check, Lock, Globe, Heart, Image, FileAudio, FileText, ListChecks,
} from "lucide-react";
import ProfileScreen from "./ProfileScreen";
import GroupInfoScreen from "./GroupInfoScreen";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type Message = { id: number; sender: string; text: string; time: string; isMe: boolean; isAdmin?: boolean; audioData?: string; attachmentData?: string; attachmentName?: string; attachmentType?: string; pollData?: { question: string; options: { text: string; votes: string[] }[] }; sticker?: string };
type Group = {
  id: number; name: string; description: string; members: number;
  lastMessage: string; time: string; unread: number;
  onlyAdminsCanSend: boolean; isJoined: boolean; createdByMe?: boolean;
  adminNames?: string[]; requireAdminApproval?: boolean; onlyAdminsCanEdit?: boolean; allMembersAreAdmins?: boolean;
  photo?: string; memberNames?: string[]; isCommunity?: boolean; isPublic?: boolean; isFavorite?: boolean;
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
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
  const [publicUserId, setPublicUserId] = useState("");
  const [searchedProfiles, setSearchedProfiles] = useState<{ id: string; public_id: number; nickname: string; avatar_url: string | null }[]>([]);
  const [directChatUser, setDirectChatUser] = useState<{ id: string; public_id: number; nickname: string; avatar_url: string | null } | null>(null);
  const [directConversationId, setDirectConversationId] = useState<string | null>(null);
  const [directMessages, setDirectMessages] = useState<{ id: string; sender_id: string; content: string; created_at: string }[]>([]);
  const [directMessageInput, setDirectMessageInput] = useState("");
  const [directChatError, setDirectChatError] = useState("");
  const [screen, setScreen] = useState<"conversas" | "comunidades">("conversas");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>(DEFAULT_GROUPS);
  const [messages, setMessages] = useState<Record<number, Message[]>>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [photoPreviewGroup, setPhotoPreviewGroup] = useState<Group | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showPollComposer, setShowPollComposer] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [createKind, setCreateKind] = useState<"grupo" | "comunidade">("grupo");
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupPhoto, setNewGroupPhoto] = useState("");
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);
  const [newGroupOnlyAdmins, setNewGroupOnlyAdmins] = useState(false);
  const [newGroupPrivacy, setNewGroupPrivacy] = useState<"publico" | "privado">("publico");
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  useEffect(() => {
    const savedThemeColor = localStorage.getItem("dff_theme_color");
    const savedThemeMode = localStorage.getItem("dff_theme_mode");
    const savedThemePreset = localStorage.getItem("dff_theme_preset");
    document.documentElement.dataset.theme = savedThemeColor && ["green", "pink", "blue", "red"].includes(savedThemeColor) ? savedThemeColor : "green";
    document.documentElement.dataset.mode = savedThemeMode === "light" ? "light" : "dark";
    document.documentElement.dataset.preset = savedThemePreset || "classic-green";
    const savedNick = loadFromStorage<string>("dff_nickname", "");
    const savedProfilePhoto = loadFromStorage<string>("dff_profile_photo", "");
    const savedHideProfilePhoto = loadFromStorage<boolean>("dff_hide_profile_photo", false);
    const savedGroups = loadFromStorage<Group[]>("dff_groups", DEFAULT_GROUPS);
    const savedMessages = loadFromStorage<Record<number, Message[]>>("dff_messages", DEFAULT_MESSAGES);
    if (savedNick) { setNickname(savedNick); if (!isSupabaseConfigured) setIsLoggedIn(true); }
    setProfilePhoto(savedProfilePhoto); setHideProfilePhoto(savedHideProfilePhoto);
    setGroups(savedGroups); setMessages(savedMessages); setHydrated(true);
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (!data.session) return;
        setIsLoggedIn(true);
        const { data: profile } = await supabase!.from("profiles").select("nickname, public_id").eq("id", data.session.user.id).maybeSingle();
        if (profile) { setNickname(profile.nickname || data.session.user.email?.split("@")[0] || "Jogador"); setPublicUserId(String(profile.public_id ?? "")); }
      });
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) { setIsLoggedIn(false); setPublicUserId(""); }
      });
      return () => authListener.subscription.unsubscribe();
    }
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
  const favoriteGroups = groups.filter((g) => g.isFavorite).filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const myChats = groups.filter((g) => g.isJoined && !g.isFavorite).filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const allCommunities = groups.filter((g) => (g.isPublic !== false || g.isJoined) && (
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const availableMembers = Array.from(new Set(Object.values(messages).flatMap((list) => list.map((msg) => msg.sender).filter((sender) => sender && sender !== nickname))));

  const userMatches = Object.entries(messages)
    .flatMap(([groupId, list]) => list
      .filter((msg) => msg.sender && msg.sender !== nickname && msg.sender.toLowerCase().includes(userSearchQuery.trim().toLowerCase()))
      .map((msg) => ({
        sender: msg.sender,
        groupName: groups.find((g) => g.id === Number(groupId))?.name || "Grupo",
      })))
    .filter((user, index, users) => users.findIndex((item) => item.sender === user.sender) === index);

  useEffect(() => {
    let cancelled = false;
    const query = userSearchQuery.trim();
    if (!showUserSearch || !isSupabaseConfigured || !supabase || !/^\\d+$/.test(query)) {
      setSearchedProfiles([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data, error } = await supabase!.from("profiles").select("id, public_id, nickname, avatar_url").eq("public_id", query).limit(1);
      if (!cancelled) setSearchedProfiles(error ? [] : (data || []) as typeof searchedProfiles);
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [userSearchQuery, showUserSearch]);

  const openDirectChat = async (profile: { id: string; public_id: number; nickname: string; avatar_url: string | null }) => {
    if (!supabase) { setDirectChatError("Configure o Supabase para iniciar conversas entre contas."); return; }
    const { data: authData } = await supabase.auth.getUser();
    const currentId = authData.user?.id;
    if (!currentId) { setDirectChatError("Entre na sua conta para conversar."); return; }
    if (profile.id === currentId) { setDirectChatError("Esse é o seu próprio perfil."); return; }
    setDirectChatError("");
    setDirectChatUser(profile);
    const [user_a, user_b] = [currentId, profile.id].sort();
    const { data: existing, error: findError } = await supabase.from("direct_conversations").select("id").eq("user_a", user_a).eq("user_b", user_b).maybeSingle();
    if (findError) { setDirectChatError("Não consegui abrir a conversa. Confira se o SQL do Supabase foi executado."); return; }
    let conversationId = existing?.id as string | undefined;
    if (!conversationId) {
      const { data: created, error: createError } = await supabase.from("direct_conversations").insert({ user_a, user_b }).select("id").single();
      if (createError) {
        const { data: retry } = await supabase.from("direct_conversations").select("id").eq("user_a", user_a).eq("user_b", user_b).maybeSingle();
        if (!retry) { setDirectChatError("Não foi possível criar a conversa. Tente novamente."); return; }
        conversationId = retry.id;
      } else conversationId = created.id;
    }
    setDirectConversationId(conversationId || null);
    if (!conversationId) return;
    const { data: history, error: historyError } = await supabase.from("direct_messages").select("id, sender_id, content, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (historyError) setDirectChatError("Conversa aberta, mas não consegui carregar as mensagens.");
    else setDirectMessages((history || []) as typeof directMessages);
  };

  const sendDirectMessage = async () => {
    const content = directMessageInput.trim();
    if (!content || !directConversationId || !supabase) return;
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const { data, error } = await supabase.from("direct_messages").insert({ conversation_id: directConversationId, sender_id: authData.user.id, content }).select("id, sender_id, content, created_at").single();
    if (error) { setDirectChatError("Não foi possível enviar a mensagem."); return; }
    setDirectMessages((previous) => [...previous, data as typeof directMessages[number]]);
    setDirectMessageInput("");
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [currentMessages]);

  const handleLogin = async () => {
    if (isSupabaseConfigured && supabase) {
      if (!authEmail.trim() || authPassword.length < 6) { setAuthNotice("Informe um e-mail válido e uma senha com pelo menos 6 caracteres."); return; }
      setAuthBusy(true); setAuthNotice("");
      try {
        if (authMode === "signup") {
          const nick = tempNickname.trim() || authEmail.split("@")[0];
          const { data, error } = await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword, options: { data: { nickname: nick } } });
          if (error) throw error;
          if (!data.session) { setAuthNotice("Conta criada! Confira seu e-mail para confirmar o cadastro e depois entre."); return; }
          const { data: profile } = await supabase.from("profiles").select("nickname, public_id").eq("id", data.user!.id).maybeSingle();
          setNickname(profile?.nickname || nick); setPublicUserId(String(profile?.public_id ?? "")); setIsLoggedIn(true);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
          if (error) throw error;
          const { data: profile } = await supabase.from("profiles").select("nickname, public_id").eq("id", data.user.id).maybeSingle();
          setNickname(profile?.nickname || data.user.email?.split("@")[0] || "Jogador"); setPublicUserId(String(profile?.public_id ?? "")); setIsLoggedIn(true);
        }
      } catch (error) { setAuthNotice(error instanceof Error ? error.message : "Não foi possível autenticar."); }
      finally { setAuthBusy(false); }
      return;
    }
    if (tempNickname.trim().length < 2) return;
    const nick = tempNickname.trim();
    setNickname(nick); setIsLoggedIn(true); saveToStorage("dff_nickname", nick);
  };

  const handleLogout = async () => {
    if (!confirm("Sair da conta? Seus grupos e mensagens ficam salvos neste aparelho.")) return;
    if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
    setIsLoggedIn(false); setNickname(""); setPublicUserId(""); setSelectedGroupId(null); setShowSettings(false);
    localStorage.removeItem("dff_nickname");
  };

  const isCurrentUserAdmin = (group: Group) => !!group.createdByMe || (group.adminNames || []).includes(nickname);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedGroupId || !selectedGroup) return;
    if (selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup)) {
      alert("Somente administradores podem enviar mensagens neste grupo."); return;
    }
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const newMessage: Message = { id: Date.now(), sender: nickname, text: inputText.trim(), time, isMe: true };
    setMessages((prev) => ({ ...prev, [selectedGroupId]: [...(prev[selectedGroupId] || []), newMessage] }));
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, lastMessage: inputText.trim(), time, unread: 0, isJoined: true } : g));
    setInputText("");
  };

  const handleAudioButton = async () => {
    if (!selectedGroupId || !selectedGroup) return;
    if (selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup)) {
      alert("Somente administradores podem enviar mensagens neste grupo."); return;
    }
    if (isRecordingAudio) {
      mediaRecorderRef.current?.stop();
      setIsRecordingAudio(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      alert("Este navegador não permite gravar áudio. Abra o site em um navegador atualizado e permita o acesso ao microfone.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecordingAudio(false);
        alert("Não foi possível gravar o áudio. Tente novamente.");
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size === 0) {
          alert("O áudio ficou vazio. Tente gravar novamente.");
          return;
        }
        if (blob.size > 1024 * 1024) {
          alert("O áudio passou de 1 MB. Grave um áudio mais curto para conseguir enviar.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result !== "string" || !selectedGroupId) return;
          const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          const audioMessage: Message = { id: Date.now(), sender: nickname, text: "Mensagem de áudio", time, isMe: true, audioData: reader.result };
          setMessages((prev) => ({ ...prev, [selectedGroupId]: [...(prev[selectedGroupId] || []), audioMessage] }));
          setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, lastMessage: "🎤 Mensagem de áudio", time, unread: 0, isJoined: true } : g));
        };
        reader.onerror = () => alert("Não foi possível preparar o áudio para envio.");
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setIsRecordingAudio(true);
    } catch {
      alert("Permita o acesso ao microfone para gravar e enviar áudio.");
    }
  };

  const handleAttachmentSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedGroupId || !selectedGroup) return;
    if (selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup)) {
      alert("Somente administradores podem enviar mensagens neste grupo."); return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("O arquivo precisa ter até 3 MB."); return;
    }
    const reader = new FileReader();
    reader.onerror = () => alert("Não foi possível abrir esse arquivo.");
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const isAudio = file.type.startsWith("audio/");
      const isImage = file.type.startsWith("image/");
      const message: Message = {
        id: Date.now(), sender: nickname, text: isAudio ? "Áudio anexado" : isImage ? "Foto" : file.name,
        time, isMe: true, attachmentData: reader.result, attachmentName: file.name, attachmentType: file.type,
        ...(isAudio ? { audioData: reader.result } : {}),
      };
      setMessages((prev) => ({ ...prev, [selectedGroupId]: [...(prev[selectedGroupId] || []), message] }));
      const lastMessage = isAudio ? "🎵 Áudio anexado" : isImage ? "📷 Foto" : "📎 " + file.name;
      setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, lastMessage, time, unread: 0, isJoined: true } : g));
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendSticker = (sticker: string) => {
    if (!selectedGroupId || !selectedGroup) return;
    if (selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup)) {
      alert("Somente administradores podem enviar mensagens neste grupo."); return;
    }
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const message: Message = { id: Date.now(), sender: nickname, text: "Figurinha", time, isMe: true, sticker };
    setMessages((prev) => ({ ...prev, [selectedGroupId]: [...(prev[selectedGroupId] || []), message] }));
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, lastMessage: "Figurinha " + sticker, time, unread: 0, isJoined: true } : g));
    setShowStickerPicker(false);
  };

  const handleCreatePoll = () => {
    if (!selectedGroupId || !selectedGroup || !pollQuestion.trim()) return;
    if (selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup)) {
      alert("Somente administradores podem enviar mensagens neste grupo."); return;
    }
    const options = pollOptions.map((text) => text.trim()).filter(Boolean);
    if (options.length < 2) {
      alert("Adicione pelo menos duas opções para a enquete."); return;
    }
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const message: Message = {
      id: Date.now(), sender: nickname, text: "Enquete: " + pollQuestion.trim(), time, isMe: true,
      pollData: { question: pollQuestion.trim(), options: options.map((text) => ({ text, votes: [] })) },
    };
    setMessages((prev) => ({ ...prev, [selectedGroupId]: [...(prev[selectedGroupId] || []), message] }));
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, lastMessage: "📊 Enquete: " + pollQuestion.trim(), time, unread: 0, isJoined: true } : g));
    setPollQuestion(""); setPollOptions(["", ""]); setShowPollComposer(false); setShowAttachmentMenu(false);
  };

  const handleVotePoll = (messageId: number, optionIndex: number) => {
    if (!selectedGroupId) return;
    setMessages((prev) => ({
      ...prev,
      [selectedGroupId]: (prev[selectedGroupId] || []).map((msg) => {
        if (msg.id !== messageId || !msg.pollData) return msg;
        const options = msg.pollData.options.map((option, index) => ({
          ...option,
          votes: index === optionIndex
            ? (option.votes.includes(nickname) ? option.votes : [...option.votes, nickname])
            : option.votes.filter((voter) => voter !== nickname),
        }));
        return { ...msg, pollData: { ...msg.pollData, options } };
      }),
    }));
  };

  const handleJoinGroup = (groupId: number) => {
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, isJoined: true, unread: 0, memberNames: Array.from(new Set([...(g.memberNames || []), nickname])) } : g));
    setSelectedGroupId(groupId); setScreen("conversas"); setSearchQuery("");
  };

  const handleLeaveGroup = (groupId: number) => {
    if (!confirm("Tem certeza que deseja sair deste grupo?\nEle sairá da sua lista de Conversas.")) return;
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, isJoined: false } : g));
    setSelectedGroupId(null); setShowGroupInfo(false);
  };

  const handleClearConversation = (groupId: number) => {
    const group = groups.find((g) => g.id === groupId);
    if (!confirm(`Limpar todas as mensagens da conversa “${group?.name || "grupo"}” neste dispositivo?`)) return;
    setMessages((prev) => ({ ...prev, [groupId]: [] }));
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, lastMessage: "Nenhuma mensagem", unread: 0 } : g));
    setShowGroupInfo(false);
  };

  const toggleOnlyAdmins = () => {
    if (!selectedGroupId || !selectedGroup || !isCurrentUserAdmin(selectedGroup)) return;
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, onlyAdminsCanSend: !g.onlyAdminsCanSend } : g));
  };

  const toggleAdminApproval = () => {
    if (!selectedGroupId || !selectedGroup || !isCurrentUserAdmin(selectedGroup)) return;
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, requireAdminApproval: !g.requireAdminApproval } : g));
  };

  const toggleOnlyAdminsCanEdit = () => {
    if (!selectedGroupId || !selectedGroup || !isCurrentUserAdmin(selectedGroup)) return;
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, onlyAdminsCanEdit: !g.onlyAdminsCanEdit } : g));
  };

  const toggleFavorite = () => {
    if (!selectedGroupId) return;
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, isFavorite: !g.isFavorite } : g));
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newId = Date.now();
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const newGroup: Group = {
      id: newId, name: newGroupName.trim(), description: newGroupDesc.trim() || (createKind === "comunidade" ? "Comunidade criada no Diários FF" : "Grupo criado no Diários FF"),
      members: 1 + selectedNewMembers.length, lastMessage: createKind === "comunidade" ? "Comunidade criada" : "Grupo criado", time, unread: 0, onlyAdminsCanSend: newGroupOnlyAdmins, isJoined: true, createdByMe: true, adminNames: [nickname], requireAdminApproval: false, onlyAdminsCanEdit: true,
      photo: newGroupPhoto, memberNames: [nickname, ...selectedNewMembers], isCommunity: createKind === "comunidade", isPublic: newGroupPrivacy === "publico",
    };
    setGroups((prev) => [newGroup, ...prev]);
    setMessages((prev) => ({ ...prev, [newId]: [{ id: 1, sender: nickname, text: `${createKind === "comunidade" ? "Comunidade" : "Grupo"} "${newGroup.name}" criado por ${nickname}`, time, isMe: true, isAdmin: true }] }));
    setNewGroupName(""); setNewGroupDesc(""); setNewGroupPhoto(""); setSelectedNewMembers([]); setNewGroupOnlyAdmins(false); setNewGroupPrivacy("publico"); setShowCreateGroup(false);
    setSelectedGroupId(newId); setScreen("conversas");
  };

  const showChat = selectedGroupId !== null && screen === "conversas";

  if (!hydrated) return <div className="min-h-screen bg-wa-bg flex items-center justify-center"><div className="text-wa-secondary text-sm">Carregando...</div></div>;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-wa-green rounded-full flex items-center justify-center mx-auto mb-5"><MessageCircle size={44} className="text-white" /></div>
            <h1 className="text-3xl font-light text-wa-text">Diários FF</h1>
            <p className="text-wa-secondary mt-2 text-sm">Chat e comunidades de Free Fire</p>
          </div>
          <div className="bg-wa-panel rounded-xl p-6 space-y-4 shadow-sm">
            {isSupabaseConfigured ? <>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-wa-input p-1">
                <button onClick={() => { setAuthMode("signup"); setAuthNotice(""); }} className={`rounded-md py-2 text-sm ${authMode === "signup" ? "bg-wa-green text-white" : "text-wa-secondary"}`}>Criar conta</button>
                <button onClick={() => { setAuthMode("login"); setAuthNotice(""); }} className={`rounded-md py-2 text-sm ${authMode === "login" ? "bg-wa-green text-white" : "text-wa-secondary"}`}>Entrar</button>
              </div>
              {authMode === "signup" && <div><label className="text-xs text-wa-secondary mb-1.5 block">Nickname</label><input value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} placeholder="Como você aparecerá" maxLength={24} className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none" /></div>}
              <div><label className="text-xs text-wa-secondary mb-1.5 block">E-mail</label><input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none" /></div>
              <div><label className="text-xs text-wa-secondary mb-1.5 block">Senha</label><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" autoComplete={authMode === "signup" ? "new-password" : "current-password"} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none" /></div>
              {authNotice && <p role="status" className="text-sm text-wa-secondary break-words">{authNotice}</p>}
              <button onClick={handleLogin} disabled={authBusy || !authEmail.trim() || authPassword.length < 6} className="w-full bg-wa-green text-white font-medium py-3.5 rounded-lg disabled:opacity-40">{authBusy ? "Aguarde..." : authMode === "signup" ? "Criar conta" : "Entrar"}</button>
            </> : <>
              <p className="text-sm text-wa-secondary">O login por e-mail está preparado, mas falta conectar as credenciais do Supabase para ativar contas e IDs compartilhados entre aparelhos.</p>
              <label className="text-xs text-wa-secondary mb-1.5 block uppercase tracking-wider">Nickname temporário</label>
              <input type="text" value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Seu nome no jogo" maxLength={20} className="w-full bg-wa-input rounded-lg px-4 py-3.5 text-wa-text outline-none placeholder-wa-muted" autoFocus />
              <button onClick={handleLogin} disabled={tempNickname.trim().length < 2} className="w-full bg-wa-green text-white font-medium py-3.5 rounded-lg disabled:opacity-40">Entrar no modo de demonstração</button>
            </>}
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
                <div className="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-lg shrink-0 overflow-hidden">{group.photo ? <img src={group.photo} alt="" className="w-full h-full object-cover" /> : group.name.charAt(0)}</div>
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
            <div className="bg-wa-panel w-full sm:max-w-lg sm:rounded-xl overflow-hidden max-h-[92vh] flex flex-col">
              <div className="bg-wa-header px-4 py-3 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-base font-medium text-wa-text">{createKind === "comunidade" ? "Criar nova comunidade" : "Criar novo grupo"}</h2>
                  <p className="text-xs text-wa-secondary mt-0.5">Configure como no WhatsApp</p>
                </div>
                <button onClick={() => setShowCreateGroup(false)} className="text-wa-secondary"><X size={22} /></button>
              </div>
              <div className="p-4 space-y-5 overflow-y-auto">
                <div className="flex flex-col items-center">
                  <label className="relative w-24 h-24 rounded-full bg-wa-input border-2 border-dashed border-wa-border flex items-center justify-center overflow-hidden cursor-pointer">
                    {newGroupPhoto ? <img src={newGroupPhoto} alt="Foto do grupo" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-wa-secondary"><ImagePlus size={27} /><span className="text-[10px] mt-1">Adicionar foto</span></div>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 3 * 1024 * 1024) { alert("Escolha uma imagem de até 3 MB."); e.currentTarget.value = ""; return; }
                      const reader = new FileReader();
                      reader.onerror = () => alert("Não foi possível abrir essa imagem. Tente outra foto.");
                      reader.onload = () => {
                        if (typeof reader.result !== "string") return;
                        const image = new window.Image();
                        image.onerror = () => alert("Essa imagem não pôde ser carregada. Tente outra.");
                        image.onload = () => {
                          const canvas = document.createElement("canvas");
                          const maxSide = 480;
                          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
                          canvas.width = Math.max(1, Math.round(image.width * scale));
                          canvas.height = Math.max(1, Math.round(image.height * scale));
                          const context = canvas.getContext("2d");
                          if (!context) { alert("Não foi possível preparar a imagem."); return; }
                          context.drawImage(image, 0, 0, canvas.width, canvas.height);
                          const compressedPhoto = canvas.toDataURL("image/jpeg", 0.78);
                          if (compressedPhoto.length > 450000) { alert("Essa foto ficou muito grande. Escolha outra imagem."); return; }
                          setNewGroupPhoto(compressedPhoto);
                        };
                        image.src = reader.result;
                      };
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  <span className="text-xs text-wa-secondary mt-2">Foto de perfil · opcional</span>
                </div>
                <div>
                  <label className="text-xs text-wa-secondary mb-1.5 block">Nome {createKind === "comunidade" ? "da comunidade" : "do grupo"} *</label>
                  <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={createKind === "comunidade" ? "Ex: Comunidade Free Fire" : "Ex: Grupo de ranked"} maxLength={40}
                    className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none placeholder-wa-muted" autoFocus />
                  <p className="text-[11px] text-wa-muted text-right mt-1">{newGroupName.length}/40</p>
                </div>
                <div>
                  <label className="text-xs text-wa-secondary mb-1.5 block">Descrição</label>
                  <textarea value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Explique o objetivo e as regras..." rows={3} maxLength={200}
                    className="w-full bg-wa-input rounded-lg px-4 py-3 text-wa-text outline-none placeholder-wa-muted resize-none" />
                  <p className="text-[11px] text-wa-muted text-right mt-1">{newGroupDesc.length}/200</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div><p className="text-sm font-medium text-wa-text">Adicionar participantes</p><p className="text-xs text-wa-secondary">Selecione pessoas encontradas nas conversas</p></div>
                    <span className="text-xs text-wa-green font-medium">{selectedNewMembers.length} selecionados</span>
                  </div>
                  {availableMembers.length ? (
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-wa-border divide-y divide-wa-border">
                      {availableMembers.map((member) => (
                        <label key={member} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-wa-hover">
                          <div className="w-9 h-9 rounded-full bg-wa-green flex items-center justify-center text-white font-medium">{member.charAt(0).toUpperCase()}</div>
                          <span className="flex-1 text-sm text-wa-text">{member}</span>
                          <input type="checkbox" checked={selectedNewMembers.includes(member)} onChange={(e) => setSelectedNewMembers((prev) => e.target.checked ? [...prev, member] : prev.filter((name) => name !== member))} className="h-4 w-4 accent-[#00a884]" />
                        </label>
                      ))}
                    </div>
                  ) : <p className="text-xs text-wa-secondary bg-wa-input rounded-lg p-3">Ainda não há usuários conhecidos para adicionar. Eles aparecerão aqui quando participarem das conversas.</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-wa-text mb-2">Privacidade</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setNewGroupPrivacy("publico")} className={`rounded-lg border p-3 text-left ${newGroupPrivacy === "publico" ? "border-wa-green bg-wa-green/10" : "border-wa-border"}`}>
                      <Globe size={19} className="text-wa-green mb-1.5" /><span className="block text-sm text-wa-text">Público</span><span className="block text-[11px] text-wa-secondary mt-1">Pode ser encontrado</span>
                    </button>
                    <button type="button" onClick={() => setNewGroupPrivacy("privado")} className={`rounded-lg border p-3 text-left ${newGroupPrivacy === "privado" ? "border-wa-green bg-wa-green/10" : "border-wa-border"}`}>
                      <Lock size={19} className="text-wa-green mb-1.5" /><span className="block text-sm text-wa-text">Privado</span><span className="block text-[11px] text-wa-secondary mt-1">Somente convidados</span>
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-3 rounded-lg bg-wa-input p-3 cursor-pointer">
                  <input type="checkbox" checked={newGroupOnlyAdmins} onChange={(e) => setNewGroupOnlyAdmins(e.target.checked)} className="h-4 w-4 accent-[#00a884]" />
                  <div><span className="block text-sm text-wa-text">Somente administradores enviam mensagens</span><span className="block text-xs text-wa-secondary mt-0.5">Útil para avisos e anúncios</span></div>
                </label>
                <button onClick={handleCreateGroup} disabled={!newGroupName.trim()}
                  className="w-full bg-wa-green text-white font-medium py-3 rounded-lg disabled:opacity-40 flex items-center justify-center gap-2"><Check size={18} />{createKind === "comunidade" ? "Criar comunidade" : "Criar grupo"}</button>
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
          {favoriteGroups.length > 0 && (
            <div className="pb-2">
              <div className="px-4 pt-3 pb-2 flex items-center gap-2 text-wa-green">
                <Heart size={16} className="fill-wa-green" />
                <h2 className="text-xs font-semibold uppercase tracking-wide">Favoritos</h2>
              </div>
              {favoriteGroups.map((group) => (
                <button key={group.id} onClick={() => { setSelectedGroupId(group.id); setShowGroupInfo(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-wa-hover text-left ${selectedGroupId === group.id ? "bg-wa-hover" : ""}`}>
                  <div className="w-[52px] h-[52px] rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-xl shrink-0 overflow-hidden">
                    {group.photo ? <img src={group.photo} alt={group.name} className="w-full h-full object-cover" /> : group.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 py-1 border-b border-wa-border">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-wa-text truncate text-[16px] flex-1">{group.name}</h3>
                      <Heart size={14} className="text-wa-green fill-wa-green shrink-0" />
                    </div>
                    <p className="text-[14px] text-wa-secondary truncate mt-0.5">{group.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {myChats.length === 0 && favoriteGroups.length === 0 ? (
            <div className="p-10 text-center text-wa-muted">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma conversa ainda</p>
              <p className="text-xs mt-1">Entre em um diário nas Comunidades</p>
              <button onClick={() => { setScreen("comunidades"); setSearchQuery(""); }} className="mt-3 text-wa-green text-sm hover:underline">Ir para Comunidades FF</button>
            </div>
          ) : myChats.length > 0 && (
            <>
              {favoriteGroups.length > 0 && <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-wa-muted">Conversas</p>}
              {myChats.map((group) => (
                <button key={group.id} onClick={() => { setSelectedGroupId(group.id); setShowGroupInfo(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-wa-hover text-left ${selectedGroupId === group.id ? "bg-wa-hover" : ""}`}>
                  <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPhotoPreviewGroup(group); }} className="w-[52px] h-[52px] rounded-full bg-wa-green flex items-center justify-center text-white font-semibold text-xl shrink-0 overflow-hidden cursor-pointer">
                    {group.photo ? <img src={group.photo} alt={group.name} className="w-full h-full object-cover" /> : group.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 py-1 border-b border-wa-border">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-medium text-wa-text truncate text-[16px]">{group.name}</h3>
                      <span className={`text-[12px] shrink-0 ${group.unread > 0 ? "text-wa-green font-medium" : "text-wa-muted"}`}>{group.time}</span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5 gap-2">
                      <p className="text-[14px] text-wa-secondary truncate">{group.lastMessage}</p>
                      {group.unread > 0 && <span className="bg-wa-green text-white text-[12px] font-semibold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">{group.unread}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
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
                className="w-10 h-10 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold cursor-pointer shrink-0 overflow-hidden"
                onClick={() => setPhotoPreviewGroup(selectedGroup)}
                title="Ver foto do grupo"
              >
                {selectedGroup.photo ? <img src={selectedGroup.photo} alt={selectedGroup.name} className="w-full h-full object-cover" /> : selectedGroup.name.charAt(0)}
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
              {selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup) && (
                <div className="flex justify-center px-2">
                  <div className="bg-white/90 text-wa-secondary text-[12.5px] px-3 py-2 rounded-lg max-w-[90%] text-center shadow-sm">
                    🔒 Somente administradores podem enviar mensagens neste grupo.
                  </div>
                </div>
              )}
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`dff-message-bubble ${msg.sticker ? "dff-sticker-message bg-transparent shadow-none px-0 py-0 max-w-[85%]" : (msg.attachmentData || msg.audioData) ? `dff-media-message ${msg.isMe ? "dff-message-out bg-wa-bubble" : "dff-message-in bg-wa-incoming"} rounded-lg px-1.5 py-1 max-w-[85%] md:max-w-[65%] shadow-none` : `${msg.isMe ? "dff-message-out bg-wa-bubble rounded-tr-none" : "dff-message-in bg-wa-incoming rounded-tl-none"} rounded-lg px-2.5 py-1.5 max-w-[85%] md:max-w-[65%] shadow-sm`}`}>
                    {!msg.isMe && (
                      <p className="text-[13px] text-wa-green-dark font-medium mb-0.5">
                        {msg.sender}{msg.isAdmin && <span className="text-wa-muted font-normal"> · Admin</span>}
                      </p>
                    )}
                    {msg.sticker ? (
                      <div className="flex flex-col items-end gap-1" aria-label="Figurinha enviada">
                        <span className="text-[64px] sm:text-[72px] leading-none select-none" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.08))" }}>{msg.sticker}</span>
                        <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] text-wa-secondary">{msg.time}</span>
                      </div>
                    ) : msg.pollData ? (
                      <div className="min-w-[220px] space-y-2 py-1">
                        <p className="font-semibold text-[15px]">{msg.pollData.question}</p>
                        {msg.pollData.options.map((option, optionIndex) => {
                          const totalVotes = msg.pollData!.options.reduce((sum, item) => sum + item.votes.length, 0);
                          const voted = option.votes.includes(nickname);
                          return <button key={optionIndex} onClick={() => handleVotePoll(msg.id, optionIndex)} className="w-full text-left rounded-lg border border-wa-border px-3 py-2 hover:bg-wa-hover">
                            <span className="flex justify-between gap-2 text-sm"><span>{option.text}</span><span>{option.votes.length}</span></span>
                            <span className="block h-1.5 rounded-full bg-wa-input mt-2 overflow-hidden"><span className="block h-full bg-wa-green rounded-full" style={{ width: totalVotes ? (option.votes.length / totalVotes * 100) + "%" : "0%" }} /></span>
                            {voted && <span className="text-[11px] text-wa-green-dark">Seu voto</span>}
                          </button>;
                        })}
                        <p className="text-[11px] text-wa-secondary">{msg.pollData.options.reduce((sum, item) => sum + item.votes.length, 0)} votos · toque em uma opção para votar</p>
                      </div>
                    ) : msg.attachmentData && msg.attachmentType?.startsWith("image/") ? (
                      <div className="space-y-1"><img src={msg.attachmentData} alt={msg.attachmentName || "Imagem enviada"} className="block max-w-[min(260px,65vw)] max-h-[300px] rounded-lg object-contain" />{msg.attachmentName && msg.attachmentName !== "image" && <p className="text-[11px] text-wa-secondary">{msg.attachmentName}</p>}</div>
                    ) : msg.audioData ? (
                      <div className="flex w-[min(245px,62vw)] items-center gap-2 py-0.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wa-green text-white"><Mic size={18} /></span>
                        <div className="min-w-0 flex-1">
                          <audio controls preload="metadata" src={msg.audioData} className="dff-audio-player block h-9 w-full min-w-0" />
                          <p className="mt-0.5 truncate text-[10px] text-wa-secondary">{msg.attachmentName || "Mensagem de áudio"}</p>
                        </div>
                      </div>
                    ) : msg.attachmentData ? (
                      <a href={msg.attachmentData} download={msg.attachmentName || "arquivo"} className="flex max-w-[240px] items-center gap-2 break-all rounded-lg bg-black/5 px-2.5 py-2 text-[13px] text-wa-text underline"><FileText size={20} className="shrink-0" />{msg.attachmentName || "Baixar arquivo"}</a>
                    ) : (
                      <p className="text-[14.2px] text-wa-text leading-snug whitespace-pre-wrap break-words">{msg.text}</p>
                    )}
                    <p className={`text-[11px] text-right mt-0.5 ${msg.isMe ? "text-wa-secondary" : "text-wa-muted"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-[#f0f2f5] px-2 py-1.5 flex items-end gap-1.5 shrink-0">
              <div className="flex-1 flex items-center bg-white rounded-full px-2 py-1 min-h-[42px] shadow-sm">
                <button onClick={() => { setShowStickerPicker((open) => !open); setShowAttachmentMenu(false); }} aria-label="Abrir figurinhas" title="Figurinhas" className={`text-wa-secondary p-1.5 shrink-0 ${showStickerPicker ? "text-wa-green-dark" : ""}`}><Smile size={24} /></button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup) ? "Somente admins podem enviar" : "Mensagem"}
                  disabled={selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup)}
                  className="flex-1 bg-transparent px-2 py-2 text-[15px] outline-none text-wa-text placeholder-wa-muted disabled:opacity-50"
                />
                <button onClick={() => setShowAttachmentMenu((open) => !open)} aria-label="Anexar" title="Anexar" className="text-wa-secondary p-1.5 shrink-0"><Paperclip size={22} /></button>
                <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleAttachmentSelected} />
                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAttachmentSelected} />
                <input ref={filesInputRef} type="file" className="hidden" onChange={handleAttachmentSelected} />
              </div>
              {showStickerPicker && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" aria-label="Fechar figurinhas" onClick={() => setShowStickerPicker(false)} />
                  <div className="absolute bottom-[66px] left-2 z-50 w-[min(320px,calc(100vw-24px))] rounded-xl bg-wa-panel border border-wa-border shadow-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm text-wa-text">Figurinhas</p>
                      <button onClick={() => setShowStickerPicker(false)} aria-label="Fechar figurinhas" className="text-wa-secondary"><X size={18} /></button>
                    </div>
                    <p className="text-xs text-wa-secondary mb-3">Toque em uma figurinha para enviar ao grupo.</p>
                    <div className="grid grid-cols-4 gap-2">
                      {["😂","🤣","😍","🥰","😭","😎","🤔","😱","🥳","🤡","💀","❤️","🔥","👍","👎","👏","🙏","🤝","👑","💯","🎮","🏆","🐉","💸"].map((sticker) => (
                        <button key={sticker} onClick={() => handleSendSticker(sticker)} aria-label={`Enviar figurinha ${sticker}`} className="aspect-square rounded-lg flex items-center justify-center text-[32px] hover:bg-wa-hover active:scale-95 transition">
                          {sticker}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {showAttachmentMenu && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" aria-label="Fechar anexos" onClick={() => setShowAttachmentMenu(false)} />
                  <div className="absolute bottom-[66px] left-2 z-50 w-56 rounded-xl bg-wa-panel border border-wa-border shadow-xl p-2 space-y-1">
                    <button onClick={() => galleryInputRef.current?.click()} className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left text-sm text-wa-text hover:bg-wa-hover"><Image size={19} className="text-wa-green" />Galeria</button>
                    <button onClick={() => audioInputRef.current?.click()} className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left text-sm text-wa-text hover:bg-wa-hover"><FileAudio size={19} className="text-wa-green" />Áudio</button>
                    <button onClick={() => filesInputRef.current?.click()} className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left text-sm text-wa-text hover:bg-wa-hover"><FileText size={19} className="text-wa-green" />Arquivos</button>
                    <button onClick={() => { setShowPollComposer(true); setShowAttachmentMenu(false); }} className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left text-sm text-wa-text hover:bg-wa-hover"><ListChecks size={19} className="text-wa-green" />Enquete</button>
                  </div>
                </>
              )}
              {showPollComposer && (
                <div className="absolute inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
                  <div className="w-full max-w-md rounded-2xl bg-wa-panel border border-wa-border p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-wa-text">Criar enquete</h3><button onClick={() => setShowPollComposer(false)} aria-label="Fechar"><X size={21} /></button></div>
                    <label className="block text-sm text-wa-secondary">Pergunta
                      <input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} maxLength={180} placeholder="Faça uma pergunta ao grupo" className="mt-1 w-full rounded-lg bg-wa-input px-3 py-2.5 text-wa-text" />
                    </label>
                    <div className="space-y-2"><p className="text-sm text-wa-secondary">Opções de resposta</p>
                      {pollOptions.map((option, index) => <div key={index} className="flex gap-2"><input value={option} onChange={(e) => setPollOptions((prev) => prev.map((item, i) => i === index ? e.target.value : item))} maxLength={100} placeholder={`Opção ${index + 1}`} className="min-w-0 flex-1 rounded-lg bg-wa-input px-3 py-2.5 text-wa-text" />{pollOptions.length > 2 && <button onClick={() => setPollOptions((prev) => prev.filter((_, i) => i !== index))} aria-label="Remover opção"><X size={18} /></button>}</div>)}
                      {pollOptions.length < 6 && <button onClick={() => setPollOptions((prev) => [...prev, ""])} className="text-sm text-wa-green-dark">+ Adicionar opção</button>}
                    </div>
                    <button onClick={handleCreatePoll} className="w-full rounded-lg bg-wa-green text-white py-3 font-medium">Enviar enquete</button>
                  </div>
                </div>
              )}
              {inputText.trim() && !(selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup)) ? (
                <button onClick={handleSendMessage} className="bg-wa-green text-white p-2.5 rounded-full shrink-0 shadow-sm">
                  <Send size={20} />
                </button>
              ) : (
                <button onClick={handleAudioButton} disabled={!!(selectedGroup.onlyAdminsCanSend && !isCurrentUserAdmin(selectedGroup))} aria-label={isRecordingAudio ? "Parar gravação e enviar áudio" : "Gravar e enviar áudio"} title={isRecordingAudio ? "Parar e enviar áudio" : "Gravar áudio"} className={`bg-wa-green text-white p-2.5 rounded-full shrink-0 shadow-sm ${isRecordingAudio ? "animate-pulse ring-2 ring-red-400" : ""} disabled:opacity-40`}>
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
                onClearConversation={() => handleClearConversation(selectedGroup.id)}
                canManage={!!selectedGroup && isCurrentUserAdmin(selectedGroup)}
                onToggleOnlyAdmins={toggleOnlyAdmins}
                onToggleAdminApproval={toggleAdminApproval}
                onToggleOnlyAdminsCanEdit={toggleOnlyAdminsCanEdit}
                onToggleFavorite={toggleFavorite}
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

      {photoPreviewGroup && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-5" onClick={() => setPhotoPreviewGroup(null)}>
          <button aria-label="Fechar foto" onClick={() => setPhotoPreviewGroup(null)} className="absolute top-4 right-4 text-white p-2">
            <X size={28} />
          </button>
          <div className="flex flex-col items-center gap-4 max-w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-white text-lg font-medium">{photoPreviewGroup.name}</p>
            {photoPreviewGroup.photo ? (
              <img src={photoPreviewGroup.photo} alt={`Foto de ${photoPreviewGroup.name}`} className="max-w-[min(85vw,480px)] max-h-[70vh] object-contain rounded-md" />
            ) : (
              <div className="w-56 h-56 rounded-full bg-wa-green flex items-center justify-center text-white text-8xl font-semibold">
                {photoPreviewGroup.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      )}
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
                <input value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value.replace(/\\D/g, "").slice(0, 20))} inputMode="numeric" placeholder="Digite o ID numérico do usuário" className="bg-transparent outline-none text-sm w-full text-wa-text placeholder-wa-muted" autoFocus />
              </div>
              {isSupabaseConfigured ? (
                <div className="mt-3 max-h-64 overflow-y-auto">
                  {searchedProfiles.map((user) => (
                    <button key={user.id} onClick={() => openDirectChat(user)} className="w-full flex items-center gap-3 py-3 border-b border-wa-border last:border-0 text-left hover:bg-wa-hover rounded-lg px-2">
                      {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold">{user.nickname.charAt(0).toUpperCase()}</div>}
                      <div className="min-w-0 flex-1"><p className="text-sm font-medium text-wa-text">{user.nickname}</p><p className="text-xs text-wa-secondary">ID: {user.public_id}</p></div>
                      <MessageCircle size={18} className="text-wa-green" />
                    </button>
                  ))}
                  {userSearchQuery.trim() && searchedProfiles.length === 0 && <p className="text-sm text-wa-secondary text-center py-6">Nenhuma conta encontrada com esse ID.</p>}
                  {!userSearchQuery.trim() && <p className="text-xs text-wa-secondary text-center py-4">Peça o ID numérico do seu amigo e digite aqui para encontrá-lo.</p>}
                </div>
              ) : (
                <p className="text-xs text-wa-secondary text-center py-5">A busca por ID será ativada quando as credenciais do Supabase estiverem configuradas.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {directChatUser && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-3">
          <div className="w-full max-w-lg h-[min(650px,90vh)] bg-wa-panel rounded-2xl overflow-hidden flex flex-col border border-wa-border shadow-xl">
            <div className="flex items-center gap-3 px-4 py-3 bg-wa-header border-b border-wa-border">
              <button onClick={() => { setDirectChatUser(null); setDirectConversationId(null); setDirectMessages([]); setDirectChatError(""); }} aria-label="Voltar" className="text-wa-secondary"><ArrowLeft size={22} /></button>
              {directChatUser.avatar_url ? <img src={directChatUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-wa-green flex items-center justify-center text-white font-semibold">{directChatUser.nickname.charAt(0).toUpperCase()}</div>}
              <div className="min-w-0 flex-1"><p className="font-medium text-wa-text truncate">{directChatUser.nickname}</p><p className="text-xs text-wa-secondary">ID: {directChatUser.public_id}</p></div>
              <button onClick={() => setDirectChatUser(null)} aria-label="Fechar conversa" className="text-wa-secondary"><X size={21} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 chat-bg">
              {directMessages.map((msg) => {
                const mine = msg.sender_id !== directChatUser.id;
                return <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-xl px-3 py-2 shadow-sm ${mine ? "bg-[#d9fdd3] text-[#17211d]" : "bg-white text-[#17211d]"}`}><p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p><p className="text-[10px] text-right opacity-60 mt-1">{new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div></div>;
              })}
              {!directMessages.length && <p className="text-center text-sm text-wa-secondary py-8">Essa conversa está vazia. Mande a primeira mensagem!</p>}
              {directChatError && <p role="alert" className="text-sm text-red-500 text-center py-2">{directChatError}</p>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); void sendDirectMessage(); }} className="flex gap-2 p-3 border-t border-wa-border bg-wa-panel">
              <input value={directMessageInput} onChange={(e) => setDirectMessageInput(e.target.value)} placeholder="Mensagem privada" className="flex-1 min-w-0 rounded-full bg-wa-input px-4 py-3 text-sm text-wa-text outline-none" />
              <button type="submit" disabled={!directMessageInput.trim() || !directConversationId} aria-label="Enviar mensagem privada" className="bg-wa-green text-white rounded-full p-3 disabled:opacity-40"><Send size={19} /></button>
            </form>
          </div>
        </div>
      )}
      {showSettings && (
        <ProfileScreen
          nickname={nickname}
          publicUserId={publicUserId}
          onNicknameChange={(value) => {
            setNickname(value); saveToStorage("dff_nickname", value);
            if (supabase) supabase.auth.getUser().then(({ data }) => {
              if (data.user) void supabase!.from("profiles").update({ nickname: value }).eq("id", data.user.id);
            });
          }}
          profilePhoto={profilePhoto}
          hideProfilePhoto={hideProfilePhoto}
          onProfilePhotoChange={setProfilePhoto}
          onToggleHideProfilePhoto={() => setHideProfilePhoto((value) => !value)}
          contactNames={availableMembers}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
