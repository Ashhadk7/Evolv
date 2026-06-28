// @ts-nocheck
export const ProfileCard = ({ data }) => {
    const { name, role, location, experience, availability, matchRate, profileStrength, founderRating, image } = data;
    return (
        <div className={"ProfileCard_profileCard"}>
            <div className={"ProfileCard_header"}>
                <span className={"ProfileCard_title"}><i className="fas fa-user-circle"></i> Developer Profile</span>
                <a href="#">Edit Profile</a>
            </div>
            <div className={"ProfileCard_content"}>
                <div className={"ProfileCard_avatarWrap"}>
                    <img src={image} alt={name} className={"ProfileCard_avatar"} />
                    <div className={"ProfileCard_statusDot"}></div>
                </div>
                <div className={"ProfileCard_right"}>
                    <div className={"ProfileCard_name"}>{name}</div>
                    <div className={"ProfileCard_role"}>{role}</div>
                    <div className={"ProfileCard_meta"}>
                        <div className={"ProfileCard_metaItem"}><i className="fas fa-map-marker-alt"></i> {location}</div>
                        <div className={"ProfileCard_metaItem"}><i className="fas fa-briefcase"></i> {experience}</div>
                        <div className={`${"ProfileCard_metaItem"} ${"ProfileCard_avail"}`}><i className="fas fa-circle"></i> Availability: {availability}</div>
                    </div>
                </div>
            </div>
            <div className={"ProfileCard_stats"}>
                <div className={"ProfileCard_stat"}><span className={"ProfileCard_statLabel"}>Match Rate</span><div className={"ProfileCard_statNum"}>{matchRate}</div></div>
                <div className={"ProfileCard_stat"}><span className={"ProfileCard_statLabel"}>Profile Strength</span><div className={"ProfileCard_statNum"}>{profileStrength}</div></div>
                <div className={"ProfileCard_stat"}><span className={"ProfileCard_statLabel"}>Founder Rating</span><div className={"ProfileCard_statNum"}><span className={"ProfileCard_star"}>★</span> {founderRating}</div></div>
            </div>
            <div className={"ProfileCard_bottomRow"}>
                <button className={"ProfileCard_portfolioBtn"}><i className="fas fa-briefcase"></i> View Portfolio</button>
                <div className={"ProfileCard_socials"}>
                    <a href="#"><i className="fab fa-github"></i></a>
                    <a href="#"><i className="fab fa-linkedin"></i></a>
                    <a href="#"><i className="fab fa-twitter"></i></a>
                </div>
            </div>
        </div>
    );
};
