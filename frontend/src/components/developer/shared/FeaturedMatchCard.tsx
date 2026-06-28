// @ts-nocheck
export const FeaturedMatchCard = ({ data }) => {
    const { name, industry, stage, viability, matchScore, budget, founder, teamSize, description, techStack, whyMatched, logo } = data;
    return (
        <div className={"FeaturedMatchCard_featuredCard"}>
            <div className={"FeaturedMatchCard_badge"}><i className="fas fa-fire" style={{ color: '#FF6B6B' }}></i> Featured Match</div>
            <div className={"FeaturedMatchCard_card"}>
                <div className={"FeaturedMatchCard_top"}>
                    <div className={"FeaturedMatchCard_header"}>
                        <span className={"FeaturedMatchCard_logo"}>{logo}</span>
                        <div className={"FeaturedMatchCard_info"}>
                            <div className={"FeaturedMatchCard_name"}>{name}</div>
                            <div className={"FeaturedMatchCard_meta"}><span>{industry}</span><span>·</span><span>{stage}</span><span>·</span><span>Founder: {founder}</span></div>
                        </div>
                    </div>
                    <div className={"FeaturedMatchCard_badges"}>
                        <span className={"FeaturedMatchCard_viabilityBadge"}>Viability {viability}%</span>
                        <span className={"FeaturedMatchCard_matchBadge"}>{matchScore}% Match</span>
                    </div>
                </div>
                <div className={"FeaturedMatchCard_body"}>
                    <div className={"FeaturedMatchCard_desc"}>{description}</div>
                    <div className={"FeaturedMatchCard_metrics"}>
                        <div className={"FeaturedMatchCard_metric"}><span className={"FeaturedMatchCard_metricLabel"}>Budget</span><span className={"FeaturedMatchCard_metricValue"}>{budget}</span></div>
                        <div className={"FeaturedMatchCard_metric"}><span className={"FeaturedMatchCard_metricLabel"}>Team Size</span><span className={"FeaturedMatchCard_metricValue"}>{teamSize}</span></div>
                    </div>
                    <div className={"FeaturedMatchCard_techTags"}>{techStack.map((tech, idx) => <span key={idx} className={"FeaturedMatchCard_techTag"}>{tech}</span>)}</div>
                    <div className={"FeaturedMatchCard_whyBox"}>
                        <div className={"FeaturedMatchCard_whyLabel"}>Why matched?</div>
                        <ul>{whyMatched.map((item, idx) => <li key={idx}><i className="fas fa-check-circle"></i> {item}</li>)}</ul>
                    </div>
                    <div className={"FeaturedMatchCard_actions"}>
                        <button className={"FeaturedMatchCard_primaryBtn"}><i className="fas fa-eye"></i> Review Blueprint</button>
                        <button className={"FeaturedMatchCard_primaryBtn"}><i className="fas fa-check"></i> Apply Now</button>
                        <button className={"FeaturedMatchCard_iconBtn"}><i className="fas fa-bookmark"></i></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
