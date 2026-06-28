// @ts-nocheck
export const InvitationCard = ({ data }) => {
    const { founderName, startupName, role, matchScore, message, logo } = data;
    return (
        <div className={"InvitationCard_invitationCard"}>
            <div className={"InvitationCard_top"}>
                <div className={"InvitationCard_header"}>
                    <span className={"InvitationCard_logo"}>{logo}</span>
                    <div>
                        <div className={"InvitationCard_startupName"}>{startupName}</div>
                        <div className={"InvitationCard_founderName"}>Founder: {founderName}</div>
                    </div>
                </div>
                <span className={"InvitationCard_matchScore"}>{matchScore}% Match</span>
            </div>
            <div className={"InvitationCard_role"}>Looking for: {role}</div>
            <div className={"InvitationCard_message"}>"{message}"</div>
            <div className={"InvitationCard_actions"}>
                <button className={"InvitationCard_acceptBtn"}><i className="fas fa-check"></i> Accept</button>
                <button className={"InvitationCard_viewBtn"}><i className="fas fa-eye"></i> View Blueprint</button>
                <button className={"InvitationCard_declineBtn"}><i className="fas fa-times"></i> Decline</button>
            </div>
        </div>
    );
};
