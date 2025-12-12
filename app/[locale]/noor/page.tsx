'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Square } from 'lucide-react';
import React, { JSX, SVGProps, useLayoutEffect, useRef, useState, useCallback, useEffect, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import useSound from 'use-sound';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { noorPageStyles } from './noorPage.styles';
import { aiApi, AiMessage as AiMessageType } from '@/lib/api/ai';
import { useAuthStore } from '@/lib/store/auth-store';
import { ChatHistory, ChatHistoryRef } from './components/ChatHistory';
import { AiMessage } from './components/AiMessage';
import { VoiceButton } from './components/VoiceButton';
import { RealtimePanel } from './components/RealtimePanel';
import { useRealtimeSession } from '@/lib/realtime';

interface Message {
  sentByMe: boolean;
  message: string;
  type: 'text' | 'mention';
  mentionData?: {
    mention: string;
    title: string;
    icon: 'yt' | 'google' | 'notion';
  };
}

const NoorPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [isAt, setIsAt] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [play] = useSound('/audio/send2.wav', {
    volume: 0.2,
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<ChatHistoryRef>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-resize du textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ActiveIndex, setActiveIndex] = useState(0);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [tenantId, setTenantId] = useState<string | undefined>();
  const [aiHistory, setAiHistory] = useState<AiMessageType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tChat = useTranslations('noor.chat');

  // Auth state
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Realtime voice session
  const {
    state: realtimeState,
    messages: realtimeMessages,
    connect: connectRealtime,
    disconnect: disconnectRealtime,
    toggle: toggleRealtime,
    interrupt: interruptRealtime,
  } = useRealtimeSession({
    onMessage: (message) => {
      // Ajouter les messages realtime à l'historique du chat
      setMessages(prev => [
        ...prev,
        {
          sentByMe: message.role === 'user',
          message: message.content,
          type: 'text' as const,
        },
      ]);
    },
    onError: (error) => {
      console.error('[Noor] Realtime error:', error);
      setError(error.message);
    },
  });

  const isRealtimeEngaged = realtimeState.status !== 'disconnected';

  // Fermer le panneau realtime avec Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRealtimeEngaged) {
        disconnectRealtime();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRealtimeEngaged, disconnectRealtime]);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Callback pour charger une conversation depuis l'historique
  const handleSelectConversation = useCallback((convId: string, convMessages: AiMessageType[]) => {
    setConversationId(convId);
    setAiHistory(convMessages);

    // Convertir les messages AI en messages UI
    const uiMessages: Message[] = convMessages.map((msg) => ({
      sentByMe: msg.role === 'user',
      message: msg.content,
      type: 'text' as const,
    }));
    setMessages(uiMessages);
  }, []);

  // Callback pour créer une nouvelle conversation
  const handleNewConversation = useCallback(() => {
    setConversationId(undefined);
    setTenantId(undefined);
    setAiHistory([]);
    setMessages([]);
    setError(null);
  }, []);

  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      // Scroller uniquement dans le conteneur de messages, pas la page entière
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleMessageSubmit = useCallback(async () => {
    setActiveIndex((x) => x + 1);
    if (!inputValue.trim()) return;
    play();
    if (isAt.length > 0) {
      setActiveIndex((x) => x + 1);
    }

    const userInput = inputValue.trim();
    setError(null);

    // Parse the input to separate text and mentions
    const mentionRegex = /@(notion|yt|google)/g;
    const newMessages: Message[] = [];

    // First, add the complete text message with mentions
    newMessages.push({
      sentByMe: true,
      message: userInput,
      type: 'text',
    });

    // Then add separate mention cards for each mention
    const mentions = Array.from(
      userInput.matchAll(mentionRegex),
      (match) => match[1]
    );
    mentions.forEach((mention) => {
      const mentionData = {
        mention,
        title:
          mention === 'yt'
            ? 'Youtube Analyzer'
            : mention === 'google'
              ? 'Google Search'
              : mention === 'notion'
                ? 'Notion'
                : '',
        icon: mention as 'yt' | 'google' | 'notion',
      };
      newMessages.push({
        sentByMe: true,
        message: `@${mention}`,
        type: 'mention',
        mentionData,
      });
    });

    setMessages((prev) => [...prev, ...newMessages]);
    setInputValue('');
    setIsAt([]);

    // Activer l'état "thinking" pour afficher le border gradient
    setIsThinking(true);

    // Créer un AbortController pour permettre l'annulation
    abortControllerRef.current = new AbortController();

    try {
      // Appel réel à l'API IA via le backend
      const result = await aiApi.sendMessage(userInput, conversationId, aiHistory, tenantId, abortControllerRef.current.signal);

      // Mettre à jour l'historique pour le contexte
      setAiHistory((prev) => [
        ...prev,
        { role: 'user', content: userInput },
        { role: 'assistant', content: result.response },
      ]);

      // Sauvegarder l'ID de conversation et le tenantId pour les messages suivants
      const isNewConversation = !conversationId;
      if (isNewConversation) {
        setConversationId(result.conversationId);
      }
      if (!tenantId && result.tenantId) {
        setTenantId(result.tenantId);
      }

      // Rafraîchir l'historique des conversations si authentifié
      if (isAuthenticated) {
        // Petit délai pour laisser le temps au backend de sauvegarder
        setTimeout(() => {
          chatHistoryRef.current?.refresh();
        }, 500);
      }

      // Ajouter la réponse de l'IA
      setMessages((prev) => [
        ...prev,
        {
          sentByMe: false,
          message: result.response,
          type: 'text',
        },
      ]);
    } catch (err: any) {
      // Si c'est une annulation, ne pas afficher d'erreur
      if (err?.name === 'AbortError' || err?.name === 'CanceledError') {
        console.log('[Noor] Request cancelled by user');
        return;
      }

      console.error('[Noor] AI error:', err);

      // Message d'erreur convivial
      const errorMessage = err?.response?.status === 401
        ? tChat('errors.unauthorized')
        : err?.response?.status === 502
          ? tChat('errors.unavailable')
          : tChat('errors.generic');

      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          sentByMe: false,
          message: errorMessage,
          type: 'text',
        },
      ]);
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, isAt.length, play, conversationId, aiHistory]);

  // Annuler la requête en cours
  const handleCancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsThinking(false);
    }
  }, []);

  return (
    <main className={noorPageStyles.container}>

      <AppleBorderGradient preview={isThinking} intensity="3xl" />

      <div className={noorPageStyles.layout}>
        <ChatHistory
          ref={chatHistoryRef}
          isAuthenticated={isAuthenticated}
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />

        <div className={noorPageStyles.chatWrapper}>

          {/* Border gradient qui s'active quand l'IA réfléchit */}

          {/* Contenu du chat avec z-index pour être au-dessus du border gradient */}
          <div className={noorPageStyles.chatContent}>
            {/* Gradient overlay at top */}
            <div className={noorPageStyles.gradientOverlay} />

            {/* Messages area */}
            <div
              ref={messagesContainerRef}
              className={noorPageStyles.messagesContainer}
              data-lenis-prevent
              data-lenis-prevent-wheel
              data-lenis-prevent-touch
            >
              {/* Intro Noor - affiché quand pas de messages */}
              <AnimatePresence>
                {messages.length === 0 && !isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={noorPageStyles.introContainer}
                  >
                    <div className={noorPageStyles.introContent}>
                      <motion.div
                        className={noorPageStyles.introAvatar}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                      >
                        <Image
                          src="/images/Noor_x4.png"
                          alt="Noor"
                          width={80}
                          height={80}
                          className={noorPageStyles.introAvatarImage}
                          priority
                        />
                      </motion.div>
                      
                      <motion.h1
                        className={noorPageStyles.introTitle}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        Noor
                      </motion.h1>
                      
                      <motion.p
                        className={noorPageStyles.introSubtitle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                      >
                        {tChat('introSubtitle')}
                      </motion.p>
                      
                      <motion.span
                        className={noorPageStyles.introHint}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        {tChat('introHint')}
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((message, idx) =>
                message.type === 'text' ? (
                  <motion.div
                    layoutId={message.sentByMe ? `text-${idx}` : `system-${idx}`}
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      noorPageStyles.messageText,
                      message.sentByMe
                        ? noorPageStyles.messageTextSent
                        : noorPageStyles.messageTextReceived
                    )}
                  >
                    {message.sentByMe ? (
                      // Message utilisateur - texte simple
                      message.message
                    ) : (
                      // Message IA - avec parsing Markdown et cartes de propriétés
                      <AiMessage content={message.message} />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    layoutId={`m-${idx}`}
                    key={idx}
                    className={cn(
                      noorPageStyles.messageMention,
                      message.sentByMe
                        ? noorPageStyles.messageTextSent
                        : noorPageStyles.messageTextReceived
                    )}
                  >
                    <div className={noorPageStyles.mentionIconBox}>
                      {message.mentionData?.icon === 'yt' ? (
                        <YoutubeIcon className={noorPageStyles.icon} />
                      ) : message.mentionData?.icon === 'google' ? (
                        <GoogleIcon className={noorPageStyles.icon} />
                      ) : message.mentionData?.icon === 'notion' ? (
                        <NotionIcon className={noorPageStyles.icon} />
                      ) : null}
                    </div>
                    {message.mentionData?.title}
                  </motion.div>
                )
              )}
              {isThinking && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{ delay: 0.25 }}
                  className={cn(
                    noorPageStyles.messageText,
                    noorPageStyles.messageTextReceived,
                    noorPageStyles.thinkingMessage
                  )}
                >
                  <TextShimmer>{tChat('thinking')}</TextShimmer>
                </motion.div>
              )}
              <div ref={chatEndRef} className={noorPageStyles.scrollSpacer} />
            </div>

            {/* Input area */}
            <motion.div
              initial={false}
              animate={{
                borderRadius: isAt.length > 0 ? '16px' : '20px',
              }}
              className={cn(
                noorPageStyles.inputContainer,
                isAt.length > 0 && noorPageStyles.inputContainerExpanded
              )}
            >
              <motion.div layout className={noorPageStyles.inputRow}>
                <textarea
                  ref={textareaRef}
                  autoFocus
                  rows={1}
                  placeholder={tChat('inputPlaceholder')}
                  value={inputValue}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleMessageSubmit();
                      // Reset hauteur après envoi
                      if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                      }
                    }
                  }}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    const value = e.target.value;
                    const mentionRegex = /@(notion|yt|google)/g;
                    const mentions = Array.from(
                      value.matchAll(mentionRegex),
                      (match) => match[1]
                    );
                    setIsAt(mentions);
                    setInputValue(value);
                    adjustTextareaHeight();
                  }}
                  className={noorPageStyles.input}
                />
              </motion.div>

              {/* Voice button */}
              <div className={noorPageStyles.voiceButtonContainer}>
                <VoiceButton
                  status={realtimeState.status}
                  onClick={toggleRealtime}
                />
              </div>

              {/* Send / Cancel button */}
              <motion.button
                onClick={isThinking ? handleCancelRequest : handleMessageSubmit}
                className={cn(
                  noorPageStyles.sendButton,
                  isThinking && noorPageStyles.cancelButton
                )}

                aria-label={isThinking ? 'Annuler' : 'Envoyer'}
              >
                {isThinking ? (
                  <Square className={noorPageStyles.stopIcon} />
                ) : (
                  <ArrowUp className={noorPageStyles.arrowIcon} />
                )}
              </motion.button>

              {/* Active mentions display */}
              {isAt.length > 0 && (
                <div className={noorPageStyles.activeMentionsArea}>
                  <AnimatePresence mode="popLayout">
                    {isAt.map((mention, index) => (
                      <motion.div
                        layoutId={`m-${ActiveIndex + index + 1}`}
                        key={`${ActiveIndex} ${index}`}
                      >
                        <motion.div
                          initial={{
                            rotate: '0deg',
                            scale: 0.7,
                          }}
                          animate={{
                            rotate: index % 2 === 0 ? '3deg' : '-6deg',
                            scale: 1,
                          }}
                          exit={{
                            rotate: '0deg',
                            scale: 0.7,
                            opacity: 0,
                          }}
                          transition={{
                            type: 'spring',
                            bounce: 0.5,
                          }}
                          className={noorPageStyles.activeMentionChip}
                        >
                          <div className={noorPageStyles.activeMentionIconBox}>
                            {mention === 'yt' ? (
                              <YoutubeIcon className={noorPageStyles.icon} />
                            ) : mention === 'google' ? (
                              <GoogleIcon className={noorPageStyles.icon} />
                            ) : mention === 'notion' ? (
                              <NotionIcon className={noorPageStyles.icon} />
                            ) : null}
                          </div>
                          {mention === 'yt'
                            ? 'Youtube Analyzer'
                            : mention === 'google'
                              ? 'Google Search'
                              : mention === 'notion'
                                ? 'Notion'
                                : ''}
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Gradient animation on submit */}
              <motion.div
                key={`isSubmit${ActiveIndex}`}
                initial={{
                  y: '250%',
                  opacity: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                }}
                animate={{
                  y: '-200%',
                  opacity: 0.2,
                }}
                className={noorPageStyles.gradientAnimation}
              >
                <GradientBar />
                <GradientBar translated />
                <GradientBar />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Realtime Voice Panel */}
      <RealtimePanel
        state={realtimeState}
        onDisconnect={disconnectRealtime}
        onInterrupt={interruptRealtime}
        isVisible={isRealtimeEngaged}
      />
    </main>
  );
};

// Icons components
const YoutubeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 256 180" {...props} preserveAspectRatio="xMidYMid">
    <path
      d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z"
      fill="red"
    />
    <path fill="#FFF" d="m102.421 128.06 66.328-38.418-66.328-38.418z" />
  </svg>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 256 262" preserveAspectRatio="xMidYMid">
    <path
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      fill="#4285F4"
    />
    <path
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      fill="#34A853"
    />
    <path
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      fill="#FBBC05"
    />
    <path
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      fill="#EB4335"
    />
  </svg>
);

const NotionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} preserveAspectRatio="xMidYMid" viewBox="0 0 256 268">
    <path
      fill="#FFF"
      d="M16.092 11.538 164.09.608c18.179-1.56 22.85-.508 34.28 7.801l47.243 33.282C253.406 47.414 256 48.975 256 55.207v182.527c0 11.439-4.155 18.205-18.696 19.24L65.44 267.378c-10.913.517-16.11-1.043-21.825-8.327L8.826 213.814C2.586 205.487 0 199.254 0 191.97V29.726c0-9.352 4.155-17.153 16.092-18.188Z"
    />
    <path d="M164.09.608 16.092 11.538C4.155 12.573 0 20.374 0 29.726v162.245c0 7.284 2.585 13.516 8.826 21.843l34.789 45.237c5.715 7.284 10.912 8.844 21.825 8.327l171.864-10.404c14.532-1.035 18.696-7.801 18.696-19.24V55.207c0-5.911-2.336-7.614-9.21-12.66l-1.185-.856L198.37 8.409C186.94.1 182.27-.952 164.09.608ZM69.327 52.22c-14.033.945-17.216 1.159-25.186-5.323L23.876 30.778c-2.06-2.086-1.026-4.69 4.163-5.207l142.274-10.395c11.947-1.043 18.17 3.12 22.842 6.758l24.401 17.68c1.043.525 3.638 3.637.517 3.637L71.146 52.095l-1.819.125Zm-16.36 183.954V81.222c0-6.767 2.077-9.887 8.3-10.413L230.02 60.93c5.724-.517 8.31 3.12 8.31 9.879v153.917c0 6.767-1.044 12.49-10.387 13.008l-161.487 9.361c-9.343.517-13.489-2.594-13.489-10.921ZM212.377 89.53c1.034 4.681 0 9.362-4.681 9.897l-7.783 1.542v114.404c-6.758 3.637-12.981 5.715-18.18 5.715-8.308 0-10.386-2.604-16.609-10.396l-50.898-80.079v77.476l16.1 3.646s0 9.362-12.989 9.362l-35.814 2.077c-1.043-2.086 0-7.284 3.63-8.318l9.351-2.595V109.823l-12.98-1.052c-1.044-4.68 1.55-11.439 8.826-11.965l38.426-2.585 52.958 81.113v-71.76l-13.498-1.552c-1.043-5.733 3.111-9.896 8.3-10.404l35.84-2.087Z" />
  </svg>
);

