// @ts-nocheck
export const StartupCard = ({ data, compact, detailed, onSelect, onApply, onSave }) => {
    const { name, industry, stage, viability, matchScore, budget, teamSize, description, techStack, roles, matchExplanation, metrics, logo, founder } = data;

    if (compact) {
        return (
            <div className={"StartupCard_compactCard"} onClick={onSelect}>
                <div className={"StartupCard_compactTop"}>
                    <div className={"StartupCard_compactLeft"}><span className={"StartupCard_compactLogo"}>{logo}</span><span className={"StartupCard_compactName"}>{name}</span></div>
                    <span className={"StartupCard_compactScore"}>{matchScore}%</span>
                </div>
                <div className={"StartupCard_compactIndustry"}>{industry} · {stage}</div>
                <div className={"StartupCard_compactDesc"}>{description}</div>
                <div className={"StartupCard_compactTags"}>
                    {techStack.slice(0, 3).map((tech, idx) => <span key={idx} className={"StartupCard_tag"}>{tech}</span>)}
                    {techStack.length > 3 && <span className={"StartupCard_tag"}>+{techStack.length - 3}</span>}
                </div>
                <div className={"StartupCard_compactActions"}>
                    <button className={"StartupCard_primaryBtn"}>Review Match</button>
                    <button className={"StartupCard_iconBtn"}><i className="fas fa-bookmark"></i></button>
                </div>
            </div>
        );
    }

    if (detailed) {
        return (
            <div className={"StartupCard_detailedCard"} onClick={onSelect}>
                <div className={"StartupCard_detailedTop"}>
                    <div className={"StartupCard_detailedHeader"}>
                        <span className={"StartupCard_detailedLogo"}>{logo}</span>
                        <div className={"StartupCard_detailedInfo"}>
                            <div className={"StartupCard_detailedName"}>{name}</div>
                            <div className={"StartupCard_detailedMeta"}><span>{industry}</span><span>·</span><span>{stage}</span><span>·</span><span>Founder: {founder}</span></div>
                        </div>
                    </div>
                    <div className={"StartupCard_detailedBadges"}>
                        <span className={"StartupCard_viabilityBadge"}>Viability {viability}%</span>
                        <span className={"StartupCard_matchBadge"}>{matchScore}% Match</span>
                    </div>
                </div>
                <div className={"StartupCard_detailedBody"}>
                    <div className={"StartupCard_detailedDesc"}>{description}</div>
                    <div className={"StartupCard_detailedMetrics"}>
                        <div className={"StartupCard_metricItem"}><span className={"StartupCard_metricLabel"}>Budget</span><span className={"StartupCard_metricValue"}>{budget}</span></div>
                        <div className={"StartupCard_metricItem"}><span className={"StartupCard_metricLabel"}>Team Size</span><span className={"StartupCard_metricValue"}>{teamSize}</span></div>
                        <div className={"StartupCard_metricItem"}><span className={"StartupCard_metricLabel"}>Funding Readiness</span><span className={"StartupCard_metricValue"}>{metrics?.fundingReadiness || 80}%</span></div>
                        <div className={"StartupCard_metricItem"}><span className={"StartupCard_metricLabel"}>Growth Potential</span><span className={"StartupCard_metricValue"}>{metrics?.growthPotential || 85}%</span></div>
                    </div>
                    <div className={"StartupCard_detailedTags"}>
                        <div className={"StartupCard_tagSection"}><span className={"StartupCard_tagLabel"}>Roles:</span>{roles.map((role, idx) => <span key={idx} className={"StartupCard_roleTag"}>{role}</span>)}</div>
                        <div className={"StartupCard_tagSection"}><span className={"StartupCard_tagLabel"}>Tech Stack:</span>{techStack.map((tech, idx) => <span key={idx} className={"StartupCard_tag"}>{tech}</span>)}</div>
                    </div>
                    {matchExplanation && <div className={"StartupCard_matchExplanation"}><i className="fas fa-lightbulb" style={{ color: '#b38f6b' }}></i>{matchExplanation}</div>}
                </div>
                <div className={"StartupCard_detailedActions"}>
                    <button className={"StartupCard_primaryBtn"}><i className="fas fa-eye"></i> Review Blueprint</button>
                    <button className={"StartupCard_primaryBtn"}><i className="fas fa-check"></i> Apply Now</button>
                    <button className={"StartupCard_iconBtn"}><i className="fas fa-bookmark"></i></button>
                </div>
            </div>
        );
    }

    return null;
};
