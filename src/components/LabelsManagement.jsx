import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { useLabelsStore } from "../store/useLabelsStore";
import { LABEL_COLORS, MAX_LABELS } from "../constants";

/**
 * LabelsManagement Component
 *
 * Full labels management UI displayed under Settings > Business Tools > Labels
 * Features:
 * - List all labels with edit/delete options
 * - Color picker for label colors
 * - Create new label form
 * - Visual feedback and validations
 */
const LabelsManagement = ({ onBack }) => {
    const {
        labels,
        isLabelsLoading,
        getLabels,
        createLabel,
        updateLabel,
        deleteLabel,
        getRandomColor,
    } = useLabelsStore();

    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("");
    const [editLabelName, setEditLabelName] = useState("");
    const [editLabelColor, setEditLabelColor] = useState("");

    // Load labels on mount
    useEffect(() => {
        getLabels();
    }, [getLabels]);

    // Handle create new label
    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) {
            return;
        }

        const success = await createLabel({
            name: newLabelName.trim(),
            color: newLabelColor || getRandomColor(),
        });

        if (success) {
            setIsCreating(false);
            setNewLabelName("");
            setNewLabelColor("");
        }
    };

    // Handle start editing
    const handleStartEdit = (label) => {
        setEditingId(label.id);
        setEditLabelName(label.name);
        setEditLabelColor(label.color);
    };

    // Handle save edit
    const handleSaveEdit = async (labelId) => {
        if (!editLabelName.trim()) {
            return;
        }

        const success = await updateLabel(labelId, {
            name: editLabelName.trim(),
            color: editLabelColor,
        });

        if (success) {
            setEditingId(null);
            setEditLabelName("");
            setEditLabelColor("");
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditLabelName("");
        setEditLabelColor("");
    };

    // Handle delete label
    const handleDeleteLabel = async (labelId) => {
        if (window.confirm("Are you sure you want to delete this label?")) {
            await deleteLabel(labelId);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-zinc-900 pt-16">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors duration-150"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-400" />
                </button>
                <div>
                    <h2 className="text-xl font-semibold text-zinc-100">
                        Labels
                    </h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Manage conversation labels ({labels.length}/{MAX_LABELS}
                        )
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {/* Create New Label Button */}
                {!isCreating && labels.length < MAX_LABELS && (
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            setNewLabelColor(getRandomColor());
                        }}
                        className="w-full mb-4 p-4 border-2 border-dashed border-zinc-700 rounded-xl hover:border-green-600 hover:bg-zinc-800/50 transition-all duration-150 flex items-center justify-center gap-2 text-zinc-400 hover:text-green-500"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Create new label</span>
                    </button>
                )}

                {/* Create New Label Form */}
                {isCreating && (
                    <div className="mb-4 p-4 bg-zinc-800 rounded-xl border border-zinc-700">
                        <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                            New Label
                        </h3>

                        {/* Label Name Input */}
                        <input
                            type="text"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            placeholder="Label name"
                            maxLength={50}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 mb-3"
                            autoFocus
                        />

                        {/* Color Picker */}
                        <div className="mb-4">
                            <label className="text-xs text-zinc-400 mb-2 block">
                                Label Color
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {LABEL_COLORS.map((colorOption) => (
                                    <button
                                        key={colorOption.hex}
                                        onClick={() =>
                                            setNewLabelColor(colorOption.hex)
                                        }
                                        className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                                            newLabelColor === colorOption.hex
                                                ? "border-white scale-110"
                                                : "border-zinc-700 hover:scale-105"
                                        }`}
                                        style={{
                                            backgroundColor: colorOption.hex,
                                        }}
                                        title={colorOption.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateLabel}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Create
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setNewLabelName("");
                                    setNewLabelColor("");
                                }}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Labels List */}
                <div className="space-y-2">
                    {labels.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <p>No labels created yet</p>
                            <p className="text-sm mt-2">
                                Create your first label to organize
                                conversations
                            </p>
                        </div>
                    ) : (
                        labels.map((label) => (
                            <div
                                key={label.id}
                                className="p-4 bg-zinc-800 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-all duration-150"
                            >
                                {editingId === label.id ? (
                                    // Edit Mode
                                    <>
                                        <input
                                            type="text"
                                            value={editLabelName}
                                            onChange={(e) =>
                                                setEditLabelName(e.target.value)
                                            }
                                            placeholder="Label name"
                                            maxLength={50}
                                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 mb-3"
                                        />

                                        {/* Color Picker */}
                                        <div className="mb-3">
                                            <label className="text-xs text-zinc-400 mb-2 block">
                                                Label Color
                                            </label>
                                            <div className="flex gap-2 flex-wrap">
                                                {LABEL_COLORS.map(
                                                    (colorOption) => (
                                                        <button
                                                            key={
                                                                colorOption.hex
                                                            }
                                                            onClick={() =>
                                                                setEditLabelColor(
                                                                    colorOption.hex
                                                                )
                                                            }
                                                            className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                                                                editLabelColor ===
                                                                colorOption.hex
                                                                    ? "border-white scale-110"
                                                                    : "border-zinc-700 hover:scale-105"
                                                            }`}
                                                            style={{
                                                                backgroundColor:
                                                                    colorOption.hex,
                                                            }}
                                                            title={
                                                                colorOption.name
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleSaveEdit(label.id)
                                                }
                                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    // View Mode
                                    <div className="flex items-center gap-3">
                                        {/* Color Circle */}
                                        <div
                                            className="w-5 h-5 rounded-full border-2 border-zinc-600 flex-shrink-0"
                                            style={{
                                                backgroundColor: label.color,
                                            }}
                                        />

                                        {/* Label Name */}
                                        <div className="flex-1">
                                            <h4 className="text-zinc-200 font-medium">
                                                {label.name}
                                            </h4>
                                            {label.isDefault && (
                                                <span className="text-xs text-zinc-500">
                                                    Default label
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleStartEdit(label)
                                                }
                                                className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors duration-150"
                                                title="Edit label"
                                            >
                                                <Edit2 className="w-4 h-4 text-zinc-300" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteLabel(label.id)
                                                }
                                                className="p-2 rounded-lg bg-zinc-700 hover:bg-red-600 transition-colors duration-150"
                                                title="Delete label"
                                            >
                                                <Trash2 className="w-4 h-4 text-zinc-300" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Info Message */}
                {labels.length >= MAX_LABELS && (
                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                        <p className="text-sm text-yellow-500">
                            Maximum label limit reached ({MAX_LABELS} labels).
                            Delete a label to create a new one.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabelsManagement;
