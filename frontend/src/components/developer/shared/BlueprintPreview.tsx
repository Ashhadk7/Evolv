// @ts-nocheck
export const BlueprintPreview = ({ data }) => {
    const { name, industry, stage, viability, budget, teamSize, techStack, roles, matchExplanation, metrics, logo } = data;

    return (
        <div className={"BlueprintPreview_preview"}>
            <div className={"BlueprintPreview_header"}>
                <div className={"BlueprintPreview_title"}>Blueprint Preview</div>
                <span className={"BlueprintPreview_matchBadge"}>{data.matchScore || 88}% Match</span>
            </div>
            <div className={"BlueprintPreview_content"}>
                <div className={"BlueprintPreview_startupHeader"}>
                    <span className={"BlueprintPreview_logo"}>{logo}</span>
                    <div>
                        <div className={"BlueprintPreview_name"}>{name}</div>
                        <div className={"BlueprintPreview_meta"}>{industry} · {stage}</div>
                    </div>
                </div>
                <div className={"BlueprintPreview_section"}>
                    <div className={"BlueprintPreview_sectionTitle"}>Problem</div>
                    <p>Early-stage oncology diagnosis has a 40% false positive rate, delaying critical treatment.</p>
                </div>
                <div className={"BlueprintPreview_section"}>
                    <div className={"BlueprintPreview_sectionTitle"}>Solution</div>
                    <p>AI-driven diagnostics platform reducing false positives by 40%.</p>
                </div>
                <div className={"BlueprintPreview_section"}>
                    <div className={"BlueprintPreview_sectionTitle"}>Target Audience</div>
                    <p>Hospitals, clinics, and oncology centers.</p>
                </div>
                <div className={"BlueprintPreview_section"}>
                    <div className={"BlueprintPreview_sectionTitle"}>Revenue Model</div>
                    <p>B2B SaaS subscription + per-diagnosis fee.</p>
                </div>
                <div className={"BlueprintPreview_metricsGrid"}>
                    <div className={"BlueprintPreview_metricItem"}><span className={"BlueprintPreview_metricLabel"}>Viability</span><span className={"BlueprintPreview_metricValue"}>{viability}%</span></div>
                    <div className={"BlueprintPreview_metricItem"}><span className={"BlueprintPreview_metricLabel"}>Funding Readiness</span><span className={"BlueprintPreview_metricValue"}>{metrics?.fundingReadiness || 85}%</span></div>
                    <div className={"BlueprintPreview_metricItem"}><span className={"BlueprintPreview_metricLabel"}>Growth Potential</span><span className={"BlueprintPreview_metricValue"}>{metrics?.growthPotential || 90}%</span></div>
                    <div className={"BlueprintPreview_metricItem"}><span className={"BlueprintPreview_metricLabel"}>Team Size</span><span className={"BlueprintPreview_metricValue"}>{teamSize}</span></div>
                </div>
                <div className={"BlueprintPreview_section"}>
                    <div className={"BlueprintPreview_sectionTitle"}>Required Roles</div>
                    <div className={"BlueprintPreview_tags"}>{roles.map((role, idx) => <span key={idx} className={"BlueprintPreview_roleTag"}>{role}</span>)}</div>
                </div>
                <div className={"BlueprintPreview_section"}>
                    <div className={"BlueprintPreview_sectionTitle"}>Tech Stack</div>
                    <div className={"BlueprintPreview_tags"}>{techStack.map((tech, idx) => <span key={idx} className={"BlueprintPreview_techTag"}>{tech}</span>)}</div>
                </div>
                <div className={"BlueprintPreview_matchSummary"}>
                    <div className={"BlueprintPreview_matchTitle"}>AI Match Summary</div>
                    <div className={"BlueprintPreview_matchExplanation"}>{matchExplanation || 'Strong alignment with your skills and experience.'}</div>
                </div>
            </div>
            <div className={"BlueprintPreview_actions"}>
                <button className={"BlueprintPreview_primaryBtn"}><i className="fas fa-eye"></i> Full Blueprint</button>
                <button className={"BlueprintPreview_primaryBtn"}><i className="fas fa-check"></i> Apply Now</button>
                <button className={"BlueprintPreview_iconBtn"}><i className="fas fa-bookmark"></i></button>
            </div>
        </div>
    );
};
