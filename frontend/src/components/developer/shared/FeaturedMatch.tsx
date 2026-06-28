// @ts-nocheck
export const FeaturedMatch = ({ data }) => {
    const { name, icon, matchScore, description, techStack, whyMatched } = data;
    return (
        <div className={"FeaturedMatch_featuredMatch"}>
            <div className={"FeaturedMatch_sectionTop"}>
                <i className="fas fa-fire" style={{ color: '#FF6B6B' }}></i>
                <span className={"FeaturedMatch_secLabel"}>Latest AI Match</span>
            </div>
            <div className={"FeaturedMatch_card"}>
                <div className={"FeaturedMatch_icon"}><i className={`fas fa-${icon}`}></i></div>
                <div className={"FeaturedMatch_body"}>
                    <div className={"FeaturedMatch_topRow"}>
                        <span className={"FeaturedMatch_name"}>{name}</span>
                        <span className={"FeaturedMatch_score"}>{matchScore}% Match</span>
                    </div>
                    <div className={"FeaturedMatch_desc"}>{description}</div>
                    <div className={"FeaturedMatch_techTags"}>{techStack.map((tech, idx) => <span key={idx} className={"FeaturedMatch_techTag"}>{tech}</span>)}</div>
                    <div className={"FeaturedMatch_whyBox"}>
                        <div className={"FeaturedMatch_whyLabel"}>Why matched?</div>
                        <ul>{whyMatched.map((item, idx) => <li key={idx}><i className="fas fa-check-circle"></i> {item}</li>)}</ul>
                    </div>
                    <div className={"FeaturedMatch_actions"}>
                        <button className={`${"FeaturedMatch_btn"} ${"FeaturedMatch_primary"}`}><i className="fas fa-eye"></i> Review Match</button>
                        <button className={`${"FeaturedMatch_btn"} ${"FeaturedMatch_iconOnly"}`}><i className="fas fa-bookmark"></i></button>
                        <button className={"FeaturedMatch_btn"}><i className="fas fa-share-alt"></i></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
