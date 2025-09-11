const TakeoverToggleButton = ({ isActive, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`btn btn-sm btn-outline fixed right-24 ${isActive ? "bg-red-600" : ""}`}
            aria-pressed={isActive}
            disabled
            title="feature comming soon"
        >
            {isActive ? "Takeover ON" : "Takeover OFF"}
        </button>
    );
};

export default TakeoverToggleButton;
