// @ts-nocheck
export const MatchCard = ({ data }) => {
    const { name, icon, matchScore, description, techStack, industry, stage, budget, teamSize, iconClass } = data;
    return (
        <div className={"MatchCard_matchCard"}>
            <div className={"MatchCard_top"}>
                <div className={"MatchCard_left"}>
                    <div className={`${"MatchCard_icon"} ${iconClass ? "MatchCard_" + iconClass : ""}`}><i className={`fas fa-${icon}`}></i></div>
                    <span className={"MatchCard_name"}>{name}</span>
                </div>
                <span className={"MatchCard_score"}>{matchScore}%</span>
            </div>
            <div className={"MatchCard_desc"}>{description}</div>
            <div className={"MatchCard_tags"}>{techStack.map((tech, idx) => <span key={idx} className={"MatchCard_techTag"}>{tech}</span>)}</div>
            <div className={"MatchCard_meta"}>
                <span><i className={`fas fa-${icon}`}></i> {industry}</span>
                <span><i className="fas fa-seedling"></i> {stage}</span>
                <span><i className="fas fa-dollar-sign"></i> {budget}</span>
                <span><i className="fas fa-users"></i> {teamSize}</span>
            </div>
            <div className={"MatchCard_actions"}>
                <button className={`${"MatchCard_btn"} ${"MatchCard_primary"}`}><i className="fas fa-eye"></i> Review</button>
                <button className={"MatchCard_btn"}><i className="fas fa-bookmark"></i> Save</button>
            </div>
        </div>
    );
};
