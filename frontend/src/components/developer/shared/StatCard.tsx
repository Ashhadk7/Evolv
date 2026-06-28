// @ts-nocheck
export const StatCard = ({ label, value, trend, trendUp }) => {
    return (
        <div className={"StatCard_statCard"}>
            <div className={"StatCard_top"}>
                <span className={"StatCard_label"}>{label}</span>
                <span className={`${"StatCard_trend"} ${trendUp ? '' : "StatCard_down"}`}>
                    <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'}`}></i> {trend}
                </span>
            </div>
            <div className={"StatCard_value"}>{value}</div>
            <svg className={"StatCard_sparkline"} viewBox="0 0 120 36" preserveAspectRatio="none">
                <path className={"StatCard_area"} d="M0,28 C10,24 20,18 30,20 C40,22 50,10 60,14 C70,18 80,8 90,12 C100,16 110,22 120,18 L120,36 L0,36 Z" />
                <path d="M0,28 C10,24 20,18 30,20 C40,22 50,10 60,14 C70,18 80,8 90,12 C100,16 110,22 120,18" />
            </svg>
        </div>
    );
};
