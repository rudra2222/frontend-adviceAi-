import { useChatStore } from "../store/useChatStore.js";
import { Loader2 } from "lucide-react";

const TakeoverToggleButton = () => {
    const {
        isHumanInterventionActive,
        handback,
        takeover,
        interventionToggleDisabled,
    } = useChatStore();

    const handleToggle = () => {
        if (isHumanInterventionActive) {
            handback();
        } else {
            takeover();
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`btn btn-sm btn-outline fixed right-24 ${
                isHumanInterventionActive ? "bg-red-600" : ""
            }`}
            aria-pressed={isHumanInterventionActive}
            title={
                !isHumanInterventionActive
                    ? "AI is in-charge of this conversation"
                    : "You are the in-charge of this conversation"
            }
            disabled={interventionToggleDisabled}
        >
            {interventionToggleDisabled ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isHumanInterventionActive
                        ? "Turning OFF..."
                        : "Turning ON..."}
                </>
            ) : (
                <>
                    {isHumanInterventionActive ? "Takeover ON" : "Takeover OFF"}
                </>
            )}
        </button>
    );
};

export default TakeoverToggleButton;
