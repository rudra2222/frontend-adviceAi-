import { useChatStore } from "../store/useChatStore.js";

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
            {isHumanInterventionActive ? "Takeover ON" : "Takeover OFF"}
        </button>
    );
};

export default TakeoverToggleButton;
