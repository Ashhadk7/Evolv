// @ts-nocheck
export const ApplicationCard = ({ data }) => {
    const { name, icon, iconClass, role, date, status } = data;

    const getStatusClass = (status) => {
        const map = { Interview: 'interview', Pending: 'pending', Accepted: 'accepted', Declined: 'declined' };
        return map[status] || '';
    };

    return (
        <div className={"ApplicationCard_appItem"}>
            <div className={`${"ApplicationCard_icon"} ${iconClass ? "ApplicationCard_" + iconClass : ""}`}>
                <i className={`fas fa-${icon}`}></i>
            </div>
            <div className={"ApplicationCard_info"}>
                <div className={"ApplicationCard_name"}>{name}</div>
                <div className={"ApplicationCard_role"}>{role} · <span className={"ApplicationCard_date"}>{date}</span></div>
            </div>
            <span className={`${"ApplicationCard_status"} ${"ApplicationCard_" + getStatusClass(status)}`}>{status}</span>
            <span className={"ApplicationCard_chevron"}><i className="fas fa-chevron-right"></i></span>
        </div>
    );
};