const GradientBar = ({ translated = false }: { translated?: boolean }) => (
  <div className={translated ? noorPageStyles.gradientBarTranslated : noorPageStyles.gradientBar}>
    <div className={noorPageStyles.gradientSegmentPink} />
    <div className={noorPageStyles.gradientSegmentOrange} />
    <div className={noorPageStyles.gradientSegmentYellow} />
    <div className={noorPageStyles.gradientSegmentBlue} />
  </div>
);

// Composant TextShimmer pour l'effet de texte animé
type TextShimmerProps = {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  duration?: number;
};

const TextShimmerComponent = ({
  children,
  as: Component = 'p',
  className,
  duration = 2,
}: TextShimmerProps) => {
  const MotionTag =
    Component === 'span'
      ? motion.span
      : Component === 'div'
        ? motion.div
        : motion.p;

  return (
    <MotionTag
      className={cn(noorPageStyles.textShimmerBase, className)}
      // On fait défiler le background de très à gauche à très à droite
      initial={{ backgroundPosition: '-150% 0' }}
      animate={{ backgroundPosition: '150% 0' }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        // Gradient avec rayon lumineux au centre
        backgroundImage:
          'linear-gradient(90deg, rgba(148,163,184,0.15), rgba(248,250,252,1), rgba(148,163,184,0.15))',
        backgroundSize: '200% 100%',
      }}
    >
      {children}
    </MotionTag>
  );
};

