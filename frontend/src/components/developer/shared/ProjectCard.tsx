// @ts-nocheck
export const ProjectCard = ({ data }) => {
    const { name, icon, iconClass, role, progress, progressColor, teamMembers, extraMembers, stage, deadline, hoursLogged } = data;
    return (
        <div className={"ProjectCard_projItem"}>
            <div className={"ProjectCard_top"}>
                <div className={`${"ProjectCard_icon"} ${iconClass ? "ProjectCard_" + iconClass : ""}`}><i className={`fas fa-${icon}`}></i></div>
                <div className={"ProjectCard_info"}>
                    <div className={"ProjectCard_name"}>{name}</div>
                    <div className={"ProjectCard_role"}>{role}</div>
                </div>
                <div className={"ProjectCard_right"}><div className={"ProjectCard_pct"}>{progress}%</div></div>
            </div>
            <div className={"ProjectCard_progress"}>
                <div className={`${"ProjectCard_fill"} ${progressColor ? "ProjectCard_" + progressColor : ""}`} style={{ width: `${progress}%` }}></div>
            </div>
            <div className={"ProjectCard_avatars"}>
                {teamMembers.map((member, idx) => <div key={idx} className={"ProjectCard_avatar"}>{member}</div>)}
                {extraMembers > 0 && <div className={`${"ProjectCard_avatar"} ${"ProjectCard_more"}`}>+{extraMembers}</div>}
            </div>
            <div className={"ProjectCard_metaRow"}><span>Stage</span><span className={"ProjectCard_stageBadge"}>{stage}</span><span>Deadline</span><span className={"ProjectCard_deadlineValue"}>{deadline}</span></div>
            <div className={"ProjectCard_metaRow"}><span>Hours Logged</span><span className={"ProjectCard_hoursValue"}>{hoursLogged}</span></div>
        </div>
    );
};
