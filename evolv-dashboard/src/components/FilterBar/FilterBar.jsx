import React, { useState } from 'react';
import styles from './FilterBar.module.css';

const FilterBar = ({ options, onFilterChange }) => {
    const [filters, setFilters] = useState({
        industry: '',
        fundingStage: '',
        viabilityRange: '',
        techStack: '',
        matchScore: '',
        workType: '',
    });

    const handleChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            industry: '',
            fundingStage: '',
            viabilityRange: '',
            techStack: '',
            matchScore: '',
            workType: '',
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className={styles.filterBar}>
            <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                    <label>Industry</label>
                    <select
                        value={filters.industry}
                        onChange={(e) => handleChange('industry', e.target.value)}
                    >
                        <option value="">All Industries</option>
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
                        <option value="">All Stages</option>
                        {options.fundingStages.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Viability Score</label>
                    <select
                        value={filters.viabilityRange}
                        onChange={(e) => handleChange('viabilityRange', e.target.value)}
                    >
                        <option value="">All Scores</option>
                        {options.viabilityRanges.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Tech Stack</label>
                    <select
                        value={filters.techStack}
                        onChange={(e) => handleChange('techStack', e.target.value)}
                    >
                        <option value="">All Tech</option>
                        {options.techStacks.map((item) => (
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
                        <option value="">All Scores</option>
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
                        <option value="">All Types</option>
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