const TextShimmer = React.memo(TextShimmerComponent);

// Composant AppleBorderGradient pour l'effet de border animé
const AppleBorderGradient = ({
  preview,
  intensity = 'xl',
}: {
  preview: boolean;
  intensity?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}) => {
  const blurStyles = {
    xs: noorPageStyles.borderGradientBlurXs,
    sm: noorPageStyles.borderGradientBlurSm,
    md: noorPageStyles.borderGradientBlurMd,
    lg: noorPageStyles.borderGradientBlurLg,
    xl: noorPageStyles.borderGradientBlurXl,
    '2xl': noorPageStyles.borderGradientBlur2xl,
    '3xl': noorPageStyles.borderGradientBlur3xl,
  };

  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={{
            opacity: 1,
            background: [
              'linear-gradient(0deg, rgb(59, 130, 246), rgb(168, 85, 247), rgb(239, 68, 68), rgb(249, 115, 22))',
              'linear-gradient(360deg, rgb(59, 130, 246), rgb(168, 85, 247), rgb(239, 68, 68), rgb(249, 115, 22))',
            ],
            scale: [1, 1.002, 1],
          }}
          transition={{
            opacity: {
              duration: 0.5,
              ease: 'easeInOut',
            },
            background: {
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className={cn(
            noorPageStyles.borderGradientContainer,
            blurStyles[intensity]
          )}
        >
          <div className={noorPageStyles.borderGradientInner} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoorPage;