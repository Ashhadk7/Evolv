// @ts-nocheck
import { useState } from 'react';

export const FilterBar = ({ options, onFilterChange }) => {
    const [filters, setFilters] = useState({ industry: '', fundingStage: '', viabilityRange: '', techStack: '', matchScore: '', workType: '' });

    const handleChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const reset = { industry: '', fundingStage: '', viabilityRange: '', techStack: '', matchScore: '', workType: '' };
        setFilters(reset);
        onFilterChange(reset);
    };

    return (
        <div className={"FilterBar_filterBar"}>
            <div className={"FilterBar_filterRow"}>
                {[
                    { key: 'industry', label: 'Industry', opts: options.industries, all: 'All Industries' },
                    { key: 'fundingStage', label: 'Funding Stage', opts: options.fundingStages, all: 'All Stages' },
                    { key: 'viabilityRange', label: 'Viability Score', opts: options.viabilityRanges, all: 'All Scores' },
                    { key: 'techStack', label: 'Tech Stack', opts: options.techStacks, all: 'All Tech' },
                    { key: 'matchScore', label: 'Match Score', opts: options.matchScores, all: 'All Scores' },
                    { key: 'workType', label: 'Work Type', opts: options.workTypes, all: 'All Types' },
                ].map(({ key, label, opts, all }) => (
                    <div key={key} className={"FilterBar_filterGroup"}>
                        <label>{label}</label>
                        <select value={filters[key]} onChange={(e) => handleChange(key, e.target.value)}>
                            <option value="">{all}</option>
                            {opts.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                ))}
                <button className={"FilterBar_resetBtn"} onClick={handleReset}><i className="fas fa-undo"></i> Reset</button>
            </div>
        </div>
    );
};
