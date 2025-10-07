import { useEffect, useState, useRef, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
    Users,
    Image,
    Clapperboard,
    AudioLines,
    File,
    Plus,
    Trash2,
    Pencil,
    CircleMinus,
    CirclePlus,
    CircleX,
} from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import profilePicColors from "../lib/profilePicColors.js";
import LabelManager from "../lib/LabelManager";
import ChatSearchBox from "./ChatSearchBox";

// --- Reusable Components ---

const RenameLabelInput = ({ value, onRename }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus();
    }, [editing]);

    const handleBlur = () => {
        setEditing(false);
        if (inputValue.trim() && inputValue !== value) {
            onRename(inputValue.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            inputRef.current.blur();
        }
    };

    return (
        <div className="flex items-center gap-2">
            {editing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-zinc-800 text-white rounded px-2 py-1 border border-zinc-700 w-56"
                    aria-label="Rename label"
                />
            ) : (
                <>
                    <span className="font-semibold text-lg">{value}</span>
                    <button
                        onClick={() => setEditing(true)}
                        className="p-1 rounded hover:bg-zinc-700"
                        aria-label="Edit label name"
                    >
                        <Pencil className="size-4" />
                    </button>
                </>
            )}
        </div>
    );
};

const ContactList = ({
    contacts,
    allConversations,
    onAddContact,
    onRemoveContact,
    searchTerm,
    setSearchTerm,
}) => {
    const filtered = useMemo(
        () =>
            allConversations.filter((conv) =>
                (conv.name || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            ),
        [allConversations, searchTerm]
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Search contacts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 text-zinc-200 rounded px-2 py-1 w-full mb-2 border border-zinc-700"
                aria-label="Search contacts"
            />
            <div className="max-h-40 overflow-y-auto divide-y divide-zinc-800 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {filtered.map((conv) => {
                    const isSelected = contacts.includes(conv.id);
                    return (
                        <div
                            key={conv.id}
                            className="flex items-center justify-between py-2 px-1"
                        >
                            <span className="truncate">
                                {conv.name || "Unknown"}
                            </span>
                            {isSelected ? (
                                <button
                                    onClick={() => onRemoveContact(conv.id)}
                                    className="text-red-400 px-2 py-1 rounded hover:bg-zinc-800"
                                    aria-label={`Remove ${conv.name}`}
                                >
                                    <CircleMinus />
                                </button>
                            ) : (
                                <button
                                    onClick={() => onAddContact(conv.id)}
                                    className="text-green-400 px-2 py-1 rounded hover:bg-zinc-800"
                                    aria-label={`Add ${conv.name}`}
                                >
                                    <CirclePlus />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DeleteConfirmDialog = ({ open, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-zinc-900 rounded-lg p-6 w-80 flex flex-col items-center">
                <p className="text-lg mb-4 text-zinc-200">Delete this label?</p>
                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
                        aria-label="Cancel"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                        aria-label="Delete"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManageLabelModal = ({
    open,
    label,
    allConversations,
    onClose,
    onRename,
    onAddContact,
    onRemoveContact,
    onDeleteLabel,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
        >
            <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 w-[500px] animate-fade-in flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                    <RenameLabelInput value={label.name} onRename={onRename} />
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 rounded hover:bg-zinc-800"
                        aria-label="Delete label"
                    >
                        <Trash2 className="size-5 text-red-500" />
                    </button>
                </div>
                <div className="border-b border-zinc-800 mb-2" />
                <div>
                    <p className="text-sm text-zinc-400 mb-2">
                        Contacts in label:
                    </p>
                    <div className="max-h-32 overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {label.contacts.length === 0 ? (
                            <p className="text-zinc-500 text-xs">
                                No contacts yet.
                            </p>
                        ) : (
                            label.contacts.map((cid) => {
                                const conv = allConversations.find(
                                    (c) => c.id === cid
                                );
                                return (
                                    <div
                                        key={cid}
                                        className="flex items-center justify-between py-1 px-1"
                                    >
                                        <span className="truncate">
                                            {conv?.name || "Unknown"}
                                        </span>
                                        <button
                                            onClick={() => onRemoveContact(cid)}
                                            className="text-red-400 px-2 py-1 rounded hover:bg-zinc-800"
                                            aria-label={`Remove ${conv?.name}`}
                                        >
                                            <CircleX />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="border-b border-zinc-800 mb-2" />
                <ContactList
                    contacts={label.contacts}
                    allConversations={allConversations}
                    onAddContact={onAddContact}
                    onRemoveContact={onRemoveContact}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
                        aria-label="Close"
                    >
                        Close
                    </button>
                </div>
                <DeleteConfirmDialog
                    open={showDeleteDialog}
                    onConfirm={() => {
                        onDeleteLabel(label.id);
                        setShowDeleteDialog(false);
                        onClose();
                    }}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            </div>
        </div>
    );
};

// --- Main Sidebar Component ---

const labelManager = new LabelManager();
const DEFAULT_LABELS = [{ name: "All" }, { name: "Critical" }];

const syncLabelsToConversations = (labels = [], conversations = []) => {
    const labelMap = {};
    labels.forEach((label) => {
        if (
            label.contacts &&
            Array.isArray(label.contacts) &&
            label.contacts.length
        ) {
            label.contacts.forEach((cid) => {
                if (!labelMap[cid]) labelMap[cid] = [];
                if (!labelMap[cid].includes(label.name)) {
                    labelMap[cid].push(label.name);
                }
            });
        }
    });
    return conversations.map((conv) => ({
        ...conv,
        labels: labelMap[conv.id] || [],
    }));
};

const renderIcon = (mimeType) => {
    if (!mimeType) return null;
    if (mimeType.startsWith("image/")) {
        return <Image className="size-4 inline mr-2 align-text-center" />;
    }
    if (mimeType.startsWith("video/")) {
        return (
            <Clapperboard className="size-4 inline mr-2 align-text-center" />
        );
    }
    if (mimeType.startsWith("audio/")) {
        return <AudioLines className="size-4 inline mr-2 align-text-center" />;
    }
    return <File className="size-4 inline mr-2 align-text-center" />;
};

const Sidebar = () => {
    const {
        getInitialConversations,
        conversations = [],
        selectedConversation,
        setSelectedConversation,
        isConversationsLoading,
    } = useChatStore();

    const [labels, setLabels] = useState(DEFAULT_LABELS);
    const [activeLabelId, setActiveLabelId] = useState(null);
    const [showLabelModal, setShowLabelModal] = useState(false);
    const [newLabelName, setNewLabelName] = useState("");
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [labelsLoaded, setLabelsLoaded] = useState(false);
    const [conversationsWithLabels, setConversationsWithLabels] = useState([]);
    const [manageLabelModal, setManageLabelModal] = useState({
        open: false,
        label: null,
    });

    // State for search query
    const [searchQuery, setSearchQuery] = useState("");

    // Load persistent labels on mount
    useEffect(() => {
        getInitialConversations();
    }, []);

    useEffect(() => {
        (async () => {
            if (!LabelManager.isSupported()) {
                setLabels(DEFAULT_LABELS);
                setLabelsLoaded(true);
                setConversationsWithLabels(conversations);
                setActiveLabelId(null);
                return;
            }
            try {
                await labelManager.migrateFromLocalStorage();
                const dbLabels = await labelManager.getLabels(0);
                const allLabels = [...DEFAULT_LABELS, ...(dbLabels || [])];
                setLabels(allLabels);
                setLabelsLoaded(true);
                setConversationsWithLabels(
                    syncLabelsToConversations(allLabels, conversations)
                );
                // If a label was selected, keep it selected by id
                if (
                    activeLabelId &&
                    allLabels.some((l) => l.id === activeLabelId)
                ) {
                    setActiveLabelId(activeLabelId);
                } else {
                    setActiveLabelId(null);
                }
            } catch (err) {
                setLabels(DEFAULT_LABELS);
                setLabelsLoaded(true);
                setConversationsWithLabels(conversations);
                setActiveLabelId(null);
            }
        })();
        // eslint-disable-next-line
    }, [conversations]);

    useEffect(() => {
        setConversationsWithLabels(
            syncLabelsToConversations(labels, conversations)
        );
    }, [labels, conversations]);

    const handleAddLabel = async () => {
        if (!newLabelName.trim()) return;
        const newLabel = {
            name: newLabelName,
            contacts: selectedContacts,
            createdAt: Date.now(),
        };
        try {
            const id = await labelManager.addLabel(newLabel);
            const updatedLabel = { ...newLabel, id };
            const updatedLabels = [...labels, updatedLabel];
            setLabels(updatedLabels);
            if (selectedContacts.length > 0) {
                await labelManager.associateContacts(id, selectedContacts);
            }
            setConversationsWithLabels(
                syncLabelsToConversations(updatedLabels, conversations)
            );
            setActiveLabelId(id);
        } catch (err) {
            alert("Failed to save label: " + err.message);
        }
        setNewLabelName("");
        setSelectedContacts([]);
        setShowLabelModal(false);
    };

    const handleRenameLabel = async (newName) => {
        const label = labels.find((l) => l.id === activeLabelId);
        if (!label || !newName.trim() || label.name === newName.trim()) return;
        const updatedLabel = { ...label, name: newName.trim() };
        try {
            await labelManager.putLabel(updatedLabel);
            const updatedLabels = labels.map((l) =>
                l.id === updatedLabel.id ? updatedLabel : l
            );
            setLabels(updatedLabels);
            setConversationsWithLabels(
                syncLabelsToConversations(updatedLabels, conversations)
            );
            // Keep the same label selected
            setActiveLabelId(updatedLabel.id);
        } catch (err) {
            alert("Failed to rename label: " + err.message);
        }
    };

    const handleAddContactToLabel = async (contactId) => {
        const label = labels.find((l) => l.id === activeLabelId);
        if (!label || label.contacts.includes(contactId)) return;
        const updatedLabel = {
            ...label,
            contacts: [...label.contacts, contactId],
        };
        try {
            await labelManager.putLabel(updatedLabel);
            const updatedLabels = labels.map((l) =>
                l.id === updatedLabel.id ? updatedLabel : l
            );
            setLabels(updatedLabels);
            setConversationsWithLabels(
                syncLabelsToConversations(updatedLabels, conversations)
            );
        } catch (err) {
            alert("Failed to add contact: " + err.message);
        }
    };

    const handleRemoveContactFromLabel = async (contactId) => {
        const label = labels.find((l) => l.id === activeLabelId);
        if (!label || !label.contacts.includes(contactId)) return;
        const updatedLabel = {
            ...label,
            contacts: label.contacts.filter((cid) => cid !== contactId),
        };
        try {
            await labelManager.putLabel(updatedLabel);
            const updatedLabels = labels.map((l) =>
                l.id === updatedLabel.id ? updatedLabel : l
            );
            setLabels(updatedLabels);
            setConversationsWithLabels(
                syncLabelsToConversations(updatedLabels, conversations)
            );
        } catch (err) {
            alert("Failed to remove contact: " + err.message);
        }
    };

    const handleDeleteLabel = async (labelId) => {
        try {
            await labelManager.removeLabel(labelId);
            const updatedLabels = labels.filter((l) => l.id !== labelId);
            setLabels(updatedLabels);
            setActiveLabelId(null);
            setConversationsWithLabels(
                syncLabelsToConversations(updatedLabels, conversations)
            );
        } catch (err) {
            alert("Failed to delete label: " + err.message);
        }
    };

    // Step 3: Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        let baseList;
        if (!activeLabelId) {
            baseList = conversationsWithLabels;
        } else {
            const label = labels.find((l) => l.id === activeLabelId);
            if (!label) baseList = conversationsWithLabels;
            else if (label.name === "All") baseList = conversationsWithLabels;
            else if (label.name === "Critical") {
                baseList = conversationsWithLabels.filter(
                    (conv) => conv.human_intervention_required
                );
            } else {
                baseList = conversationsWithLabels.filter((conv) =>
                    conv.labels?.includes(label.name)
                );
            }
        }
        if (!searchQuery.trim()) return baseList;
        const query = searchQuery.trim().toLowerCase();
        return baseList.filter((conv) => {
            // Chat/group name
            const nameMatch = (conv.name || "").toLowerCase().includes(query);
            // Last message content
            const lastMsgMatch = (conv.last_message?.message_text || "")
                .toLowerCase()
                .includes(query);
            // Participant names (if available)
            const participants =
                conv.participants?.map((p) => p.name?.toLowerCase() || "") ||
                [];
            const participantMatch = participants.some((n) =>
                n.includes(query)
            );
            // Try to match query with participant numbers (if available)
            const numberMatch =
                conv.participants?.some((p) =>
                    (p.number || "").toString().toLowerCase().includes(query)
                ) || false;
            // Optionally, match conversation's own number if present
            const convNumberMatch = (conv.number || "")
                .toString()
                .toLowerCase()
                .includes(query);
            // --- NEW: match conversation.phone ---
            const phoneMatch = (conv.phone || "")
                .toString()
                .toLowerCase()
                .includes(query);

            return (
                nameMatch ||
                lastMsgMatch ||
                participantMatch ||
                numberMatch ||
                convNumberMatch ||
                phoneMatch // <-- added for phone search
            );
        });
    }, [conversationsWithLabels, labels, activeLabelId, searchQuery]);

    const sortedConversations = useMemo(
        () =>
            [...(filteredConversations || [])].sort((a, b) => {
                const aTime = a.last_message?.provider_ts
                    ? new Date(a.last_message.provider_ts).getTime()
                    : 0;
                const bTime = b.last_message?.provider_ts
                    ? new Date(b.last_message.provider_ts).getTime()
                    : 0;
                return bTime - aTime;
            }),
        [filteredConversations]
    );

    if (isConversationsLoading || !labelsLoaded) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-96 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center gap-2">
                    <Users className="size-6" />
                    <span className="font-medium hidden lg:block">
                        Contacts
                    </span>
                </div>
            </div>

            {/* Search BOX */}
            <ChatSearchBox
                value={searchQuery}
                onSearch={setSearchQuery}
                activeTab={
                    activeLabelId
                        ? labels
                              .find((l) => l.id === activeLabelId)
                              ?.name?.toLowerCase() || "all"
                        : "all"
                }
            />

            {/* Labels section */}
            <div className="w-full px-2 py-2 border-b border-base-300">
                <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {labels.map((label) => (
                        <button
                            key={label.id ?? label.name}
                            onClick={() => setActiveLabelId(label.id ?? null)}
                            className={`px-4 py-1 rounded-full border ${
                                activeLabelId === label.id ||
                                (!activeLabelId && label.name === "All")
                                    ? "bg-green-800 text-white"
                                    : "bg-transparent text-zinc-300"
                            } whitespace-nowrap`}
                            aria-label={`Select label ${label.name}`}
                        >
                            {label.name}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowLabelModal(true)}
                        className="px-2 py-1 rounded-full border bg-transparent text-zinc-300 flex items-center"
                        title="Add label"
                        aria-label="Add label"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
            </div>

            {/* Modal for adding label */}
            {showLabelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-2xl w-[500px]">
                        <h2 className="text-lg font-bold mb-2">Create Label</h2>
                        <input
                            type="text"
                            placeholder="Label name"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            className="input input-bordered w-full mb-3"
                            aria-label="Label name"
                        />
                        <div className="mb-2 text-sm font-medium">
                            Select contacts:
                        </div>
                        <div className="max-h-40 overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                            {(conversations || []).map((conv) => (
                                <label
                                    key={conv.id}
                                    className="flex items-center gap-2 mb-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.includes(
                                            conv.id
                                        )}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedContacts([
                                                    ...selectedContacts,
                                                    conv.id,
                                                ]);
                                            } else {
                                                setSelectedContacts(
                                                    selectedContacts.filter(
                                                        (id) => id !== conv.id
                                                    )
                                                );
                                            }
                                        }}
                                        aria-label={`Select ${conv.name}`}
                                    />
                                    <span>{conv.name || "Unknown"}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowLabelModal(false)}
                                className="btn btn-sm"
                                aria-label="Cancel"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddLabel}
                                className="btn btn-sm btn-success"
                                aria-label="Add label"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Conversations List */}
            <div className="overflow-y-auto w-full py-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {sortedConversations.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8">
                        No chats found
                    </div>
                ) : (
                    sortedConversations.map((conversation) => (
                        <button
                            key={conversation.id}
                            onClick={() =>
                                setSelectedConversation(conversation)
                            }
                            className={`w-full p-3 flex items-center gap-3 hover:bg-green-800 transition-colors ${
                                selectedConversation?.id === conversation.id
                                    ? "bg-stone-800 ring-1 ring-base-300"
                                    : ""
                            }`}
                            aria-label={`Open chat with ${conversation.name}`}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                {conversation.name == null && (
                                    <img
                                        src="/avatar.png"
                                        alt="avatar"
                                        className="size-12 object-cover rounded-full"
                                    />
                                )}
                                {conversation.name != null && (
                                    <div
                                        className={`size-12 object-cover rounded-full flex justify-center items-center ${profilePicColors(
                                            conversation.name
                                        )}`}
                                    >
                                        {conversation.name?.charAt(0) +
                                            (conversation.name?.indexOf(" ") > 0
                                                ? conversation.name
                                                      ?.substring(
                                                          conversation.name?.indexOf(
                                                              " "
                                                          ) + 1
                                                      )
                                                      .charAt(0)
                                                : "")}
                                    </div>
                                )}
                            </div>
                            <div className="hidden lg:block text-left min-w-72">
                                <div className="flex justify-between">
                                    <span className="font-medium truncate w-1/2">
                                        {conversation.name?.length > 0
                                            ? conversation.name
                                            : "Unknown"}
                                    </span>
                                    {conversation.last_message?.id && (
                                        <span className="text-xs text-zinc-500 ">
                                            {formatMessageTime(
                                                conversation.last_message
                                                    .provider_ts
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    {conversation.last_message?.id && (
                                        <p className="text-sm text-zinc-400 truncate w-64">
                                            {conversation.last_message
                                                .media_info &&
                                                renderIcon(
                                                    JSON.parse(
                                                        conversation
                                                            .last_message
                                                            .media_info
                                                    )?.mime_type
                                                )}
                                            {conversation.last_message
                                                .message_text?.length > 0
                                                ? conversation.last_message
                                                      .message_text
                                                : JSON.parse(
                                                      conversation.last_message
                                                          .media_info
                                                  )?.mime_type.substring(
                                                      0,
                                                      JSON.parse(
                                                          conversation
                                                              .last_message
                                                              .media_info
                                                      )?.mime_type?.indexOf("/")
                                                  )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Always show Manage button for custom label (not All/Critical) */}
            {activeLabelId && labels.some((l) => l.id === activeLabelId) && (
                <>
                    <div className="border-t border-zinc-800 my-2" />
                    <div className="flex justify-center py-2">
                        <button
                            className="px-4 py-2 rounded bg-zinc-900 text-green-400 text-base font-medium hover:bg-zinc-800 transition-all"
                            onClick={() => {
                                const labelObj = labels.find(
                                    (l) => l.id === activeLabelId
                                );
                                if (labelObj)
                                    setManageLabelModal({
                                        open: true,
                                        label: labelObj,
                                    });
                            }}
                            aria-label={`Manage ${
                                labels.find((l) => l.id === activeLabelId)
                                    ?.name || ""
                            }`}
                        >
                            Manage{" "}
                            {labels.find((l) => l.id === activeLabelId)?.name ||
                                ""}
                        </button>
                    </div>
                </>
            )}

            {manageLabelModal.open && (
                <ManageLabelModal
                    open={manageLabelModal.open}
                    label={labels.find((l) => l.id === activeLabelId)}
                    allConversations={conversations}
                    onClose={() =>
                        setManageLabelModal({ open: false, label: null })
                    }
                    onRename={handleRenameLabel}
                    onAddContact={handleAddContactToLabel}
                    onRemoveContact={handleRemoveContactFromLabel}
                    onDeleteLabel={handleDeleteLabel}
                />
            )}
        </aside>
    );
};
export default Sidebar;