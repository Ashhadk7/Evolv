import React, { useState } from 'react';
import styles from './FilterBar.module.css';

const FilterBar = ({ options, onFilterChange }) => {
    const [filters, setFilters] = useState({
        status: 'All Statuses',
        industry: 'All Industries',
        fundingStage: 'All Stages',
        matchScore: 'All Scores',
        workType: 'All Types',
    });

    const handleChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            status: 'All Statuses',
            industry: 'All Industries',
            fundingStage: 'All Stages',
            matchScore: 'All Scores',
            workType: 'All Types',
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className={styles.filterBar}>
            <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                    <label>Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                    >
                        {options.statuses.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Industry</label>
                    <select
                        value={filters.industry}
                        onChange={(e) => handleChange('industry', e.target.value)}
                    >
                        {options.industries.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Funding Stage</label>
                    <select
                        value={filters.fundingStage}
                        onChange={(e) => handleChange('fundingStage', e.target.value)}
                    >
                        {options.fundingStages.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Match Score</label>
                    <select
                        value={filters.matchScore}
                        onChange={(e) => handleChange('matchScore', e.target.value)}
                    >
                        {options.matchScores.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Work Type</label>
                    <select
                        value={filters.workType}
                        onChange={(e) => handleChange('workType', e.target.value)}
                    >
                        {options.workTypes.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <button className={styles.resetBtn} onClick={handleReset}>
                    <i className="fas fa-undo"></i> Reset
                </button>
            </div>
        </div>
    );
};

export default FilterBar;