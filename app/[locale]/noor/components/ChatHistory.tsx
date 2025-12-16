'use client';

import { motion } from 'framer-motion';
import {
    Plus,
    Trash2,
    Clock,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Search,
} from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { aiApi, ConversationSummary, AiMessage } from '@/lib/api/ai';
import { chatHistoryStyles } from './chatHistory.styles';

interface ChatHistoryProps {
    isAuthenticated: boolean;
    currentConversationId?: string;
    onSelectConversation: (conversationId: string, messages: AiMessage[]) => void;
    onNewConversation: () => void;
}

export interface ChatHistoryRef {
    refresh: () => Promise<void>;
}

export const ChatHistory = forwardRef<ChatHistoryRef, ChatHistoryProps>(({
    isAuthenticated,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
}, ref) => {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState<boolean>(
        typeof window === 'undefined' ? true : window.innerWidth >= 1024,
    );
    const [searchTerm, setSearchTerm] = useState('');
    const t = useTranslations('noor.sidebar');

    // Charger l'historique des conversations
    const loadConversations = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const data = await aiApi.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('[ChatHistory] Error loading conversations:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Exposer la méthode refresh via ref pour permettre un rafraîchissement externe
    useImperativeHandle(ref, () => ({
        refresh: async () => {
            // Forcer le refresh depuis le ref (utilisé après création de conversation)
            setIsLoading(true);
            try {
                aiApi.invalidateConversationsCache();
                const data = await aiApi.getConversations(true);
                setConversations(data);
            } catch (error) {
                console.error('[ChatHistory] Error refreshing conversations:', error);
            } finally {
                setIsLoading(false);
            }
        },
    }), []);

    useEffect(() => {
        if (isAuthenticated) {
            loadConversations();
        }
    }, [isAuthenticated, loadConversations]);

    // Rafraîchir l'historique quand une nouvelle conversation est créée
    useEffect(() => {
        if (isAuthenticated && currentConversationId) {
            // Le debounce dans aiApi gère les appels multiples
            loadConversations();
        }
    }, [isAuthenticated, currentConversationId, loadConversations]);

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            if (!desktop) {
                setIsCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCollapse = useCallback(
        (event?: React.MouseEvent) => {
            event?.preventDefault();
            event?.stopPropagation();
            setIsCollapsed(true);
        },
        [],
    );

    // Gérer la sélection d'une conversation
    const handleSelectConversation = async (conversationId: string) => {
        const conversation = await aiApi.getConversation(conversationId);
        if (conversation) {
            onSelectConversation(conversationId, conversation.messages);
            if (isCollapsed) {
                setIsCollapsed(false);
            }
        }
    };

    // Supprimer une conversation
    const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
        e.stopPropagation();
        setDeletingId(conversationId);

        const success = await aiApi.deleteConversation(conversationId);
        if (success) {
            setConversations(prev => prev.filter(c => c.id !== conversationId));

            // Si on supprime la conversation active, créer une nouvelle conversation
            if (currentConversationId === conversationId) {
                onNewConversation();
            }
        }
        setDeletingId(null);
    };

    // Formater l'index avec padding
    const formatIndex = (index: number) => {
        return String(index + 1).padStart(3, '0');
    };

    const filteredConversations = useMemo(() => {
        if (!searchTerm.trim()) {
            return conversations;
        }
        const needle = searchTerm.toLowerCase();
        return conversations.filter((conversation) => {
            return (
                conversation.title?.toLowerCase().includes(needle) ||
                conversation.lastMessage?.toLowerCase().includes(needle)
            );
        });
    }, [conversations, searchTerm]);

    // Ne pas afficher si non authentifié
    if (!isAuthenticated) {
        return null;
    }

    const showDetails = !isCollapsed || !isDesktop;

    return (
        <motion.aside
            className={cn(
                chatHistoryStyles.sidebarShell,
                isCollapsed && isDesktop && chatHistoryStyles.sidebarCollapsed,
            )}
            style={{ width: isDesktop ? undefined : '100%' }}
            animate={{ width: isDesktop ? (isCollapsed ? 64 : 280) : '100%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
            {isDesktop && !isCollapsed && (
                <div className={chatHistoryStyles.header}>
                    <div className={chatHistoryStyles.headerTitle}>
                        <MessageSquare className={chatHistoryStyles.headerIcon} />
                        <span>{t('title')}</span>
                    </div>
                    <button
                        type="button"
                        className={chatHistoryStyles.collapseButton}
                        aria-label={t('collapsed.collapseSidebar')}
                        onClick={handleCollapse}
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>
            )}

            {/* Actions */}
            {showDetails && (
                <div className={chatHistoryStyles.actionsBar}>
                    <button
                        type="button"
                        onClick={() => {
                            onNewConversation();
                        }}
                        className={chatHistoryStyles.actionButton}
                    >
                        <Plus size={16} />
                        <span>{t('actions.new')}</span>
                    </button>

                    <div className={chatHistoryStyles.searchBox}>
                        <Search size={14} className={chatHistoryStyles.searchIcon} />
                        <input
                            type="text"
                            placeholder={t('actions.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Liste des conversations */}
            {showDetails && (
                <div className={chatHistoryStyles.conversationList}>
                    {isLoading ? (
                        <div className={chatHistoryStyles.loadingState}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Clock size={20} />
                            </motion.div>
                            <span>{t('state.loading')}</span>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className={chatHistoryStyles.emptyState}>
                            <MessageSquare size={28} strokeWidth={1.5} />
                            <p>{t('state.emptyTitle')}</p>
                            <span>{t('state.emptySubtitle')}</span>
                        </div>
                    ) : (
                        filteredConversations.map((conversation, index) => (
                            <motion.div
                                key={conversation.id}
                                onClick={() => handleSelectConversation(conversation.id)}
                                className={cn(
                                    chatHistoryStyles.conversationItem,
                                    currentConversationId === conversation.id && chatHistoryStyles.conversationItemActive,
                                )}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <span className={chatHistoryStyles.conversationIndex}>
                                    {formatIndex(index)}
                                </span>
                                <div className={chatHistoryStyles.conversationContent}>
                                    <div className={chatHistoryStyles.conversationTitle}>
                                        {conversation.title || 'Sans titre'}
                                    </div>
                                    <div className={chatHistoryStyles.conversationDivider} />
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                    className={chatHistoryStyles.deleteButton}
                                    disabled={deletingId === conversation.id}
                                >
                                    {deletingId === conversation.id ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Clock size={12} />
                                        </motion.div>
                                    ) : (
                                        <Trash2 size={12} />
                                    )}
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Barre verticale d'icônes lorsque réduit */}
            {isCollapsed && isDesktop && (
                <div className={chatHistoryStyles.collapsedIcons}>
                    <button
                        type="button"
                        className={chatHistoryStyles.iconCircle}
                        onClick={() => setIsCollapsed(false)}
                        aria-label={t('collapsed.openSidebar')}
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        type="button"
                        className={chatHistoryStyles.iconCircle}
                        onClick={() => {
                            setIsCollapsed(false);
                            onNewConversation();
                        }}
                        aria-label={t('collapsed.newChat')}
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        type="button"
                        className={chatHistoryStyles.iconCircle}
                        onClick={() => setIsCollapsed(false)}
                        aria-label={t('collapsed.search')}
                    >
                        <Search size={14} />
                    </button>
                </div>
            )}

            {showDetails && (
                <div className={chatHistoryStyles.footer}>
                    <span>{t('footer')}</span>
                </div>
            )}
        </motion.aside>
    );
});

ChatHistory.displayName = 'ChatHistory';

export default ChatHistory;
