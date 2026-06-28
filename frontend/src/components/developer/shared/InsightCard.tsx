// @ts-nocheck
export const InsightCard = ({ data }) => {
    const { icon, value, label } = data;
    return (
        <div className={"InsightCard_insightCard"}>
            <div className={`${"InsightCard_icon"} ${"InsightCard_" + icon + "Icon"}`}><i className={`fas fa-${icon}`}></i></div>
            <div className={"InsightCard_value"}>{value}</div>
            <div className={"InsightCard_label"}>{label}</div>
        </div>
    );
};
